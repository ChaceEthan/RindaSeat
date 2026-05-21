// @ts-nocheck
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { FiArrowRight, FiCheckCircle, FiCreditCard, FiMapPin, FiShield, FiSmartphone } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/buttons/Button';
import { LiveTrackingCard } from '../../components/cards/LiveTrackingCard';
import { RoadsidePickupCard } from '../../components/cards/RoadsidePickupCard';
import { RouteCard } from '../../components/cards/RouteCard';
import { Select, TextInput } from '../../components/forms/FormInputs';
import {
  DRIVER_APP_SERVICE_BLUEPRINT,
  RWANDA_DISTRICTS,
  RWANDA_OPERATORS,
  RWANDA_STATIONS,
  SCHEDULE_TIMES,
  getLiveTrackingSnapshot,
  searchRwandaTrips,
} from '../../data/rwandaTransport';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const crossBorderDestinations = ['Nairobi', 'Kampala', 'Goma', 'Bujumbura', 'Dar es Salaam'];

const intelligenceStats = [
  ['MTN MOMO', 'single payment rail'],
  ['QR', 'boarding ticket'],
  ['Live ETA', 'pickup timing'],
  ['Driver app', 'architecture ready'],
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({ from: 'Kigali', to: '', date: '' });

  const stationOptions = useMemo(() => (
    Array.from(new Map(RWANDA_STATIONS.map((station) => [station.city, { label: station.city, value: station.city }])).values())
      .sort((a, b) => a.label.localeCompare(b.label))
  ), []);

  const spotlightTrips = useMemo(() => (
    ['Huye', 'Musanze', 'Rubavu']
      .map((destination) => searchRwandaTrips({ from: 'Kigali', to: destination, limit: 1 })[0])
      .filter(Boolean)
  ), []);
  const liveTrip = useMemo(() => searchRwandaTrips({ from: 'Kigali', to: 'Musanze', limit: 1 })[0] || spotlightTrips[0], [spotlightTrips]);
  const liveSnapshot = useMemo(() => getLiveTrackingSnapshot(liveTrip), [liveTrip]);
  const roadsideTrip = useMemo(() => searchRwandaTrips({ from: 'Kigali', to: 'Huye', limit: 1 })[0] || spotlightTrips[0], [spotlightTrips]);
  const crossBorderTrips = useMemo(() => (
    crossBorderDestinations
      .map((destination) => searchRwandaTrips({ from: 'Kigali', to: destination, limit: 1 })[0])
      .filter(Boolean)
  ), []);

  const provinceCoverage = useMemo(() => (
    RWANDA_DISTRICTS.reduce((groups, district) => {
      groups[district.province] = [...(groups[district.province] || []), district.name];
      return groups;
    }, {})
  ), []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/trips?${params.toString()}`);
  };

  const handleBookTrip = (trip) => {
    if (trip?.id) navigate(`/booking/${trip.id}`);
    else navigate('/trips');
  };

  return (
    <div className="min-h-screen overflow-x-hidden bg-white text-gray-950 dark:bg-gray-950 dark:text-white">
      <section className="relative isolate overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(15,23,42,0.95),rgba(6,78,59,0.72),rgba(30,41,59,0.95))]" />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.055)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.045)_1px,transparent_1px)] bg-[size:64px_64px] opacity-50" />
        <div className="absolute inset-0 backdrop-blur-[1px]" />

        <motion.div
          variants={containerVariants}
          initial="visible"
          animate="visible"
          className="relative z-10 mx-auto grid min-h-[76vh] max-w-7xl items-center gap-10 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8"
        >
          <div>
            <motion.div variants={itemVariants} className="relative mb-8 flex justify-center lg:justify-start">
              <h1 className="absolute -top-9 left-1/2 w-[min(920px,95vw)] -translate-x-1/2 select-none text-center text-5xl font-black leading-none text-white/10 sm:text-7xl lg:left-0 lg:translate-x-0 lg:text-left lg:text-8xl">
                Book Rwanda Bus Tickets
              </h1>
              <div className="relative z-10 max-w-full rounded-full border border-white/20 bg-white/10 px-4 py-2 text-center shadow-2xl shadow-emerald-950/40 backdrop-blur-xl sm:px-5">
                <span className="text-[11px] font-bold uppercase text-emerald-100 sm:text-sm">
                  RINDASEAT RWANDA TRANSPORT PLATFORM
                </span>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="relative">
              <h2 className="max-w-4xl text-center text-4xl font-black leading-[1.02] sm:text-6xl lg:text-left lg:text-7xl">
                <span className="block">Book Rwanda</span>
                <span className="block">Bus Tickets</span>
              </h2>
              <p className="mt-6 max-w-2xl text-center text-lg leading-8 text-slate-200 lg:text-left">
                Intercity and cross-border transport with live seat intelligence, roadside pickup, MTN MOMO payment, and QR boarding in one polished passenger flow.
              </p>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {intelligenceStats.map(([value, label]) => (
                <div key={value} className="rounded-lg border border-white/[0.12] bg-white/[0.08] p-4 backdrop-blur-xl">
                  <p className="text-lg font-bold">{value}</p>
                  <p className="mt-1 text-xs text-slate-300">{label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={itemVariants} className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button size="lg" onClick={() => navigate('/trips')} className="px-8">
                Start Booking
              </Button>
              <Button variant="secondary" size="lg" onClick={() => navigate('/tickets')} className="px-8">
                View QR Tickets
              </Button>
            </motion.div>
          </div>

          <motion.div variants={itemVariants} className="relative">
            <div className="rounded-lg border border-white/[0.15] bg-white/10 p-4 shadow-2xl shadow-slate-950/40 backdrop-blur-xl">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase text-emerald-200">Nyabugogo live desk</p>
                  <p className="text-lg font-bold">Departures now</p>
                </div>
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-emerald-950">Active</span>
              </div>
              <div className="space-y-3">
                {spotlightTrips.map((trip) => (
                  <button
                    type="button"
                    key={trip.id}
                    onClick={() => handleBookTrip(trip)}
                    className="w-full rounded-lg border border-white/10 bg-slate-950/[0.45] p-4 text-left transition hover:border-emerald-300/70"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{trip.departure} to {trip.arrival}</p>
                        <p className="text-xs text-slate-300">{trip.company.name} - {trip.bus.type}</p>
                      </div>
                      <p className="text-right text-sm font-bold text-emerald-200">{trip.seatsLeft} seats</p>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full bg-white/10">
                      <div className="h-1.5 rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-amber-300" style={{ width: `${trip.occupancyPercent}%` }} />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      <motion.section
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-20 -mt-14 px-4 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-6xl rounded-lg border border-gray-200 bg-white p-5 shadow-2xl dark:border-gray-700 dark:bg-gray-900 sm:p-6">
          <form onSubmit={handleSearch} className="grid gap-4 md:grid-cols-[1fr_1fr_1fr_auto] md:items-end">
            <Select
              label="From"
              options={stationOptions}
              value={searchForm.from}
              onChange={(event) => setSearchForm({ ...searchForm, from: event.target.value })}
            />
            <Select
              label="To"
              options={stationOptions}
              value={searchForm.to}
              onChange={(event) => setSearchForm({ ...searchForm, to: event.target.value })}
            />
            <TextInput
              label="Date"
              type="date"
              value={searchForm.date}
              onChange={(event) => setSearchForm({ ...searchForm, date: event.target.value })}
            />
            <Button type="submit" size="lg" className="w-full md:w-auto">
              Search Trips
            </Button>
          </form>
        </div>
      </motion.section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-sm font-semibold text-primary-600">Real Rwanda transport flow</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">Popular operators and live seat demand</h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/trips')}>
              Compare all routes
            </Button>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {spotlightTrips.map((trip) => (
              <RouteCard key={trip.id} trip={trip} onClick={() => handleBookTrip(trip)} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-gray-50 px-4 py-16 dark:bg-gray-900 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="text-sm font-semibold text-primary-600">Cross-border corridors</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">Kigali connected to East Africa</h2>
            <p className="mt-4 leading-7 text-gray-600 dark:text-gray-400">
              The marketplace now models regional coach journeys to Kenya, Uganda, DR Congo, Burundi, and Tanzania while keeping MTN MOMO and QR ticketing consistent.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-3">
              {[
                [RWANDA_DISTRICTS.length, 'Rwanda districts'],
                [crossBorderTrips.length, 'regional corridors'],
                [RWANDA_OPERATORS.length, 'operators'],
                [SCHEDULE_TIMES.length, 'daily time slots'],
              ].map(([value, label]) => (
                <div key={label} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-950">
                  <p className="text-2xl font-bold text-gray-950 dark:text-white">{value}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {crossBorderTrips.map((trip) => (
              <button
                key={trip.id}
                type="button"
                onClick={() => handleBookTrip(trip)}
                className="rounded-lg border border-gray-200 bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md dark:border-gray-700 dark:bg-gray-950"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-bold text-gray-950 dark:text-white">{trip.departure} to {trip.arrival}</p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{trip.duration} - {trip.distanceKm} km</p>
                  </div>
                  <FiArrowRight className="h-5 w-5 text-primary-600" />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200">
                    {trip.seatsLeft} seats left
                  </span>
                  <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-950/40 dark:text-blue-200">
                    {trip.company.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <p className="text-sm font-semibold text-primary-600">Live bus intelligence</p>
              <h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">Track buses after they leave Nyabugogo</h2>
            </div>
            <p className="leading-7 text-gray-600 dark:text-gray-400">
              Passengers at Sonatubes, Gishushu, Remera, Nyacyonga, Kabuga, and other corridor stops can see departure status, ETA, remaining seats, and pickup timing.
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
            <LiveTrackingCard trip={liveTrip} tracking={liveSnapshot} onReserve={() => handleBookTrip(liveTrip)} />
            <RoadsidePickupCard trip={roadsideTrip} onBook={() => handleBookTrip(roadsideTrip)} />
          </div>
        </div>
      </section>

      <section className="bg-gray-950 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <p className="text-sm font-semibold text-emerald-300">Driver app foundation</p>
            <h2 className="mt-2 text-3xl font-bold sm:text-4xl">Shared dispatch architecture prepared</h2>
            <p className="mt-4 leading-7 text-slate-300">
              The frontend transport layer now exposes driver-ready route stops, pickup markers, seat status, QR boarding actions, and realtime channel names for the future RindaSeat Driver App.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ['Passenger markers', DRIVER_APP_SERVICE_BLUEPRINT.driverQueueFields.join(', ')],
              ['Boarding actions', DRIVER_APP_SERVICE_BLUEPRINT.boardingActions.join(', ')],
              ['Realtime channels', DRIVER_APP_SERVICE_BLUEPRINT.realtimeChannels.join(', ')],
              ['Seat sync', DRIVER_APP_SERVICE_BLUEPRINT.sharedTripFields.join(', ')],
            ].map(([title, description]) => (
              <div key={title} className="rounded-lg border border-white/10 bg-white/5 p-4">
                <FiCheckCircle className="mb-3 h-5 w-5 text-emerald-300" />
                <p className="font-semibold">{title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-300">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 lg:grid-cols-[1fr_1fr]">
          <div>
            <p className="text-sm font-semibold text-primary-600">District coverage</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950 dark:text-white sm:text-4xl">Rwanda-wide station coverage</h2>
            <div className="mt-6 space-y-4">
              {Object.entries(provinceCoverage).map(([province, districts]) => (
                <div key={province} className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-semibold text-gray-950 dark:text-white">{province}</h3>
                    <span className="text-xs font-semibold text-primary-600">{districts.length} districts</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {districts.map((district) => (
                      <span key={district} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                        {district}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <p className="text-sm font-semibold text-primary-600">Passenger-ready flow</p>
            <h3 className="mt-2 text-2xl font-bold text-gray-950 dark:text-white">Search, pay, board, and track</h3>
            <div className="mt-6 grid gap-4">
              {[
                [FiSmartphone, 'Mobile booking', 'Route search, seat reservation, and passenger details are optimized for phone screens.'],
                [FiCreditCard, 'MTN MOMO payment', 'The booking flow keeps payment focused on MTN MOMO for a Rwanda-first checkout.'],
                [FiShield, 'QR ticket boarding', 'Confirmed bookings keep operator, plate, seats, fare, and QR data together.'],
                [FiMapPin, 'Pickup visibility', 'Roadside pickup data is structured for driver markers and passenger ETA updates.'],
              ].map(([Icon, title, description]) => (
                <div key={title} className="flex gap-4 rounded-lg bg-gray-50 p-4 dark:bg-gray-800">
                  <Icon className="mt-1 h-5 w-5 shrink-0 text-primary-600" />
                  <div>
                    <p className="font-semibold text-gray-950 dark:text-white">{title}</p>
                    <p className="mt-1 text-sm leading-6 text-gray-600 dark:text-gray-400">{description}</p>
                  </div>
                </div>
              ))}
            </div>
            <Button size="lg" className="mt-6 w-full" onClick={() => navigate('/trips')}>
              Book a Rwanda Trip
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
