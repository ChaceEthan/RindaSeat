// @ts-nocheck
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/buttons/Button';
import { TextInput, Select } from '../../components/forms/FormInputs';
import {
  RWANDA_DISTRICTS,
  RWANDA_OPERATORS,
  RWANDA_STATIONS,
  SCHEDULE_TIMES,
  searchRwandaTrips,
} from '../../data/rwandaTransport';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0 },
};

const popularRoutes = [
  { from: 'Kigali', to: 'Huye', note: 'Southern education corridor' },
  { from: 'Kigali', to: 'Musanze', note: 'Northern and Virunga route' },
  { from: 'Kigali', to: 'Rubavu', note: 'Lake Kivu express' },
  { from: 'Kigali', to: 'Nyagatare', note: 'Eastern cattle corridor' },
  { from: 'Huye', to: 'Rusizi', note: 'Southern to western route' },
  { from: 'Musanze', to: 'Rubavu', note: 'Northern lake connector' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({ from: '', to: '', date: '' });
  const stationOptions = useMemo(() => (
    Array.from(new Map(RWANDA_STATIONS.map((station) => [station.city, { label: station.city, value: station.city }])).values())
      .sort((a, b) => a.label.localeCompare(b.label))
  ), []);
  const provinceCoverage = useMemo(() => (
    RWANDA_DISTRICTS.reduce((groups, district) => {
      groups[district.province] = [...(groups[district.province] || []), district.name];
      return groups;
    }, {})
  ), []);
  const sampleTrips = useMemo(() => searchRwandaTrips({ from: 'Kigali', limit: 6 }), []);

  const handleSearch = (event) => {
    event.preventDefault();
    const params = new URLSearchParams();
    Object.entries(searchForm).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    navigate(`/trips?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <section className="relative min-h-[680px] overflow-hidden bg-gray-950 text-white">
        <div className="absolute inset-0 opacity-95">
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:72px_72px]" />
          <div className="absolute left-[8%] top-[18%] h-24 w-64 rounded-lg border border-white/20 bg-white/10 shadow-2xl" />
          <div className="absolute right-[6%] top-[12%] h-64 w-80 rounded-lg border border-white/15 bg-gray-900 shadow-2xl">
            <div className="grid grid-cols-3 gap-2 p-4 text-xs">
              {sampleTrips.slice(0, 6).map((trip) => (
                <div key={trip.id} className="rounded bg-white/10 p-2">
                  <p className="font-semibold text-emerald-200">{trip.departureTime}</p>
                  <p className="text-gray-300">{trip.departure}</p>
                  <p className="text-gray-400">{trip.arrival}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-[14%] left-[5%] right-[5%] h-36 rounded-lg border border-white/15 bg-white/10">
            <div className="absolute left-[8%] top-1/2 h-1 w-[72%] -translate-y-1/2 bg-emerald-400" />
            {['Kigali', 'Muhanga', 'Huye', 'Karongi', 'Rubavu'].map((city, index) => (
              <div
                key={city}
                className="absolute top-1/2 flex -translate-y-1/2 flex-col items-center gap-2"
                style={{ left: `${8 + index * 18}%` }}
              >
                <div className="h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
                <span className="text-xs text-gray-200">{city}</span>
              </div>
            ))}
            <motion.div
              animate={{ x: ['0%', '560%', '0%'] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute left-[8%] top-[34%] h-8 w-16 rounded bg-rose-500 shadow-lg"
            >
              <div className="mt-1 flex justify-center gap-1">
                <span className="h-2 w-2 rounded-full bg-white/80" />
                <span className="h-2 w-2 rounded-full bg-white/80" />
                <span className="h-2 w-2 rounded-full bg-white/80" />
              </div>
            </motion.div>
          </div>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="relative z-10 flex min-h-[680px] items-center"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
            <div className="max-w-3xl">
              <motion.p variants={itemVariants} className="text-sm font-semibold uppercase text-emerald-300">
                RindaSeat Rwanda transport platform
              </motion.p>
              <motion.h1 variants={itemVariants} className="mt-4 text-5xl md:text-6xl font-bold leading-tight">
                Book Rwanda Bus Tickets
              </motion.h1>
              <motion.p variants={itemVariants} className="mt-6 text-lg sm:text-xl text-gray-200 leading-8 max-w-2xl">
                Search Rwanda-wide departures, compare trusted operators, reserve seats, pay in RWF, and board with a QR ticket from one mobile-first booking flow.
              </motion.p>
              <motion.div variants={itemVariants} className="mt-8 flex flex-col sm:flex-row gap-3">
                <Button size="lg" onClick={() => navigate('/trips')}>Start Booking</Button>
                <Button variant="secondary" size="lg" onClick={() => navigate('/dashboard')}>Open Dashboard</Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </section>

      <motion.section
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="relative -mt-16 mb-16 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-2xl p-6 sm:p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              <Select
                label="From"
                options={stationOptions}
                value={searchForm.from}
                onChange={(e) => setSearchForm({ ...searchForm, from: e.target.value })}
              />
              <Select
                label="To"
                options={stationOptions}
                value={searchForm.to}
                onChange={(e) => setSearchForm({ ...searchForm, to: e.target.value })}
              />
              <TextInput
                label="Date"
                type="date"
                value={searchForm.date}
                onChange={(e) => setSearchForm({ ...searchForm, date: e.target.value })}
              />
              <div className="flex items-end">
                <Button type="submit" size="lg" className="w-full">Search Trips</Button>
              </div>
            </div>
          </form>
        </div>
      </motion.section>

      <section className="px-4 sm:px-6 lg:px-8 pb-12">
        <div className="max-w-7xl mx-auto grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            ['District coverage', `${RWANDA_DISTRICTS.length}/30`, 'Every Rwanda district has searchable service.'],
            ['Daily times', SCHEDULE_TIMES.length, 'Rotating departures from 05:00 to 20:00.'],
            ['Operators', RWANDA_OPERATORS.length, 'Local and regional companies in one marketplace.'],
            ['Trip samples', '600+', 'Generated schedules across national corridors.'],
          ].map(([label, value, description], index) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5"
            >
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="mt-2 font-semibold text-gray-900 dark:text-white">{label}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div variants={itemVariants} className="max-w-2xl mb-10">
            <p className="text-sm font-semibold text-primary-600">How RindaSeat works</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">From route search to verified boarding</h2>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              ['1', 'Search routes', 'Choose any Rwanda district, operator, departure date, and bus type.'],
              ['2', 'Compare trips', 'Review schedules, prices, seats left, amenities, ratings, and plate numbers.'],
              ['3', 'Reserve seats', 'Pick seats from the map and attach passenger details to the booking.'],
              ['4', 'Board by QR', 'Use a QR ticket for fast verification at the operator desk or bus door.'],
            ].map(([step, title, description]) => (
              <motion.div key={title} variants={itemVariants} className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-6">
                <div className="h-10 w-10 rounded-lg bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-200 flex items-center justify-center font-bold">
                  {step}
                </div>
                <h3 className="mt-5 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400 leading-6">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8 items-start">
          <motion.div initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
            <p className="text-sm font-semibold text-primary-600">QR and mobile booking</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">Built for passenger flow at busy bus parks</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-7">
              RindaSeat keeps each booking tied to the route, selected seats, payment status, and ticket QR data. The passenger can search on mobile, pay with a local method, and show one scannable ticket at boarding.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-4">
              {[
                ['Mobile-first search', 'Large tap targets, responsive filters, and route results that work on small screens.'],
                ['QR ticket record', 'Confirmed bookings keep passenger, seats, route, operator, and fare in one ticket view.'],
                ['Payment history', 'Dashboard surfaces paid, pending, and reserved trips for quick follow-up.'],
                ['Operator visibility', 'Every card shows company rating, contact, plate number, and amenities.'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-lg border border-gray-100 dark:border-gray-700 p-5 bg-white dark:bg-gray-800">
                  <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 16 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-950 p-6 text-white"
          >
            <div className="mx-auto max-w-sm rounded-lg bg-white p-5 text-gray-900">
              <div className="flex items-center justify-between border-b border-gray-200 pb-4">
                <div>
                  <p className="text-xs text-gray-500">QR Ticket</p>
                  <p className="font-bold">RS-458920</p>
                </div>
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Paid</span>
              </div>
              <div className="my-6 grid grid-cols-7 gap-1">
                {Array.from({ length: 49 }, (_, index) => (
                  <span key={index} className={`aspect-square rounded-sm ${index % 3 === 0 || index % 7 === 0 ? 'bg-gray-900' : 'bg-gray-100'}`} />
                ))}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span>Kigali</span><span>Rubavu</span></div>
                <div className="flex justify-between"><span>Volcano Express</span><span>RAB 123 A</span></div>
                <div className="flex justify-between font-semibold"><span>Seats</span><span>B2, B3</span></div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
            <div>
              <p className="text-sm font-semibold text-primary-600">Transport operators</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">Companies passengers can compare</h2>
            </div>
            <Button variant="outline" onClick={() => navigate('/trips')}>Compare Operators</Button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {RWANDA_OPERATORS.slice(0, 8).map((operator) => (
              <button
                type="button"
                key={operator.id}
                onClick={() => navigate(`/trips?company=${operator.id}`)}
                className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-5 text-left hover:shadow-md transition"
              >
                <div className="flex items-center gap-3">
                  <div className="h-11 w-11 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: operator.brandColor }}>
                    {operator.logoPlaceholder}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">{operator.name}</h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{operator.rating} rating</p>
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{operator.busTypes.join(', ')}</p>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-semibold text-primary-600">Rwanda coverage map</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">District-level route coverage</h2>
            <p className="mt-4 text-gray-600 dark:text-gray-400 leading-7">
              The platform data includes Kigali and all 30 districts, then connects them through national hubs and regional corridors.
            </p>
            <div className="mt-6 grid sm:grid-cols-2 gap-3">
              {popularRoutes.map((route) => (
                <button
                  type="button"
                  key={`${route.from}-${route.to}`}
                  onClick={() => navigate(`/trips?from=${route.from}&to=${route.to}`)}
                  className="rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 text-left hover:border-primary-300 transition"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{route.from} to {route.to}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{route.note}</p>
                </button>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
            <div className="grid gap-4">
              {Object.entries(provinceCoverage).map(([province, districts]) => (
                <div key={province}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{province}</h3>
                    <span className="text-xs font-semibold text-primary-600">{districts.length} districts</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {districts.map((district) => (
                      <span key={district} className="rounded-full bg-gray-100 dark:bg-gray-700 px-3 py-1 text-xs text-gray-700 dark:text-gray-200">
                        {district}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-3 gap-5">
            {[
              ['Aline M.', 'Kigali to Huye', 'I can see seats left before going to Nyabugogo, and the QR ticket makes the whole trip feel organized.'],
              ['Jean Paul N.', 'Musanze to Rubavu', 'Comparing operator times and plate numbers in one place is exactly what intercity travel needed.'],
              ['Clarisse U.', 'Kayonza to Kigali', 'The mobile flow is simple enough to book while already on the way to the station.'],
            ].map(([name, route, quote]) => (
              <div key={name} className="rounded-lg bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-700 p-6">
                <p className="text-gray-700 dark:text-gray-300 leading-7">&quot;{quote}&quot;</p>
                <p className="mt-5 font-semibold text-gray-900 dark:text-white">{name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{route}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-950">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white">Ready to reserve your next Rwanda trip?</h2>
          <p className="text-lg text-gray-300 mt-4">Search by district, choose a company, pick seats, and keep your QR ticket in the dashboard.</p>
          <div className="mt-8 flex flex-col sm:flex-row justify-center gap-3">
            <Button size="lg" onClick={() => navigate('/trips')}>Book Now</Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/help')}>Get Help</Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
