// @ts-nocheck
const lockedSeats = new Map();
const DEFAULT_LOCK_TTL_MS = (Number(process.env.SEAT_LOCK_TIMEOUT_MINUTES) || 5) * 60 * 1000;

const getLockKey = (tripId, seatNumber) => `${tripId}:${seatNumber}`;

const lockSeat = ({ tripId, seatNumber, userId, ttlMs = DEFAULT_LOCK_TTL_MS }) => {
  const key = getLockKey(tripId, seatNumber);
  const existingLock = lockedSeats.get(key);
  const now = Date.now();

  if (existingLock && existingLock.expiresAt > now && existingLock.userId !== userId) {
    return {
      locked: false,
      expiresAt: existingLock.expiresAt
    };
  }

  const expiresAt = now + ttlMs;
  lockedSeats.set(key, { userId, expiresAt });

  return {
    locked: true,
    expiresAt
  };
};

const releaseSeat = ({ tripId, seatNumber, userId }) => {
  const key = getLockKey(tripId, seatNumber);
  const existingLock = lockedSeats.get(key);

  if (!existingLock || existingLock.userId !== userId) {
    return false;
  }

  lockedSeats.delete(key);
  return true;
};

const cleanupExpiredLocks = () => {
  const now = Date.now();

  lockedSeats.forEach((lock, key) => {
    if (lock.expiresAt <= now) {
      lockedSeats.delete(key);
    }
  });
};

setInterval(cleanupExpiredLocks, 60 * 1000).unref();

module.exports = {
  lockSeat,
  releaseSeat,
  cleanupExpiredLocks
};
