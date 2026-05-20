// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { QRTicket } from '../../components/qr/QRTicket';
import { Card } from '../../components/cards/Card';
import { LoadingSpinner } from '../../components/loaders/Loaders';
import { bookingService, ticketService } from '../../services/api';
import toast from 'react-hot-toast';

export const TicketsPage = () => {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        if (bookingId) {
          const response = await ticketService.getTicket(bookingId);
          const booking = response.booking || response.data;
          setBookings(booking ? [booking] : []);
        } else {
          const response = await bookingService.getMyBookings();
          setBookings(response.bookings || response.data || []);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load tickets');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookings();
  }, [bookingId]);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary-600 font-semibold mb-2">{bookingId ? 'Step 4 of 4' : 'Passenger tickets'}</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">My Tickets</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">View, download, and print your digital QR tickets.</p>
        </motion.div>

        {bookings.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {bookings.map((booking, index) => (
              <motion.div key={booking.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
                <QRTicket booking={booking} onDownload={() => toast.success('Ticket downloaded')} onPrint={() => toast.success('Printing ticket')} />
              </motion.div>
            ))}
          </div>
        ) : (
          <Card className="text-center py-12">
            <div className="text-primary-600 font-bold text-4xl mb-4">RS</div>
            <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">No tickets yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Book and pay for a trip to get your digital QR ticket.</p>
            <Button onClick={() => navigate('/trips')}>Book a Trip</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TicketsPage;
