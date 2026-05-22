// @ts-nocheck
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { SeatMap } from '../../components/seatmap/SeatMap';
import { Card } from '../../components/cards/Card';
import { LoadingSpinner } from '../../components/loaders/Loaders';
import { tripService } from '../../services/api';
import useBookingStore from '../../store/bookingStore';
import toast from 'react-hot-toast';

export const BookingSeatPage = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [trip, setTrip] = useState(null);
  const [seatInfo, setSeatInfo] = useState({ lockedSeats: [], unavailableSeats: [] });
  const { selectedSeats, setSelectedSeats, setSelectedTrip, addSeat, removeSeat } = useBookingStore();

  useEffect(() => {
    const fetchTrip = async () => {
      setIsLoading(true);
      try {
        const [tripResponse, seatResponse] = await Promise.all([
          tripService.getTripById(tripId),
          tripService.getAvailableSeats(tripId),
        ]);
        const tripData = tripResponse.trip || tripResponse.data || tripResponse;
        const seatsData = seatResponse.data || seatResponse;
        setTrip(tripData);
        setSelectedTrip(tripData);
        setSelectedSeats([]);
        setSeatInfo(seatsData);
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to load trip details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTrip();
  }, [tripId, setSelectedTrip, setSelectedSeats]);

  const handleSeatSelect = (seat) => {
    const isSelected = selectedSeats.some((selectedSeat) => selectedSeat.id === seat.id);
    if (isSelected) removeSeat(seat.id);
    else addSeat(seat);
  };

  const handleContinue = () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }
    navigate(`/booking/${tripId}/passengers`);
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
        <div className="max-w-3xl mx-auto px-4">
          <Card className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Trip not found</h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Search again to choose an available trip.</p>
            <Button onClick={() => navigate('/trips')}>Back to Search</Button>
          </Card>
        </div>
      </div>
    );
  }

  const total = Number(trip.price || 0) * selectedSeats.length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <p className="text-primary-600 font-semibold mb-2">Step 1 of 4</p>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Select Your Seats</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {trip.company?.name} - {trip.departure} to {trip.arrival} - {trip.departureTime}
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-2">
            <Card>
              <SeatMap
                bus={{
                  ...trip.bus,
                  rows: seatInfo.rows || trip.bus?.rows,
                  columns: seatInfo.columns || trip.bus?.columns,
                }}
                selectedSeats={selectedSeats}
                lockedSeats={(seatInfo.lockedSeats || []).map((number) => ({ id: number, number }))}
                unavailableSeats={(seatInfo.unavailableSeats || []).map((number) => ({ id: number, number }))}
                reservedSeats={(seatInfo.reservedSeats || []).map((number) => ({ id: number, number }))}
                onSeatSelect={handleSeatSelect}
              />
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="lg:col-span-1">
            <Card className="sticky top-20">
              <h3 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">Booking Summary</h3>
              <div className="space-y-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Route</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{trip.departure} to {trip.arrival}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Departure</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{new Date(trip.departureDate).toLocaleDateString()} at {trip.departureTime}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Bus</p>
                  <p className="font-semibold text-gray-900 dark:text-white">{trip.bus?.type} - {trip.bus?.plateNumber}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
                <h4 className="font-semibold text-gray-900 dark:text-white">Selected Seats ({selectedSeats.length})</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSeats.length > 0 ? selectedSeats.map((seat) => (
                    <div key={seat.id} className="px-3 py-1 bg-primary-500 text-white rounded-md text-sm font-medium">{seat.number}</div>
                  )) : <p className="text-gray-600 dark:text-gray-400 text-sm">No seats selected</p>}
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price per seat</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{Number(trip.price || 0).toLocaleString()} RWF</span>
                </div>
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between">
                  <span className="text-lg font-bold text-gray-900 dark:text-white">Total</span>
                  <span className="text-lg font-bold text-primary-600">{total.toLocaleString()} RWF</span>
                </div>
              </div>

              <Button onClick={handleContinue} size="lg" className="w-full" disabled={selectedSeats.length === 0}>
                Continue to Passenger Details
              </Button>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default BookingSeatPage;
