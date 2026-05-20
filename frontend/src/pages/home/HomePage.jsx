// @ts-nocheck
import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/buttons/Button';
import { TextInput, Select } from '../../components/forms/FormInputs';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stationOptions = [
  { label: 'Kigali', value: 'Kigali' },
  { label: 'Huye', value: 'Huye' },
  { label: 'Musanze', value: 'Musanze' },
  { label: 'Rubavu', value: 'Rubavu' },
  { label: 'Rusizi', value: 'Rusizi' },
  { label: 'Nyagatare', value: 'Nyagatare' },
];

export const HomePage = () => {
  const navigate = useNavigate();
  const [searchForm, setSearchForm] = useState({ from: '', to: '', date: '' });

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
      <motion.section
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative overflow-hidden bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 pt-20 pb-32"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div variants={itemVariants} className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
                Book Rwanda Bus Tickets
                <span className="bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
                  {' '}Instantly
                </span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
                Search trusted Rwanda operators, compare live schedules, select seats, pay in RWF, and travel with a QR ticket.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Button size="lg" onClick={() => navigate('/trips')}>Start Booking</Button>
                <Button variant="outline" size="lg" onClick={() => navigate('/about')}>Learn More</Button>
              </div>
            </motion.div>

            <motion.div
              variants={itemVariants}
              className="relative h-96 bg-gradient-to-br from-primary-400 to-secondary-400 rounded-2xl shadow-2xl"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center text-white text-3xl font-bold">
                    RS
                  </div>
                  <p className="text-white font-semibold">Smart Bus Booking</p>
                  <p className="text-primary-50 text-sm mt-2">Kigali - Huye - Musanze - Rubavu - Rusizi</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        variants={itemVariants}
        initial="hidden"
        whileInView="visible"
        className="relative -mt-16 mb-20 px-4 sm:px-6 lg:px-8"
      >
        <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8">
          <form onSubmit={handleSearch} className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
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
            </div>
            <Button type="submit" size="lg" className="w-full">Search Trips</Button>
          </form>
        </div>
      </motion.section>

      <motion.section
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800"
      >
        <div className="max-w-7xl mx-auto">
          <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Why Choose RindaSeat?
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              ['01', 'Instant Booking', 'Book trusted operators in seconds with a guided seat and payment flow.'],
              ['02', 'Secure Payments', 'Simulated local RWF payments are tracked end to end for testing.'],
              ['03', 'Digital Tickets', 'Every confirmed booking receives a QR-ready ticket.'],
              ['04', 'Wide Coverage', 'Demo routes cover major Rwanda travel corridors.'],
              ['05', 'Passenger Support', 'Clear help, contact, and policy pages are available from the footer.'],
              ['06', 'Transparent Prices', 'Compare companies, amenities, seats left, and live prices.'],
            ].map(([icon, title, description]) => (
              <motion.div
                key={title}
                variants={itemVariants}
                className="bg-white dark:bg-gray-700 p-8 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <div className="text-primary-600 font-bold text-2xl mb-4">{icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
                <p className="text-gray-600 dark:text-gray-300">{description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section variants={containerVariants} initial="hidden" whileInView="visible" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.h2 variants={itemVariants} className="text-4xl font-bold text-center mb-16 text-gray-900 dark:text-white">
            Popular Routes
          </motion.h2>

          <div className="grid md:grid-cols-2 gap-6">
            {[
              { from: 'Kigali', to: 'Huye', duration: '3h 00m', trips: 12 },
              { from: 'Kigali', to: 'Musanze', duration: '2h 15m', trips: 10 },
              { from: 'Kigali', to: 'Rubavu', duration: '3h 30m', trips: 8 },
              { from: 'Kigali', to: 'Nyagatare', duration: '2h 40m', trips: 6 },
            ].map((route) => (
              <motion.button
                type="button"
                key={`${route.from}-${route.to}`}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/trips?from=${route.from}&to=${route.to}`)}
                className="text-left bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{route.from} -&gt; {route.to}</h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">{route.duration} - {route.trips} trips daily</p>
                  </div>
                  <span className="text-primary-600 font-semibold text-lg">-&gt;</span>
                </div>
              </motion.button>
            ))}
          </div>
        </div>
      </motion.section>

      <motion.section variants={itemVariants} initial="hidden" whileInView="visible" className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-primary-600 to-secondary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to book your next journey?</h2>
          <p className="text-xl text-primary-100 mb-8">Start with a live route search and continue through seats, payment, and QR ticketing.</p>
          <Button variant="secondary" size="lg" onClick={() => navigate('/trips')}>Book Now</Button>
        </div>
      </motion.section>
    </div>
  );
};

export default HomePage;
