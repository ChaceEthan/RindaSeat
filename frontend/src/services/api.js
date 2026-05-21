// @ts-nocheck
import api from '../api/axios';
import {
  confirmDemoPayment,
  createDemoBooking,
  dashboardFallbackBookings,
  getDemoBooking,
  getDemoBookings,
  getRwandaSeatInfo,
  getRwandaTripById,
  getRwandaTripMeta,
  searchRwandaTrips,
} from '../data/rwandaTransport';

const isDemoTripId = (id) => String(id || '').startsWith('rw-');
const isDemoBookingId = (id) => String(id || '').startsWith('demo-') || String(id || '').startsWith('sample-');
const canUseFallback = (error) => !error?.response || error.response.status >= 500 || error.response.status === 404;

const normalizeTripList = (payload) => payload?.trips || payload?.data || [];

const mergeTrips = (primaryTrips = [], fallbackTrips = []) => {
  const seen = new Set();
  return [...primaryTrips, ...fallbackTrips].filter((trip) => {
    const key = trip.id || `${trip.departure}-${trip.arrival}-${trip.departureTime}-${trip.company?.name}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const mergeTripMeta = (primaryMeta = {}, fallbackMeta = getRwandaTripMeta()) => {
  const stationKey = (station) => `${station.city}-${station.name || station.stationName || ''}`;
  const companyKey = (company) => company.id || company.name;
  const uniqueBy = (items, getKey) => Array.from(new Map(items.filter(Boolean).map((item) => [getKey(item), item])).values());

  return {
    stations: uniqueBy([...(primaryMeta.stations || []), ...fallbackMeta.stations], stationKey),
    companies: uniqueBy([...(primaryMeta.companies || []), ...fallbackMeta.companies], companyKey),
    busTypes: Array.from(new Set([...(primaryMeta.busTypes || []), ...fallbackMeta.busTypes])),
  };
};

export const authService = {
  async signup(userData) {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  async googleAuth(idToken) {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  async logout() {
    await api.post('/auth/logout');
  },

  async verifyOTP(email, otp) {
    const response = await api.post('/auth/verify-otp', { email, otp });
    return response.data;
  },

  async requestPasswordReset(email) {
    const response = await api.post('/auth/forgot-password', { email });
    return response.data;
  },

  async resetPassword(token, newPassword) {
    const response = await api.post('/auth/reset-password', { token, newPassword });
    return response.data;
  },

  async getProfile() {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const tripService = {
  async searchTrips(filters) {
    const fallbackTrips = searchRwandaTrips(filters);

    try {
      const response = await api.get('/trips/search', { params: filters });
      const backendTrips = normalizeTripList(response.data);
      const trips = mergeTrips(backendTrips, fallbackTrips);
      return {
        ...response.data,
        success: true,
        count: trips.length,
        trips,
        data: trips,
      };
    } catch (error) {
      if (!canUseFallback(error)) throw error;

      return {
        success: true,
        count: fallbackTrips.length,
        trips: fallbackTrips,
        data: fallbackTrips,
        source: 'rwanda-demo-fallback',
      };
    }
  },

  async getTripMeta() {
    const fallbackMeta = getRwandaTripMeta();

    try {
      const response = await api.get('/trips/meta');
      const meta = mergeTripMeta(response.data?.data || response.data, fallbackMeta);
      return { ...response.data, success: true, data: meta };
    } catch (error) {
      if (!canUseFallback(error)) throw error;
      return { success: true, data: fallbackMeta, source: 'rwanda-demo-fallback' };
    }
  },

  async getTripById(id) {
    if (isDemoTripId(id)) {
      const trip = getRwandaTripById(id);
      return { success: Boolean(trip), trip, data: trip };
    }

    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  async getTripsByCompany(companyId) {
    const response = await api.get(`/trips/company/${companyId}`);
    return response.data;
  },

  async getAvailableSeats(tripId) {
    if (isDemoTripId(tripId)) {
      return { success: true, data: getRwandaSeatInfo(tripId) };
    }

    try {
      const response = await api.get(`/trips/${tripId}/seats`);
      return response.data;
    } catch (error) {
      if (!canUseFallback(error)) throw error;
      return { success: true, data: getRwandaSeatInfo(tripId), source: 'rwanda-demo-fallback' };
    }
  },
};

export const bookingService = {
  async createBooking(bookingData) {
    try {
      const response = await api.post('/bookings', bookingData);
      return response.data;
    } catch (error) {
      if (!isDemoTripId(bookingData?.tripId) && !canUseFallback(error)) throw error;
      const booking = createDemoBooking(bookingData);
      return { success: true, booking, data: booking, source: 'rwanda-demo-fallback' };
    }
  },

  async getBooking(id) {
    if (isDemoBookingId(id)) {
      const booking = getDemoBooking(id);
      return { success: Boolean(booking), booking, data: booking };
    }

    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async getMyBookings() {
    try {
      const response = await api.get('/bookings/my-bookings');
      return response.data;
    } catch (error) {
      if (!canUseFallback(error)) throw error;
      const bookings = getDemoBookings();
      return { success: true, bookings, data: bookings, source: 'rwanda-demo-fallback' };
    }
  },

  async cancelBooking(id) {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  },

  async getBookingHistory() {
    try {
      const response = await api.get('/bookings/history');
      return response.data;
    } catch (error) {
      if (!canUseFallback(error)) throw error;
      const bookings = dashboardFallbackBookings();
      return { success: true, bookings, data: bookings, source: 'rwanda-demo-fallback' };
    }
  },
};

export const paymentService = {
  async initiatePayment(paymentData) {
    try {
      const response = await api.post('/payments/initiate', paymentData);
      return response.data;
    } catch (error) {
      if (!isDemoBookingId(paymentData?.bookingId) && !canUseFallback(error)) throw error;
      const booking = confirmDemoPayment({
        bookingId: paymentData?.bookingId,
        method: paymentData?.method,
      });
      return { success: true, booking, data: booking, source: 'rwanda-demo-fallback' };
    }
  },

  async verifyPayment(transactionId) {
    const response = await api.get(`/payments/verify/${transactionId}`);
    return response.data;
  },

  async getPaymentStatus(bookingId) {
    const response = await api.get(`/payments/status/${bookingId}`);
    return response.data;
  },
};

export const ticketService = {
  async getTickets() {
    try {
      const response = await api.get('/tickets');
      return response.data;
    } catch (error) {
      if (!canUseFallback(error)) throw error;
      const bookings = getDemoBookings();
      return { success: true, bookings, data: bookings, source: 'rwanda-demo-fallback' };
    }
  },

  async getTicket(id) {
    if (isDemoBookingId(id)) {
      const booking = getDemoBooking(id);
      return { success: Boolean(booking), booking, data: booking };
    }

    try {
      const response = await api.get(`/tickets/${id}`);
      return response.data;
    } catch (error) {
      const booking = getDemoBooking(id);
      if (booking && canUseFallback(error)) {
        return { success: true, booking, data: booking, source: 'rwanda-demo-fallback' };
      }
      throw error;
    }
  },
};

export const companyService = {
  async getAllCompanies() {
    const response = await api.get('/companies');
    return response.data;
  },

  async getCompanyById(id) {
    const response = await api.get(`/companies/${id}`);
    return response.data;
  },

  async getCompanyTrips(companyId) {
    const response = await api.get(`/companies/${companyId}/trips`);
    return response.data;
  },
};

export const notificationService = {
  async getNotifications() {
    const response = await api.get('/notifications');
    return response.data;
  },

  async markAsRead(id) {
    const response = await api.patch(`/notifications/${id}/read`);
    return response.data;
  },

  async deleteNotification(id) {
    const response = await api.delete(`/notifications/${id}`);
    return response.data;
  },
};
