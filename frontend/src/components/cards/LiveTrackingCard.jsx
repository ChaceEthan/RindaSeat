// @ts-nocheck
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiNavigation, FiTruck, FiUsers } from 'react-icons/fi';
import { getLiveTrackingSnapshot } from '../../data/rwandaTransport';
import { Button } from '../buttons/Button';

export const LiveTrackingCard = ({ trip, tracking, onReserve }) => {
  const snapshot = tracking || getLiveTrackingSnapshot(trip);
  const remainingStops = snapshot.remainingStops?.length
    ? snapshot.remainingStops
    : [{ name: snapshot.nextStop, eta: snapshot.etaToNextStop }];
  const occupancyPercent = Math.round((snapshot.passengersOnboard / Math.max(1, snapshot.totalSeats)) * 100);

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="border-b border-gray-100 bg-gradient-to-r from-emerald-50 via-white to-blue-50 p-5 dark:border-gray-800 dark:from-emerald-950/30 dark:via-gray-900 dark:to-blue-950/30">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700 shadow-sm dark:border-emerald-900 dark:bg-gray-950 dark:text-emerald-200">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Live tracking
            </div>
            <h3 className="mt-3 text-lg font-bold text-gray-950 dark:text-white">{snapshot.operator}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {snapshot.departure} to {snapshot.arrival}
            </p>
          </div>
          <div className="rounded-lg bg-white px-4 py-3 text-right shadow-sm dark:bg-gray-950">
            <p className="text-xs text-gray-500 dark:text-gray-400">Remaining seats</p>
            <p className="text-2xl font-bold text-gray-950 dark:text-white">{snapshot.seatsLeft}</p>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="mb-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FiNavigation className="h-4 w-4 text-emerald-600" />
              Current
            </div>
            <p className="mt-1 font-semibold text-gray-950 dark:text-white">{snapshot.currentLocation}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FiClock className="h-4 w-4 text-blue-600" />
              Next ETA
            </div>
            <p className="mt-1 font-semibold text-gray-950 dark:text-white">{snapshot.etaToNextStop}</p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <FiUsers className="h-4 w-4 text-amber-600" />
              Load
            </div>
            <p className="mt-1 font-semibold text-gray-950 dark:text-white">{occupancyPercent}%</p>
          </div>
        </div>

        <div className="relative mb-5 h-16 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
          <div className="absolute inset-x-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gray-300 dark:bg-gray-700" />
          <div
            className="absolute left-4 top-1/2 h-1 -translate-y-1/2 rounded-full bg-gradient-to-r from-emerald-500 to-blue-500"
            style={{ width: `calc(${snapshot.progressPercent}% - 1rem)` }}
          />
          <motion.div
            animate={{ left: `calc(${snapshot.progressPercent}% - 14px)` }}
            transition={{ type: 'spring', stiffness: 80, damping: 18 }}
            className="absolute top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-gray-950 text-white shadow-lg dark:bg-white dark:text-gray-950"
          >
            <FiTruck className="h-4 w-4" />
          </motion.div>
          {[0, 33, 66, 100].map((position) => (
            <span
              key={position}
              className="absolute top-1/2 h-2 w-2 -translate-y-1/2 rounded-full border-2 border-white bg-gray-400 dark:border-gray-800"
              style={{ left: `calc(${position}% - 4px)` }}
            />
          ))}
        </div>

        <div className="rounded-lg border border-blue-100 bg-blue-50 p-4 dark:border-blue-900 dark:bg-blue-950/30">
          <div className="flex items-start gap-3">
            <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-blue-700 dark:text-blue-200" />
            <div>
              <p className="text-xs font-semibold uppercase text-blue-700 dark:text-blue-200">Next stop</p>
              <p className="font-semibold text-blue-950 dark:text-blue-50">{snapshot.nextStop}</p>
              <p className="mt-1 text-xs text-blue-700 dark:text-blue-200">
                GPS {Number(snapshot.latitude).toFixed(4)}, {Number(snapshot.longitude).toFixed(4)}
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <p className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Upcoming stops</p>
          <div className="space-y-2">
            {remainingStops.slice(0, 5).map((stop) => (
              <div key={`${stop.name}-${stop.eta}`} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm dark:bg-gray-800">
                <span className="font-medium text-gray-800 dark:text-gray-200">{stop.name}</span>
                <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{stop.eta}</span>
              </div>
            ))}
          </div>
        </div>

        <Button size="sm" className="mt-5 w-full" onClick={onReserve}>
          Reserve Remaining Seat
        </Button>
      </div>
    </motion.article>
  );
};

export default LiveTrackingCard;
