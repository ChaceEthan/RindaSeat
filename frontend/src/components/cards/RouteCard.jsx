// @ts-nocheck
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiShield, FiTrendingUp, FiTruck, FiUsers } from 'react-icons/fi';
import { Button } from '../buttons/Button';

const statusLabels = {
  boarding: 'Active boarding',
  'selling-fast': 'Selling fast',
  scheduled: 'On time',
  departed: 'Departed',
  enroute: 'En route',
};

export const RouteCard = ({ trip, onClick, compact = false }) => {
  const operator = trip.company || trip.operator || {};
  const bus = trip.bus || {};
  const totalSeats = Number(trip.totalSeats || bus.totalSeats || 40);
  const seatsLeft = Number(trip.seatsLeft || trip.availableSeats || 0);
  const bookedSeats = Number(trip.bookedSeats || Math.max(0, totalSeats - seatsLeft));
  const occupancyPercent = Number(trip.occupancyPercent || Math.round((bookedSeats / Math.max(1, totalSeats)) * 100));
  const status = statusLabels[trip.status] || trip.boardingStatus || 'On time';
  const brandColor = operator.brandColor || '#0f766e';

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white shadow-sm"
            style={{ backgroundColor: brandColor }}
          >
            {operator.logoPlaceholder || operator.name?.slice(0, 2).toUpperCase() || 'RS'}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold text-gray-950 dark:text-white">{operator.name}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {bus.type || trip.busType || 'Executive Bus'} - {bus.plateNumber || trip.busPlate || 'RAB 123 A'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-950 dark:text-white">{Number(trip.price || trip.fare || 0).toLocaleString()} RWF</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">MTN MOMO only</p>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3 border-y border-gray-100 py-4 dark:border-gray-800">
        <div>
          <div className="flex items-center gap-2">
            <FiMapPin className="h-4 w-4 text-emerald-600" />
            <p className="font-semibold text-gray-950 dark:text-white">{trip.departure}</p>
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{trip.departureTime} - {trip.departureStation}</p>
        </div>
        <div className="min-w-20 text-center">
          <FiClock className="mx-auto h-4 w-4 text-gray-400" />
          <p className="mt-1 text-xs font-semibold text-gray-600 dark:text-gray-300">{trip.duration}</p>
        </div>
        <div className="text-right">
          <div className="flex items-center justify-end gap-2">
            <p className="font-semibold text-gray-950 dark:text-white">{trip.arrival}</p>
            <FiMapPin className="h-4 w-4 text-blue-600" />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{trip.arrivalTime} - {trip.arrivalStation}</p>
        </div>
      </div>

      <div className={`mt-4 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-2 sm:grid-cols-4'}`}>
        <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2 text-xs text-emerald-700 dark:text-emerald-200">
            <FiUsers className="h-4 w-4" />
            Seats left
          </div>
          <p className="mt-1 text-lg font-bold text-gray-950 dark:text-white">{seatsLeft}</p>
        </div>
        <div className="rounded-lg bg-blue-50 p-3 dark:bg-blue-950/30">
          <div className="flex items-center gap-2 text-xs text-blue-700 dark:text-blue-200">
            <FiTrendingUp className="h-4 w-4" />
            Occupancy
          </div>
          <p className="mt-1 text-lg font-bold text-gray-950 dark:text-white">{occupancyPercent}%</p>
        </div>
        {!compact && (
          <>
            <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <FiTruck className="h-4 w-4" />
                Platform
              </div>
              <p className="mt-1 text-sm font-bold text-gray-950 dark:text-white">{trip.platform}</p>
            </div>
            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/30">
              <div className="flex items-center gap-2 text-xs text-amber-700 dark:text-amber-200">
                <FiShield className="h-4 w-4" />
                Boarding
              </div>
              <p className="mt-1 text-sm font-bold text-gray-950 dark:text-white">{status}</p>
            </div>
          </>
        )}
      </div>

      <div className="mt-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-600 dark:text-gray-300">
          <span>Passenger load</span>
          <span>{bookedSeats}/{totalSeats} booked</span>
        </div>
        <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-800">
          <div
            className="h-2 rounded-full bg-gradient-to-r from-emerald-500 via-blue-500 to-amber-400"
            style={{ width: `${Math.min(100, Math.max(4, occupancyPercent))}%` }}
          />
        </div>
      </div>

      {trip.isCrossBorder && (
        <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-3 text-xs text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">
          Cross-border route: {(trip.borderCrossings || []).join(', ') || 'Border desk verification'} - QR ticket retained after MTN MOMO payment.
        </div>
      )}

      <div className="mt-5 flex gap-2">
        <Button size="sm" onClick={onClick} className="flex-1">
          Reserve Seats
        </Button>
        <Button variant="outline" size="sm" onClick={onClick}>
          Seat Map
        </Button>
      </div>
    </motion.article>
  );
};

export default RouteCard;
