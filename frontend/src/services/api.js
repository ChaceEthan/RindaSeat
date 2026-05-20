// @ts-nocheck
import api from '../api/axios';

export const authService = {
  async signup(userData) {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },

  async login(email, password) {
    const response = await api.post('/auth/login', { email, password });
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
    const response = await api.get('/trips/search', { params: filters });
    return response.data;
  },

  async getTripMeta() {
    const response = await api.get('/trips/meta');
    return response.data;
  },

  async getTripById(id) {
    const response = await api.get(`/trips/${id}`);
    return response.data;
  },

  async getTripsByCompany(companyId) {
    const response = await api.get(`/trips/company/${companyId}`);
    return response.data;
  },

  async getAvailableSeats(tripId) {
    const response = await api.get(`/trips/${tripId}/seats`);
    return response.data;
  },
};

export const bookingService = {
  async createBooking(bookingData) {
    const response = await api.post('/bookings', bookingData);
    return response.data;
  },

  async getBooking(id) {
    const response = await api.get(`/bookings/${id}`);
    return response.data;
  },

  async getMyBookings() {
    const response = await api.get('/bookings/my-bookings');
    return response.data;
  },

  async cancelBooking(id) {
    const response = await api.post(`/bookings/${id}/cancel`);
    return response.data;
  },

  async getBookingHistory() {
    const response = await api.get('/bookings/history');
    return response.data;
  },
};

export const paymentService = {
  async initiatePayment(paymentData) {
    const response = await api.post('/payments/initiate', paymentData);
    return response.data;
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
    const response = await api.get('/tickets');
    return response.data;
  },

  async getTicket(id) {
    const response = await api.get(`/tickets/${id}`);
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
