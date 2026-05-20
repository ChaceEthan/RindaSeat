// @ts-nocheck
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { TextInput } from '../../components/forms/FormInputs';
import { Card } from '../../components/cards/Card';
import { LoadingSpinner } from '../../components/loaders/Loaders';
import { bookingService, paymentService } from '../../services/api';
import useBookingStore from '../../store/bookingStore';
import toast from 'react-hot-toast';

export const PaymentsPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [phoneNumber, setPhoneNumber] = useState('');
  const { selectedSeats, selectedTrip, passengerInfo, bookingData, setBookingData } = useBookingStore();

  const totalPrice = Number(selectedTrip?.price || 0) * selectedSeats.length;

  useEffect(() => {
    if (!selectedTrip || selectedSeats.length === 0) {
      toast.error('Select seats before payment');
      navigate(`/booking/${tripId}`);
      return;
    }

    if (!passengerInfo?.fullName) {
      toast.error('Passenger details are required');
      navigate(`/booking/${tripId}/passengers`);
    }
  }, [navigate, passengerInfo, selectedSeats.length, selectedTrip, tripId]);

  const ensureBooking = async () => {
    if (bookingData?.id) return bookingData;

    const response = await bookingService.createBooking({
      tripId,
      seats: selectedSeats.map((seat) => seat.number),
      passengerInfo,
    });
    const booking = response.booking || response.data;
    setBookingData(booking);
    return booking;
  };

  const handlePayment = async () => {
    setIsLoading(true);
    try {
      const booking = await ensureBooking();
      const paymentData = {
        bookingId: booking.id,
        amount: booking.totalPrice || totalPrice,
        method: paymentMethod,
        phoneNumber: paymentMethod === 'momo' ? phoneNumber : undefined,
      };

      await paymentService.initiatePayment(paymentData);
      toast.success('Payment confirmed. Your QR ticket is ready.');
      navigate(`/tickets/${booking.id}`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Payment failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary-600 font-semibold mb-2">Step 3 of 4</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Payment</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Complete your booking with a simulated RWF payment.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <Card>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Select Payment Method</h2>

              <div className="space-y-4 mb-8">
                {[
                  ['momo', 'MTN MoMo', 'Instant local mobile money confirmation'],
                  ['card', 'Credit / Debit Card', 'Simulated card confirmation for testing'],
                  ['cash', 'Pay at Counter', 'Reserve now and settle at operator desk'],
                ].map(([value, title, description]) => (
                  <label key={value} className="flex items-start gap-4 p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary-500 transition">
                    <input
                      type="radio"
                      name="payment"
                      value={value}
                      checked={paymentMethod === value}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-5 h-5 accent-primary-600 mt-1"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{description}</p>
                    </div>
                  </label>
                ))}
              </div>

              {paymentMethod === 'momo' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
                  <TextInput
                    label="MTN MoMo Number"
                    type="tel"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+250 7XX XXX XXX"
                    required
                  />
                </motion.div>
              )}

              <Button onClick={handlePayment} size="lg" className="w-full" disabled={isLoading || (paymentMethod === 'momo' && !phoneNumber)}>
                {isLoading ? <LoadingSpinner /> : `Pay ${totalPrice.toLocaleString()} RWF`}
              </Button>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
            <Card className="sticky top-20">
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Route</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedTrip?.departure} to {selectedTrip?.arrival}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Passenger</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{passengerInfo?.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Seats</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{selectedSeats.map((seat) => seat.number).join(', ')}</p>
                </div>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                <span className="text-lg font-bold text-primary-600">{totalPrice.toLocaleString()} RWF</span>
              </div>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
