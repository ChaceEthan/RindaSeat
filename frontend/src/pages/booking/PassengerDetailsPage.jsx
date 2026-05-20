// @ts-nocheck
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { Card } from '../../components/cards/Card';
import { TextInput } from '../../components/forms/FormInputs';
import useAuthStore from '../../store/authStore';
import useBookingStore from '../../store/bookingStore';
import toast from 'react-hot-toast';

export const PassengerDetailsPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { selectedTrip, selectedSeats, passengerInfo, setPassengerInfo } = useBookingStore();
  const [formData, setFormData] = useState({
    fullName: passengerInfo?.fullName || user?.fullName || user?.name || '',
    email: passengerInfo?.email || user?.email || '',
    phone: passengerInfo?.phone || user?.phone || '',
    nationalId: passengerInfo?.nationalId || '',
  });

  useEffect(() => {
    if (!selectedTrip || selectedSeats.length === 0) {
      toast.error('Select seats before entering passenger details');
      navigate(`/booking/${tripId}`);
    }
  }, [navigate, selectedSeats.length, selectedTrip, tripId]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setPassengerInfo(formData);
    navigate(`/booking/${tripId}/payment`);
  };

  const total = Number(selectedTrip?.price || 0) * selectedSeats.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary-600 font-semibold mb-2">Step 2 of 4</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Passenger Details</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Confirm who is travelling before payment.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-5">
              <TextInput label="Full Name" name="fullName" value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })} required />
              <TextInput label="Email" type="email" name="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} required />
              <TextInput label="Phone Number" type="tel" name="phone" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+250 7XX XXX XXX" required />
              <TextInput label="National ID or Passport (optional)" name="nationalId" value={formData.nationalId} onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })} />
              <Button type="submit" size="lg" className="w-full">Continue to Payment</Button>
            </form>
          </Card>

          <Card className="lg:col-span-1 h-fit">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Trip Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Route</span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">{selectedTrip?.departure} to {selectedTrip?.arrival}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Seats</span>
                <span className="font-semibold text-gray-900 dark:text-white">{selectedSeats.map((seat) => seat.number).join(', ')}</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600 dark:text-gray-400">Company</span>
                <span className="font-semibold text-gray-900 dark:text-white text-right">{selectedTrip?.company?.name}</span>
              </div>
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                <span className="font-bold text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-primary-600">{total.toLocaleString()} RWF</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PassengerDetailsPage;
