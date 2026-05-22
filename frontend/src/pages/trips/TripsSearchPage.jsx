// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { TextInput, Select } from '../../components/forms/FormInputs';
import { TripCard } from '../../components/cards/Card';
import { Skeleton } from '../../components/loaders/Loaders';
import { tripService } from '../../services/api';
import {
  RWANDA_DISTRICTS,
  SCHEDULE_TIMES,
  getAvailableBusesForStation,
  getCompaniesForStation,
  getStationsForLocation,
} from '../../data/rwandaTransport';
import toast from 'react-hot-toast';

const PAGE_SIZE = 10;

const sortTrips = (rows, sortBy) => {
  const sorted = [...rows];
  const asMinutes = (time = '00:00') => {
    const [hour, minute] = String(time).split(':').map(Number);
    return (hour || 0) * 60 + (minute || 0);
  };

  return sorted.sort((a, b) => {
    if (sortBy === 'price-low') return Number(a.price || 0) - Number(b.price || 0);
    if (sortBy === 'price-high') return Number(b.price || 0) - Number(a.price || 0);
    if (sortBy === 'seats') return Number(b.seatsLeft || 0) - Number(a.seatsLeft || 0);
    if (sortBy === 'duration') return Number(a.durationMinutes || 0) - Number(b.durationMinutes || 0);
    return asMinutes(a.departureTime) - asMinutes(b.departureTime);
  });
};

const TripsSkeleton = () => (
  <div className="space-y-4">
    {[1, 2, 3, 4].map((item) => (
      <div key={item} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 p-5">
        <div className="flex items-center gap-4 mb-5">
          <Skeleton width="w-12" height="h-12" className="rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton width="w-1/3" height="h-5" />
            <Skeleton width="w-2/3" height="h-4" />
          </div>
          <Skeleton width="w-24" height="h-8" />
        </div>
        <Skeleton height="h-16" />
      </div>
    ))}
  </div>
);

export const TripsSearchPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = useMemo(() => new URLSearchParams(location.search), [location.search]);
  const [isLoading, setIsLoading] = useState(false);
  const [trips, setTrips] = useState([]);
  const [meta, setMeta] = useState({ stations: [], companies: [], busTypes: [] });
  const [sortBy, setSortBy] = useState(queryParams.get('sortBy') || 'time');
  const [page, setPage] = useState(Number(queryParams.get('page') || 1));
  const [locationQuery, setLocationQuery] = useState(queryParams.get('from') || '');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [filters, setFilters] = useState({
    from: queryParams.get('from') || '',
    to: queryParams.get('to') || '',
    date: queryParams.get('date') || '',
    company: queryParams.get('company') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    busType: queryParams.get('busType') || '',
    departureTime: queryParams.get('departureTime') || '',
  });

  const stationOptions = meta.stations.map((station) => ({ label: station.city, value: station.city }));
  const uniqueStationOptions = Array.from(new Map(stationOptions.map((item) => [item.value, item])).values())
    .sort((a, b) => a.label.localeCompare(b.label));
  const companyOptions = meta.companies.map((company) => ({ label: company.name, value: company.id }));
  const busTypeOptions = meta.busTypes.map((busType) => ({ label: busType, value: busType }));
  const stationMatches = useMemo(() => getStationsForLocation(locationQuery).slice(0, 12), [locationQuery]);
  const selectedStation = stationMatches.find((station) => station.id === selectedStationId) || stationMatches[0];
  const stationCompanies = useMemo(() => getCompaniesForStation(selectedStation?.id || locationQuery), [locationQuery, selectedStation?.id]);
  const stationBuses = useMemo(() => getAvailableBusesForStation(selectedStation?.id || locationQuery).slice(0, 4), [locationQuery, selectedStation?.id]);

  const filteredTrips = useMemo(() => {
    const rows = filters.departureTime
      ? trips.filter((trip) => trip.departureTime === filters.departureTime)
      : trips;
    return sortTrips(rows, sortBy);
  }, [filters.departureTime, sortBy, trips]);

  const totalPages = Math.max(1, Math.ceil(filteredTrips.length / PAGE_SIZE));
  const pageTrips = filteredTrips.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const lowestPrice = filteredTrips.length ? Math.min(...filteredTrips.map((trip) => Number(trip.price || 0))) : 0;
  const operatorsAvailable = new Set(filteredTrips.map((trip) => trip.company?.name).filter(Boolean)).size;

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((current) => ({ ...current, [name]: value }));
  };

  const writeSearchParams = (nextFilters, nextSort = sortBy, nextPage = 1) => {
    const params = new URLSearchParams();
    Object.entries(nextFilters).forEach(([key, value]) => {
      if (value) params.set(key, value);
    });
    if (nextSort !== 'time') params.set('sortBy', nextSort);
    if (nextPage > 1) params.set('page', String(nextPage));
    navigate(`/trips?${params.toString()}`, { replace: true });
  };

  const handleSearch = async (nextFilters = filters) => {
    setIsLoading(true);
    try {
      const response = await tripService.searchTrips(nextFilters);
      const results = response.trips || response.data || [];
      setTrips(results);
      setPage(1);
      writeSearchParams(nextFilters, sortBy, 1);

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

  const handleReset = () => {
    const resetFilters = {
      from: '',
      to: '',
      date: '',
      company: '',
      maxPrice: '',
      busType: '',
      departureTime: '',
    };
    setFilters(resetFilters);
    setSortBy('time');
    handleSearch(resetFilters);
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

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
      writeSearchParams(filters, sortBy, totalPages);
    }
  }, [filters, page, sortBy, totalPages]);

  useEffect(() => {
    if (trips.length === 0) return undefined;

    const interval = window.setInterval(() => {
      setTrips((currentTrips) => currentTrips.map((trip, index) => {
        const pulse = (Date.now() + index + String(trip.id).length) % 5 === 0;
        if (!pulse || Number(trip.seatsLeft || 0) <= 3) return trip;
        return {
          ...trip,
          seatsLeft: Number(trip.seatsLeft) - 1,
          availableSeats: Number(trip.availableSeats || trip.seatsLeft) - 1,
          liveDemand: 'Updated just now',
        };
      }));
    }, 14000);

    return () => window.clearInterval(interval);
  }, [trips.length]);

  const goToPage = (nextPage) => {
    setPage(nextPage);
    writeSearchParams(filters, sortBy, nextPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6 sm:py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
            <div>
              <p className="text-sm font-semibold text-primary-600 mb-2">Rwanda-wide smart transport marketplace</p>
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">Search Trips</h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
                Compare operators, live-like seat availability, bus plates, amenities, QR ticket support, and schedules across every Rwanda district.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3 text-center">
              {[
                ['Districts', RWANDA_DISTRICTS.length],
                ['Departures', SCHEDULE_TIMES.length],
                ['Operators', meta.companies.length || 12],
              ].map(([label, value]) => (
                <div key={label} className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg px-4 py-3">
                  <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-4 gap-6 lg:gap-8">
          <motion.aside initial={{ opacity: 0, x: -18 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-md p-5 lg:sticky lg:top-20">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Filters</h2>
                <button type="button" onClick={handleReset} className="text-sm font-medium text-primary-600 hover:text-primary-700">
                  Reset
                </button>
              </div>
              <div className="space-y-4">
                <Select label="From" name="from" value={filters.from} onChange={handleFilterChange} options={uniqueStationOptions} />
                <TextInput
                  label="Province or City"
                  value={locationQuery}
                  onChange={(event) => setLocationQuery(event.target.value)}
                  placeholder="Kigali, Eastern Province, Huye"
                />
                <Select
                  label="Station"
                  value={selectedStation?.id || ''}
                  onChange={(event) => {
                    const station = stationMatches.find((item) => item.id === event.target.value);
                    setSelectedStationId(event.target.value);
                    if (station) {
                      setFilters((current) => ({ ...current, from: station.city }));
                    }
                  }}
                  options={stationMatches.map((station) => ({ label: `${station.name} - ${station.district}`, value: station.id }))}
                />
                <Select label="To" name="to" value={filters.to} onChange={handleFilterChange} options={uniqueStationOptions} />
                <TextInput label="Date" type="date" name="date" value={filters.date} onChange={handleFilterChange} />
                <Select label="Departure Time" name="departureTime" value={filters.departureTime} onChange={handleFilterChange} options={SCHEDULE_TIMES.map((time) => ({ label: time, value: time }))} />
                <Select label="Company" name="company" value={filters.company} onChange={handleFilterChange} options={[{ label: 'All Companies', value: '' }, ...companyOptions]} />
                <Select label="Bus Type" name="busType" value={filters.busType} onChange={handleFilterChange} options={[{ label: 'Any Bus Type', value: '' }, ...busTypeOptions]} />
                <Select
                  label="Max Price"
                  name="maxPrice"
                  value={filters.maxPrice}
                  onChange={handleFilterChange}
                  options={[
                    { label: 'Any Price', value: '' },
                    { label: 'Up to 2,500 RWF', value: '2500' },
                    { label: 'Up to 4,000 RWF', value: '4000' },
                    { label: 'Up to 6,000 RWF', value: '6000' },
                    { label: 'Up to 9,000 RWF', value: '9000' },
                  ]}
                />
                <Button onClick={() => handleSearch()} className="w-full" disabled={isLoading}>
                  {isLoading ? 'Searching...' : 'Apply Filters'}
                </Button>
                {selectedStation && (
                  <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-900">
                    <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">Station operators</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {stationCompanies.slice(0, 5).map((operator) => (
                        <button
                          type="button"
                          key={operator.id}
                          onClick={() => setFilters((current) => ({ ...current, company: operator.id }))}
                          className="rounded-full bg-white px-2.5 py-1 text-xs font-semibold text-gray-700 shadow-sm ring-1 ring-gray-200 transition hover:text-primary-700 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-700"
                        >
                          {operator.name}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 space-y-2">
                      {stationBuses.map((bus) => (
                        <div key={bus.id} className="flex items-center justify-between gap-3 rounded-md bg-white px-3 py-2 text-xs dark:bg-gray-800">
                          <span className="font-medium text-gray-800 dark:text-gray-100">{bus.companyName} {bus.type}</span>
                          <span className={bus.status === 'boarding' ? 'font-bold text-emerald-600' : 'font-semibold text-gray-500'}>
                            {bus.seatsLeft} seats
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>

          <motion.section initial={{ opacity: 0, x: 18 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-3">
            <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4 sm:p-5 mb-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    ['Trips', filteredTrips.length],
                    ['Operators', operatorsAvailable],
                    ['From', filters.from || 'All'],
                    ['Lowest', lowestPrice ? `${lowestPrice.toLocaleString()} RWF` : 'Any'],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{value}</p>
                    </div>
                  ))}
                </div>
                <div className="w-full md:w-56">
                  <Select
                    label="Sort"
                    value={sortBy}
                    onChange={(event) => {
                      const nextSort = event.target.value;
                      setSortBy(nextSort);
                      setPage(1);
                      writeSearchParams(filters, nextSort, 1);
                    }}
                    options={[
                      { label: 'Earliest departure', value: 'time' },
                      { label: 'Lowest price', value: 'price-low' },
                      { label: 'Highest price', value: 'price-high' },
                      { label: 'Most seats left', value: 'seats' },
                      { label: 'Shortest duration', value: 'duration' },
                    ]}
                  />
                </div>
              </div>
            </div>

            {isLoading ? (
              <TripsSkeleton />
            ) : pageTrips.length > 0 ? (
              <div className="space-y-4">
                {pageTrips.map((trip, index) => (
                  <motion.div
                    key={trip.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <TripCard trip={trip} onClick={() => navigate(`/booking/${trip.id}`)} />
                  </motion.div>
                ))}

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg p-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Page {page} of {totalPages} - showing {pageTrips.length} of {filteredTrips.length} trips
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page === 1} onClick={() => goToPage(page - 1)}>Previous</Button>
                    <Button variant="outline" size="sm" disabled={page === totalPages} onClick={() => goToPage(page + 1)}>Next</Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-100 dark:border-gray-700 shadow-md p-10 sm:p-12 text-center">
                <div className="text-primary-600 font-bold text-4xl mb-4">RS</div>
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No trips found</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">Try a different route, date, company, time, or price range.</p>
                <Button onClick={handleReset}>Reset Search</Button>
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </div>
  );
};

export default TripsSearchPage;
