// @ts-nocheck
import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { Card } from '../../components/cards/Card';
import { LoadingSpinner } from '../../components/loaders/Loaders';
import { bookingService } from '../../services/api';
import { RWANDA_OPERATORS, SCHEDULE_TIMES, searchRwandaTrips } from '../../data/rwandaTransport';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

const money = (value) => `${Number(value || 0).toLocaleString()} RWF`;

export const DashboardPage = ({ initialSection }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const { user, logout } = useAuthStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await bookingService.getBookingHistory();
        const rows = response.bookings || response.data || [];
        setBookings(rows);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load dashboard data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!isLoading && initialSection) {
      document.getElementById(`${initialSection}-settings`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [initialSection, isLoading]);

  const dashboardData = useMemo(() => {
    const now = new Date();
    const upcoming = bookings.filter((booking) => new Date(booking.date) > now);
    const completed = bookings.filter((booking) => new Date(booking.date) <= now);
    const paid = bookings.filter((booking) => booking.paymentStatus === 'paid');
    const totalSpent = paid.reduce((sum, booking) => sum + Number(booking.totalPrice || 0), 0);
    const savedRoutes = [
      ['Kigali', 'Huye'],
      ['Kigali', 'Musanze'],
      ['Kigali', 'Rubavu'],
      ['Rwamagana', 'Kayonza'],
    ];
    const todayTrips = searchRwandaTrips({ from: 'Kigali', limit: 80 });

    return {
      upcoming,
      completed,
      paid,
      totalSpent,
      savedRoutes,
      favoriteCompanies: RWANDA_OPERATORS.slice(0, 5),
      notifications: [
        ['Seat update', 'Kigali to Rubavu 14:00 has 6 seats remaining.'],
        ['QR ready', 'Paid bookings display printable QR tickets in My Tickets.'],
        ['Route coverage', 'All Rwanda districts are now searchable on RindaSeat.'],
      ],
      analytics: {
        totalPassengers: 48210 + bookings.length,
        activeBuses: RWANDA_OPERATORS.length * 4,
        tripsToday: todayTrips.length,
        busiestRoutes: [
          ['Kigali to Huye', 128],
          ['Kigali to Musanze', 116],
          ['Kigali to Rubavu', 98],
        ],
      },
    };
  }, [bookings]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  const stats = [
    ['Active Bookings', dashboardData.upcoming.length, 'Trips still ahead of you', 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-200'],
    ['Upcoming Trips', dashboardData.upcoming.length, 'Departures and boarding times', 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-200'],
    ['QR Tickets', dashboardData.paid.length, 'Confirmed tickets ready to scan', 'bg-violet-50 text-violet-700 dark:bg-violet-950/40 dark:text-violet-200'],
    ['Payment History', money(dashboardData.totalSpent), 'Total confirmed spend', 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-200'],
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col lg:flex-row lg:justify-between lg:items-end gap-4 mb-8">
          <div>
            <p className="text-sm font-semibold text-primary-600">Passenger command center</p>
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mt-2">Welcome, {user?.name || user?.fullName || 'Passenger'}</h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2 max-w-2xl">
              Manage active bookings, QR tickets, saved routes, payments, notifications, and Rwanda-wide travel analytics from one dashboard.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" onClick={() => navigate('/trips')}>Book a Trip</Button>
            <Button variant="secondary" onClick={() => { logout(); navigate('/'); }}>Logout</Button>
          </div>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {stats.map(([label, value, description, tone], index) => (
            <motion.div key={label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="h-full" hover={false}>
                <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${tone}`}>{label}</span>
                <p className="mt-4 text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{description}</p>
              </Card>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2" hover={false}>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Active Bookings</h2>
                <p className="text-sm text-gray-600 dark:text-gray-400">Upcoming trips, seat reservations, and payment state.</p>
              </div>
              <Button variant="ghost" onClick={() => navigate('/tickets')}>View QR Tickets</Button>
            </div>

            {bookings.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px]">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      {['Route', 'Departure', 'Seats', 'Price', 'Payment', 'Action'].map((heading) => (
                        <th key={heading} className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">{heading}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking) => (
                      <tr key={booking.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                        <td className="py-4 px-4">
                          <p className="font-medium text-gray-900 dark:text-white">{booking.departure} to {booking.arrival}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{booking.company}</p>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">
                          <p>{new Date(booking.date).toLocaleDateString()}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{booking.departureTime || 'Scheduled'}</p>
                        </td>
                        <td className="py-4 px-4 text-gray-700 dark:text-gray-300">{booking.seats?.join(', ') || 'Pending'}</td>
                        <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{money(booking.totalPrice)}</td>
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
          </Card>

          <Card hover={false}>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-5">QR Tickets</h2>
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-900">
              <div className="mx-auto grid w-36 grid-cols-6 gap-1">
                {Array.from({ length: 36 }, (_, index) => (
                  <span key={index} className={`aspect-square rounded-sm ${index % 4 === 0 || index % 7 === 0 ? 'bg-gray-900 dark:bg-white' : 'bg-gray-200 dark:bg-gray-700'}`} />
                ))}
              </div>
              <p className="text-center mt-4 font-semibold text-gray-900 dark:text-white">{dashboardData.paid.length} ready to scan</p>
              <p className="text-center mt-1 text-sm text-gray-600 dark:text-gray-400">Tickets include route, seats, booking reference, and payment status.</p>
            </div>
            <Button className="w-full mt-5" onClick={() => navigate('/tickets')}>Open Tickets</Button>
          </Card>
        </div>

        <div className="grid lg:grid-cols-4 gap-6 mb-8">
          {[
            ['Total passengers', dashboardData.analytics.totalPassengers.toLocaleString(), 'Demo network volume'],
            ['Active buses', dashboardData.analytics.activeBuses, 'Registered operator fleet'],
            ['Trips today', dashboardData.analytics.tripsToday, `${SCHEDULE_TIMES.length} rotating times`],
            ['Busiest route', dashboardData.analytics.busiestRoutes[0][0], `${dashboardData.analytics.busiestRoutes[0][1]} bookings`],
          ].map(([label, value, description]) => (
            <Card key={label} hover={false}>
              <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
              <p className="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card hover={false}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Saved Routes</h2>
            <div className="space-y-3">
              {dashboardData.savedRoutes.map(([from, to]) => (
                <button
                  type="button"
                  key={`${from}-${to}`}
                  onClick={() => navigate(`/trips?from=${from}&to=${to}`)}
                  className="w-full rounded-lg border border-gray-100 dark:border-gray-700 p-3 text-left hover:border-primary-300 transition"
                >
                  <p className="font-semibold text-gray-900 dark:text-white">{from} to {to}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Tap to search live schedules</p>
                </button>
              ))}
            </div>
          </Card>

          <Card hover={false}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Notifications</h2>
            <div className="space-y-3">
              {dashboardData.notifications.map(([title, body]) => (
                <div key={title} className="rounded-lg bg-gray-50 dark:bg-gray-900 p-3">
                  <p className="font-semibold text-gray-900 dark:text-white">{title}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{body}</p>
                </div>
              ))}
            </div>
          </Card>

          <Card hover={false}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Favorite Companies</h2>
            <div className="space-y-3">
              {dashboardData.favoriteCompanies.map((operator) => (
                <button
                  type="button"
                  key={operator.id}
                  onClick={() => navigate(`/trips?company=${operator.id}`)}
                  className="w-full flex items-center gap-3 rounded-lg border border-gray-100 dark:border-gray-700 p-3 text-left hover:border-primary-300 transition"
                >
                  <span className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ backgroundColor: operator.brandColor }}>
                    {operator.logoPlaceholder}
                  </span>
                  <span>
                    <span className="block font-semibold text-gray-900 dark:text-white">{operator.name}</span>
                    <span className="block text-xs text-gray-500 dark:text-gray-400">{operator.rating} rating - {operator.busTypes[0]}</span>
                  </span>
                </button>
              ))}
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mt-8">
          <Card hover={false}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Travel Analytics</h2>
            <div className="space-y-4">
              {dashboardData.analytics.busiestRoutes.map(([route, count]) => (
                <div key={route}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900 dark:text-white">{route}</span>
                    <span className="text-gray-500 dark:text-gray-400">{count}</span>
                  </div>
                  <div className="h-2 rounded-full bg-gray-100 dark:bg-gray-700">
                    <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${Math.min(100, count / 1.4)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card id="account-settings" hover={false}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Settings</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm">
              {[
                ['Name', user?.fullName || user?.name || 'Passenger'],
                ['Email', user?.email || 'Not provided'],
                ['Phone', user?.phone || 'Add phone for mobile money'],
                ['Preferences', 'QR tickets, SMS alerts, saved routes'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4">
                  <p className="text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
