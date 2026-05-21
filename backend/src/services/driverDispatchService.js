// @ts-nocheck
const DRIVER_CHANNELS = {
  location: 'driver-location',
  pickupMarker: 'passenger-pickup-marker',
  seatInventory: 'seat-inventory',
  boardingConfirmation: 'boarding-confirmation'
};

const normalizePickupRequest = ({
  tripId,
  passengerName,
  passengerPhone,
  pickupPoint,
  latitude,
  longitude,
  seatCount = 1,
  etaToPickup
} = {}) => ({
  tripId,
  passengerName,
  passengerPhone,
  pickupPoint,
  latitude: Number(latitude),
  longitude: Number(longitude),
  seatCount: Number(seatCount) || 1,
  etaToPickup,
  markerType: 'roadside-pickup',
  status: 'pending-driver-confirmation',
  createdAt: new Date().toISOString()
});

const buildDriverTripSnapshot = ({ trip = {}, pickupQueue = [] } = {}) => ({
  tripId: trip.id,
  routeId: trip.routeId,
  departure: trip.departure,
  arrival: trip.arrival,
  routeStops: trip.routeStops || [],
  seatsLeft: Number(trip.seatsLeft || trip.availableSeats || 0),
  passengersOnboard: Number(trip.bookedSeats || 0),
  boardingStatus: trip.boardingStatus || trip.status || 'scheduled',
  pickupQueue: pickupQueue.map(normalizePickupRequest),
  actions: ['scanQrTicket', 'confirmBoarding', 'releaseNoShowSeat', 'syncSeatStatus'],
  channels: DRIVER_CHANNELS
});

module.exports = {
  DRIVER_CHANNELS,
  normalizePickupRequest,
  buildDriverTripSnapshot
};
