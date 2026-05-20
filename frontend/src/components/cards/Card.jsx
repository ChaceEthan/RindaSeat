// @ts-nocheck
import { motion } from 'framer-motion';

export const Card = ({ children, className = '', hover = true, ...props }) => (
  <motion.div
    whileHover={hover ? { y: -4 } : {}}
    className={`bg-white dark:bg-gray-800 rounded-lg shadow-md dark:shadow-xl hover:shadow-lg dark:hover:shadow-2xl transition-shadow duration-300 p-6 border border-gray-100 dark:border-gray-700 ${className}`}
    {...props}
  >
    {children}
  </motion.div>
);

export const TripCard = ({ trip, onClick }) => {
  const amenities = trip.amenities || trip.company?.amenities || [];

  return (
    <Card onClick={onClick} className="cursor-pointer hover:shadow-premium">
      <div className="grid gap-5 lg:grid-cols-12 lg:items-center">
        <div className="lg:col-span-2 flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-lg flex items-center justify-center shadow-sm"
            style={{ backgroundColor: trip.company?.brandColor || '#4f94f7' }}
          >
            <span className="text-white font-bold text-lg">{trip.company?.name?.slice(0, 2).toUpperCase() || 'RS'}</span>
          </div>
          <div className="lg:hidden">
            <p className="font-semibold text-gray-900 dark:text-white">{trip.company?.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{trip.bus?.type}</p>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="flex items-center gap-4">
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{trip.departureTime}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{trip.departure}</p>
            </div>
            <div className="flex flex-col items-center gap-1 flex-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">{trip.duration}</p>
              <div className="w-full h-0.5 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full" />
              <p className="text-xs text-gray-500 dark:text-gray-400">{trip.distanceKm} km</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{trip.arrivalTime}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{trip.arrival}</p>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <p className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">{trip.company?.name}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{trip.bus?.type} - {trip.bus?.plateNumber}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className="text-sm font-semibold text-yellow-600">{trip.company?.rating?.toFixed?.(1) || trip.company?.rating}</span>
            <span className="text-xs text-gray-500 dark:text-gray-400">({trip.company?.reviewCount || 0} reviews)</span>
          </div>
          <div className="flex flex-wrap gap-1 mt-2">
            {amenities.slice(0, 3).map((amenity) => (
              <span key={amenity} className="px-2 py-1 rounded bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-200 text-xs">
                {amenity}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 lg:text-right">
          <div className="flex lg:block items-end justify-between">
            <div>
              <div className="flex lg:justify-end items-baseline gap-1">
                <span className="text-2xl font-bold text-primary-600">{Number(trip.price || 0).toLocaleString()}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">RWF</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400">{trip.seatsLeft} seats left</p>
            </div>
            <span className="text-primary-600 font-semibold">Book Now</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default Card;
