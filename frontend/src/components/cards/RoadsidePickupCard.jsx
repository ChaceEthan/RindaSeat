// @ts-nocheck
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FiClock, FiMapPin, FiNavigation, FiPhone, FiUser, FiUsers } from 'react-icons/fi';
import { getRoadsidePickupOptions } from '../../data/rwandaTransport';
import { Button } from '../buttons/Button';
import { TextInput } from '../forms/FormInputs';

export const RoadsidePickupCard = ({ trip, onBook }) => {
  const pickupPoints = useMemo(() => getRoadsidePickupOptions(trip), [trip]);
  const [selectedPoint, setSelectedPoint] = useState(pickupPoints[0]);
  const [passenger, setPassenger] = useState({ name: '', phone: '' });

  const approachingBuses = pickupPoints.slice(0, 3).map((point, index) => ({
    id: `${point.id}-${index}`,
    operator: trip?.company?.name || ['Volcano Express', 'Trinity', 'Jaguar Executive Coaches'][index],
    route: `${trip?.departure || 'Kigali'} to ${trip?.arrival || ['Huye', 'Rubavu', 'Kampala'][index]}`,
    currentLocation: index === 0 ? 'Departed Nyabugogo' : pickupPoints[index - 1]?.name,
    nextStop: point.name,
    eta: point.eta,
    seatsLeft: point.seatsLeft,
    fare: point.fare,
    status: index === 0 ? 'Approaching' : 'En route',
  }));

  const handleReserve = (bus) => {
    onBook?.({
      bus,
      pickup: selectedPoint,
      passenger,
      driverNotification: {
        passengerName: passenger.name || 'Passenger',
        passengerPhone: passenger.phone || 'Phone pending',
        latitude: selectedPoint.latitude,
        longitude: selectedPoint.longitude,
        pickupPoint: selectedPoint.name,
        markerType: 'roadside-pickup',
      },
    });
  };

  return (
    <motion.article
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200">
          <FiNavigation className="h-5 w-5" />
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-200">Catch Bus On Route</p>
          <h3 className="text-lg font-bold text-gray-950 dark:text-white">Roadside pickup after departure</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            Reserve a remaining seat, share GPS, and send the driver a pickup marker before the bus reaches your stop.
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Pickup point</p>
          <div className="space-y-2">
            {pickupPoints.map((point) => (
              <button
                key={point.id}
                type="button"
                onClick={() => setSelectedPoint(point)}
                className={`w-full rounded-lg border p-3 text-left transition ${
                  selectedPoint?.id === point.id
                    ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30'
                    : 'border-gray-200 bg-gray-50 hover:border-emerald-300 dark:border-gray-700 dark:bg-gray-800'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2">
                    <FiMapPin className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                    <div>
                      <p className="font-semibold text-gray-950 dark:text-white">{point.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{point.roadNote}</p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{point.distanceKm} km</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <TextInput
              label="Passenger name"
              value={passenger.name}
              onChange={(event) => setPassenger((current) => ({ ...current, name: event.target.value }))}
              placeholder="Name"
            />
            <TextInput
              label="Phone"
              value={passenger.phone}
              onChange={(event) => setPassenger((current) => ({ ...current, phone: event.target.value }))}
              placeholder="+250..."
            />
          </div>

          <div className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <p className="mb-2 text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Driver marker</p>
            <div className="grid gap-2 text-sm">
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiUser className="h-4 w-4" />
                {passenger.name || 'Passenger name pending'}
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiPhone className="h-4 w-4" />
                {passenger.phone || 'Phone pending'}
              </div>
              <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                <FiMapPin className="h-4 w-4" />
                {selectedPoint.name}: {selectedPoint.latitude.toFixed(4)}, {selectedPoint.longitude.toFixed(4)}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {approachingBuses.map((bus) => (
              <div key={bus.id} className="rounded-lg border border-gray-200 p-3 dark:border-gray-700">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-gray-950 dark:text-white">{bus.operator}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{bus.route}</p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-950/30 dark:text-orange-200">
                    {bus.status}
                  </span>
                </div>
                <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                  <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                    <FiClock className="mb-1 h-3.5 w-3.5 text-blue-600" />
                    <p className="font-semibold text-gray-950 dark:text-white">{bus.eta}</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                    <FiUsers className="mb-1 h-3.5 w-3.5 text-emerald-600" />
                    <p className="font-semibold text-gray-950 dark:text-white">{bus.seatsLeft} seats</p>
                  </div>
                  <div className="rounded-md bg-gray-50 p-2 dark:bg-gray-800">
                    <p className="font-semibold text-gray-950 dark:text-white">{Number(bus.fare).toLocaleString()} RWF</p>
                    <p className="text-gray-500 dark:text-gray-400">MTN MOMO</p>
                  </div>
                </div>
                <Button size="sm" className="mt-3 w-full" onClick={() => handleReserve(bus)}>
                  Reserve Pickup
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default RoadsidePickupCard;
