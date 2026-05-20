// @ts-nocheck
import { create } from 'zustand';

const useBookingStore = create((set) => ({
  selectedTrip: null,
  selectedSeats: [],
  passengerInfo: null,
  bookingData: null,
  pendingTripId: null,

  setSelectedTrip: (trip) => set({ selectedTrip: trip }),

  setSelectedSeats: (seats) => set({ selectedSeats: seats }),

  setPendingTripId: (tripId) => set({ pendingTripId: tripId }),

  addSeat: (seat) => set((state) => ({
    selectedSeats: [...state.selectedSeats, seat],
  })),

  removeSeat: (seatId) => set((state) => ({
    selectedSeats: state.selectedSeats.filter((s) => s.id !== seatId),
  })),

  setPassengerInfo: (info) => set({ passengerInfo: info }),

  setBookingData: (data) => set({ bookingData: data }),

  clearBooking: () => set({
    selectedTrip: null,
    selectedSeats: [],
    passengerInfo: null,
    bookingData: null,
    pendingTripId: null,
  }),
}));

export default useBookingStore;
