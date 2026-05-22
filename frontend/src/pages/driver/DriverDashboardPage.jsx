// @ts-nocheck
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiGrid, FiMapPin, FiNavigation, FiRadio, FiUsers } from 'react-icons/fi';
import { Button } from '../../components/buttons/Button';
import { Card } from '../../components/cards/Card';
import { LoadingSpinner } from '../../components/loaders/Loaders';
import { trackingService, tripService } from '../../services/api';
import { connectSocket } from '../../services/socket';

const statusClass = (status) => (
  status === 'green' || status === 'boarded'
    ? 'bg-emerald-500 text-white'
    : 'bg-red-500 text-white'
);

export const DriverDashboardPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState(null);
  const [tripOptions, setTripOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const activeTripId = tripId || tripOptions[0]?.id;

  useEffect(() => {
    const loadTrips = async () => {
      try {
        const response = await tripService.searchTrips({ from: 'Kigali', limit: 6 });
        setTripOptions(response.trips || response.data || []);
      } catch (error) {
        setTripOptions([]);
      }
    };

    loadTrips();
  }, []);

  useEffect(() => {
    if (!activeTripId) return undefined;

    let mounted = true;
    const loadDashboard = async () => {
      setIsLoading(true);
      try {
        const response = await trackingService.getDriverDashboard(activeTripId);
        if (mounted) setDashboard(response.dashboard || response.data);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    loadDashboard();

    const socket = connectSocket();
    if (socket) {
      socket.emit('joinDriverTrip', activeTripId);
      socket.on('driver-location', (payload) => {
        setDashboard((current) => current && ({
          ...current,
          tracking: { ...current.tracking, ...payload }
        }));
      });
      socket.on('passenger-pickup-marker', (marker) => {
        setDashboard((current) => current && ({
          ...current,
          passengerMarkers: [marker, ...(current.passengerMarkers || []).filter((item) => item.id !== marker.id)]
        }));
      });
    }

    return () => {
      mounted = false;
      if (socket) {
        socket.emit('leaveTripRoom', activeTripId);
        socket.off('driver-location');
        socket.off('passenger-pickup-marker');
      }
    };
  }, [activeTripId]);

  const tracking = dashboard?.tracking;
  const occupancy = dashboard?.occupancy || {};
  const passengerMarkers = dashboard?.passengerMarkers || [];
  const pickupIndicators = dashboard?.pickupIndicators || [];
  const routeStops = tracking?.remainingStops || [];

  const mapMarkers = useMemo(() => (
    passengerMarkers.slice(0, 5).map((marker, index) => ({
      ...marker,
      x: 18 + (index * 15),
      y: 62 - (index * 9),
    }))
  ), [passengerMarkers]);

  if (isLoading && !dashboard) {
    return <div className="flex min-h-screen items-center justify-center"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 dark:bg-gray-950 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-primary-600">Driver live operations</p>
            <h1 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">Trip Dashboard</h1>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={activeTripId || ''}
              onChange={(event) => navigate(`/driver/${event.target.value}`)}
              className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            >
              {tripOptions.map((trip) => (
                <option key={trip.id} value={trip.id}>{trip.departure} to {trip.arrival} - {trip.departureTime}</option>
              ))}
            </select>
            <Button onClick={() => navigate('/trips')}>Find Trip</Button>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{tracking?.departure} to {tracking?.arrival}</p>
                <h2 className="text-xl font-bold text-gray-950 dark:text-white">{tracking?.operator || 'RindaSeat Driver'}</h2>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                <FiRadio className="h-4 w-4" />
                Live
              </span>
            </div>

            <div className="relative h-[420px] overflow-hidden rounded-lg border border-gray-200 bg-[linear-gradient(135deg,#e0f2fe,#dcfce7_45%,#fef3c7)] dark:border-gray-800">
              <div className="absolute left-[10%] top-[65%] h-2 w-[82%] -rotate-12 rounded-full bg-gray-800/70" />
              <div className="absolute left-[14%] top-[66%] h-1 w-[75%] -rotate-12 rounded-full bg-white/80" />
              {routeStops.slice(0, 5).map((stop, index) => (
                <div
                  key={`${stop.name}-${stop.eta}`}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-1 text-center"
                  style={{ left: `${18 + (index * 17)}%`, top: `${68 - (index * 9)}%` }}
                >
                  <span className="h-3 w-3 rounded-full bg-gray-950 ring-4 ring-white dark:bg-white dark:ring-gray-900" />
                  <span className="max-w-[90px] rounded bg-white/85 px-2 py-1 text-[11px] font-semibold text-gray-800 shadow dark:bg-gray-900/90 dark:text-white">{stop.name}</span>
                </div>
              ))}
              <motion.div
                animate={{ left: `${Math.max(14, Math.min(86, tracking?.progressPercent || 30))}%` }}
                className="absolute top-[48%] flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gray-950 text-white shadow-2xl"
              >
                <FiNavigation className="h-5 w-5" />
              </motion.div>
              {mapMarkers.map((marker) => (
                <div
                  key={marker.id}
                  className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                  style={{ left: `${marker.x}%`, top: `${marker.y}%` }}
                >
                  <span className={`flex h-8 w-8 items-center justify-center rounded-full shadow-lg ${statusClass(marker.status)}`}>
                    <FiMapPin className="h-4 w-4" />
                  </span>
                  <span className="mt-1 rounded bg-white/90 px-2 py-0.5 text-[11px] font-semibold text-gray-800 shadow dark:bg-gray-900 dark:text-white">{marker.pickupPoint}</span>
                </div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6">
            <Card>
              <div className="grid grid-cols-3 gap-3 text-center">
                {[
                  ['Seats', occupancy.remainingSeats ?? tracking?.seatsLeft ?? 0],
                  ['Load', `${occupancy.percentage ?? tracking?.occupancyPercent ?? 0}%`],
                  ['ETA', tracking?.etaToNextStop || 'Live'],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <p className="text-xl font-bold text-gray-950 dark:text-white">{value}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                  </div>
                ))}
              </div>
              <div className="mt-5 h-3 rounded-full bg-gray-200 dark:bg-gray-800">
                <div className="h-3 rounded-full bg-gradient-to-r from-emerald-500 via-amber-400 to-red-500" style={{ width: `${occupancy.percentage ?? tracking?.occupancyPercent ?? 0}%` }} />
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-bold text-gray-950 dark:text-white">Pickup Queue</h2>
                <FiUsers className="h-5 w-5 text-primary-600" />
              </div>
              <div className="space-y-3">
                {pickupIndicators.slice(0, 6).map((marker, index) => (
                  <div key={`${marker.pickupPoint}-${index}`} className="flex items-center justify-between rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                    <div>
                      <p className="font-semibold text-gray-950 dark:text-white">{marker.pickupPoint}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Passenger marker active</p>
                    </div>
                    <span className={`h-3 w-3 rounded-full ${marker.status === 'green' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <div className="mb-4 flex items-center gap-3">
                <FiGrid className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-bold text-gray-950 dark:text-white">QR Boarding</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="outline" className="inline-flex items-center justify-center"><FiGrid className="mr-2 h-4 w-4" /> Scan Ticket</Button>
                <Button className="inline-flex items-center justify-center"><FiCheckCircle className="mr-2 h-4 w-4" /> Confirm Boarding</Button>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardPage;
