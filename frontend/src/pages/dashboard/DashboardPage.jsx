// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { Card } from '../../components/cards/Card';
import { LoadingSpinner } from '../../components/loaders/Loaders';
import { bookingService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export const DashboardPage = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [stats, setStats] = useState({ totalBookings: 0, upcomingTrips: 0, completedTrips: 0 });
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await bookingService.getBookingHistory();
        const rows = response.bookings || response.data || [];
        setBookings(rows);
        setStats({
          totalBookings: rows.length,
          upcomingTrips: rows.filter((booking) => new Date(booking.date) > new Date()).length,
          completedTrips: rows.filter((booking) => new Date(booking.date) <= new Date()).length,
        });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Welcome, {user?.name || user?.fullName || 'Passenger'}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Manage bookings, tickets, and upcoming Rwanda trips.</p>
          </div>
          <Button variant="outline" onClick={() => { logout(); navigate('/'); }}>Logout</Button>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {[
            ['Total Bookings', stats.totalBookings, 'from-blue-500 to-blue-600'],
            ['Upcoming Trips', stats.upcomingTrips, 'from-green-500 to-green-600'],
            ['Completed Trips', stats.completedTrips, 'from-purple-500 to-purple-600'],
          ].map(([label, value, color], index) => (
            <motion.div key={label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
              <Card className={`bg-gradient-to-br ${color} text-white`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium opacity-90">{label}</p>
                    <p className="text-4xl font-bold mt-2">{value}</p>
                  </div>
                  <div className="text-2xl opacity-70">0{index + 1}</div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Recent Bookings</h2>
            <Button variant="ghost" onClick={() => navigate('/tickets')}>View Tickets</Button>
          </div>

          {bookings.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    {['Route', 'Date', 'Seats', 'Price', 'Status', 'Action'].map((heading) => (
                      <th key={heading} className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">{heading}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                      <td className="py-4 px-4">
                        <p className="font-medium text-gray-900 dark:text-white">{booking.departure} -&gt; {booking.arrival}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{booking.company}</p>
                      </td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{new Date(booking.date).toLocaleDateString()}</td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{booking.seats?.join(', ')}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{Number(booking.totalPrice || 0).toLocaleString()} RWF</td>
                      <td className="py-4 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${booking.paymentStatus === 'paid' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200'}`}>
                          {booking.paymentStatus === 'paid' ? 'Confirmed' : 'Pending'}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <Button variant="ghost" size="sm" onClick={() => navigate(`/tickets/${booking.id}`)}>View</Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 dark:text-gray-400">No bookings yet. Start by searching for a trip.</p>
              <Button className="mt-4" onClick={() => navigate('/trips')}>Book a Trip</Button>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardPage;
