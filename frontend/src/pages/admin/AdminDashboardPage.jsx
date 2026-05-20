// @ts-nocheck
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { Card } from '../../components/cards/Card';
import { LoadingSpinner } from '../../components/loaders/Loaders';
import { companyService, tripService } from '../../services/api';
import toast from 'react-hot-toast';

export const AdminDashboardPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [trips, setTrips] = useState([]);

  useEffect(() => {
    const loadAdminData = async () => {
      try {
        const [companyResponse, tripResponse] = await Promise.all([
          companyService.getAllCompanies(),
          tripService.searchTrips({ limit: 100 }),
        ]);
        setCompanies(companyResponse.data || []);
        setTrips(tripResponse.trips || tripResponse.data || []);
      } catch (error) {
        toast.error('Failed to load admin data');
      } finally {
        setIsLoading(false);
      }
    };

    loadAdminData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  const revenue = trips.reduce((sum, trip) => sum + Number(trip.price || 0) * Math.max(0, Number(trip.bus?.totalSeats || 0) - Number(trip.seatsLeft || 0)), 0);
  const activeRoutes = new Set(trips.map((trip) => `${trip.departure}-${trip.arrival}`)).size;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Operations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Monitor Rwanda routes, operators, trips, seats, and payment activity.</p>
        </motion.div>

        <div className="grid md:grid-cols-4 gap-6 mb-8">
          {[
            ['Companies', companies.length],
            ['Scheduled Trips', trips.length],
            ['Active Routes', activeRoutes],
            ['Tracked Revenue', `${revenue.toLocaleString()} RWF`],
          ].map(([label, value]) => (
            <Card key={label}>
              <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">{value}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Operators</h2>
              <Button variant="ghost" size="sm">Manage</Button>
            </div>
            <div className="space-y-4">
              {companies.map((company) => (
                <div key={company.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{company.name}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{company.bus_count || 0} buses - {company.scheduled_trips || 0} scheduled trips</p>
                  </div>
                  <span className="text-sm font-semibold text-yellow-600">{Number(company.rating || 0).toFixed(1)}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Upcoming Trips</h2>
              <Button variant="ghost" size="sm">Schedules</Button>
            </div>
            <div className="space-y-4 max-h-[420px] overflow-auto pr-2">
              {trips.slice(0, 12).map((trip) => (
                <div key={trip.id} className="flex items-center justify-between border-b border-gray-100 dark:border-gray-700 pb-3">
                  <div>
                    <p className="font-semibold text-gray-900 dark:text-white">{trip.departure} -&gt; {trip.arrival}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{trip.company?.name} - {trip.departureTime} - {trip.seatsLeft} seats left</p>
                  </div>
                  <span className="text-sm font-semibold text-primary-600">{Number(trip.price || 0).toLocaleString()} RWF</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
