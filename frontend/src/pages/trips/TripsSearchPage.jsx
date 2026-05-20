// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { TextInput, Select } from '../../components/forms/FormInputs';
import { TripCard } from '../../components/cards/Card';
import { Skeleton } from '../../components/loaders/Loaders';
import { tripService } from '../../services/api';
import toast from 'react-hot-toast';

export const TripsSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [isLoading, setIsLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [meta, setMeta] = useState({ stations: [], companies: [], busTypes: [] });
  const [filters, setFilters] = useState({
    from: queryParams.get('from') || '',
    to: queryParams.get('to') || '',
    date: queryParams.get('date') || '',
    company: queryParams.get('company') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    busType: queryParams.get('busType') || '',
  });

  const stationOptions = meta.stations.map((station) => ({ label: station.city, value: station.city }));
  const uniqueStationOptions = Array.from(new Map(stationOptions.map((item) => [item.value, item])).values());
  const companyOptions = meta.companies.map((company) => ({ label: company.name, value: company.id }));
  const busTypeOptions = meta.busTypes.map((busType) => ({ label: busType, value: busType }));

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const handleSearch = async (nextFilters = filters) => {
    setIsLoading(true);
    try {
      const response = await tripService.searchTrips(nextFilters);
      const results = response.trips || response.data || [];
      setTrips(results);

      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      navigate(`/trips?${params.toString()}`, { replace: true });

      if (results.length === 0) {
        toast('No trips found. Try another date or route.');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to search trips');
      setTrips([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const loadMeta = async () => {
      try {
        const response = await tripService.getTripMeta();
        setMeta(response.data || { stations: [], companies: [], busTypes: [] });
      } catch (error) {
        setMeta({ stations: [], companies: [], busTypes: [] });
      }
    };

    loadMeta();
  }, []);

  useEffect(() => {
    handleSearch(filters);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Search Trips</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Compare Rwanda routes, operators, prices, amenities, and live seat availability.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Filters</h2>
              <div className="space-y-4">
                <Select label="From" name="from" value={filters.from} onChange={handleFilterChange} options={uniqueStationOptions} />
                <Select label="To" name="to" value={filters.to} onChange={handleFilterChange} options={uniqueStationOptions} />
                <TextInput label="Date" type="date" name="date" value={filters.date} onChange={handleFilterChange} />
                <Select label="Company" name="company" value={filters.company} onChange={handleFilterChange} options={[{ label: 'All Companies', value: '' }, ...companyOptions]} />
                <Select label="Bus Type" name="busType" value={filters.busType} onChange={handleFilterChange} options={[{ label: 'Any Bus Type', value: '' }, ...busTypeOptions]} />
                <Select
                  label="Max Price"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  options={[
                    { label: 'Any Price', value: '' },
                    { label: 'Up to 4,000 RWF', value: '4000' },
                    { label: 'Up to 6,000 RWF', value: '6000' },
                    { label: 'Up to 9,000 RWF', value: '9000' },
                  ]}
                />
                <Button onClick={() => handleSearch()} className="w-full" disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Apply Filters'}
                </Button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
                    <Skeleton height="h-6" className="mb-4" />
                    <Skeleton height="h-20" />
                  </div>
                ))}
              </div>
            ) : trips.length > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>{trips.length} trips available</span>
                  <span>Prices shown in RWF</span>
                </div>
                {trips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.04 }}
                  >
                    <TripCard trip={trip} onClick={() => navigate(`/booking/${trip.id}`)} />
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center">
                <div className="text-primary-600 font-bold text-4xl mb-4">RS</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No trips found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Try a different route, date, company, or price range.</p>
                <Button onClick={() => handleSearch({ from: '', to: '', date: '', company: '', maxPrice: '', busType: '' })}>Reset Search</Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default TripsSearchPage;
