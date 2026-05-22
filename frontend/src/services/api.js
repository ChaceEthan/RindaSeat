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
  getLiveTrackingSnapshot,
  getRoadsidePickupOptions,
  searchRwandaTrips,
  UUID_V4_PATTERN,
} from '../data/rwandaTransport';

const isUuid = (id) => UUID_V4_PATTERN.test(String(id || ''));
const getLocalTrip = (id) => getRwandaTripById(id);
const isDemoTripId = (id) => String(id || '').startsWith('rw-') || Boolean(getLocalTrip(id));
const isDemoBookingId = (id) => (
  String(id || '').startsWith('demo-')
  || String(id || '').startsWith('sample-')
  || Boolean(getDemoBooking(id))
);
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
    stationHierarchy: primaryMeta.stationHierarchy || fallbackMeta.stationHierarchy || [],
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
    const localTrip = getLocalTrip(id);
    if (localTrip) {
      const trip = localTrip;
      return { success: Boolean(trip), trip, data: trip };
    }

    try {
      const response = await api.get(`/trips/${id}`);
      return response.data;
    } catch (error) {
      if (!canUseFallback(error)) throw error;
      const trip = getLocalTrip(id);
      return { success: Boolean(trip), trip, data: trip, source: 'rwanda-demo-fallback' };
    }
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
    if (isDemoTripId(bookingData?.tripId) || !isUuid(bookingData?.tripId)) {
      const booking = createDemoBooking(bookingData);
      return { success: true, booking, data: booking, source: 'rwanda-demo-fallback' };
    }

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
    const demoBooking = getDemoBooking(id);
    if (demoBooking || isDemoBookingId(id)) {
      const booking = demoBooking;
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
    if (
      paymentData?.source === 'rwanda-demo-fallback'
      || paymentData?.isDemoBooking
      || isDemoBookingId(paymentData?.bookingId)
      || !isUuid(paymentData?.bookingId)
    ) {
      const booking = confirmDemoPayment({
        bookingId: paymentData?.bookingId,
        method: paymentData?.method,
      });
      return { success: true, booking, data: booking, source: 'rwanda-demo-fallback' };
    }

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
    if (isDemoBookingId(bookingId) || !isUuid(bookingId)) {
      const booking = getDemoBooking(bookingId);
      return { success: true, data: { bookingId, status: booking?.paymentStatus || 'pending' } };
    }

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
    const demoBooking = getDemoBooking(id);
    if (demoBooking || isDemoBookingId(id)) {
      const booking = demoBooking;
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

export const trackingService = {
  async getTripTracking(tripId) {
    if (isDemoTripId(tripId)) {
      const trip = getLocalTrip(tripId);
      const tracking = getLiveTrackingSnapshot(trip);
      return { success: true, tracking, data: tracking, source: 'rwanda-demo-fallback' };
    }

    const response = await api.get(`/trips/${tripId}/tracking`);
    return response.data;
  },

  async updateDriverLocation(tripId, payload) {
    const response = await api.post(`/trips/${tripId}/location`, payload);
    return response.data;
  },

  async sharePassengerLocation(tripId, payload) {
    const response = await api.post(`/trips/${tripId}/passenger-location`, payload);
    return response.data;
  },

  async getDriverDashboard(tripId) {
    if (isDemoTripId(tripId)) {
      const trip = getLocalTrip(tripId);
      const tracking = getLiveTrackingSnapshot(trip);
      const passengerMarkers = getRoadsidePickupOptions(trip).slice(0, 4).map((point, index) => ({
        id: point.id,
        passengerName: index % 2 === 0 ? 'Pickup passenger' : 'Pending passenger',
        pickupPoint: point.name,
        latitude: point.latitude,
        longitude: point.longitude,
        status: index === 0 ? 'boarded' : 'waiting',
        seatsRequested: 1,
      }));
      const dashboard = {
        tripId,
        tracking,
        passengerMarkers,
        pickupIndicators: passengerMarkers.map((marker) => ({
          ...marker,
          status: marker.status === 'boarded' ? 'green' : 'red',
        })),
        occupancy: {
          remainingSeats: tracking.seatsLeft,
          totalSeats: tracking.totalSeats,
          percentage: Math.round((tracking.passengersOnboard / Math.max(1, tracking.totalSeats)) * 100),
          isFull: tracking.seatsLeft <= 0,
        },
        qrVerification: { enabled: true },
      };
      return { success: true, dashboard, data: dashboard, source: 'rwanda-demo-fallback' };
    }

    const response = await api.get(`/trips/${tripId}/driver-dashboard`);
    return response.data;
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
