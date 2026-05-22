// @ts-nocheck
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import MainLayout from '../layouts/MainLayout';
import HomePage from '../pages/home/HomePage';
import LoginPage from '../pages/auth/LoginPage';
import SignupPage from '../pages/auth/SignupPage';
import TripsSearchPage from '../pages/trips/TripsSearchPage';
import BookingSeatPage from '../pages/booking/BookingSeatPage';
import PassengerDetailsPage from '../pages/booking/PassengerDetailsPage';
import PaymentsPage from '../pages/payments/PaymentsPage';
import TicketsPage from '../pages/tickets/TicketsPage';
import DashboardPage from '../pages/dashboard/DashboardPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';
import DriverDashboardPage from '../pages/driver/DriverDashboardPage';
import { AboutPage, ContactPage, FAQPage, HelpCenterPage, PrivacyPage, TermsPage, CookiesPage } from '../pages/public/PublicPages';
import useAuthStore from '../store/authStore';
import useUIStore from '../store/uiStore';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  const location = useLocation();
  const redirect = `${location.pathname}${location.search}`;
  return isAuthenticated ? children : <Navigate to={`/login?redirect=${encodeURIComponent(redirect)}`} replace />;
};

export const AppRoutes = () => {
  const { darkMode } = useUIStore();

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <MainLayout>
              <HomePage />
            </MainLayout>
          }
        />

        {/* Auth Routes */}
        <Route
          path="/auth/login"
          element={
            <MainLayout>
              <LoginPage />
            </MainLayout>
          }
        />
        <Route
          path="/login"
          element={
            <MainLayout>
              <LoginPage />
            </MainLayout>
          }
        />
        <Route
          path="/auth/signup"
          element={
            <MainLayout>
              <SignupPage />
            </MainLayout>
          }
        />
        <Route
          path="/signup"
          element={
            <MainLayout>
              <SignupPage />
            </MainLayout>
          }
        />

        {/* Trip Routes */}
        <Route
          path="/trips"
          element={
            <MainLayout>
              <TripsSearchPage />
            </MainLayout>
          }
        />
        <Route path="/about" element={<MainLayout><AboutPage /></MainLayout>} />
        <Route path="/contact" element={<MainLayout><ContactPage /></MainLayout>} />
        <Route path="/faq" element={<MainLayout><FAQPage /></MainLayout>} />
        <Route path="/help" element={<MainLayout><HelpCenterPage /></MainLayout>} />
        <Route path="/privacy" element={<MainLayout><PrivacyPage /></MainLayout>} />
        <Route path="/terms" element={<MainLayout><TermsPage /></MainLayout>} />
        <Route path="/cookies" element={<MainLayout><CookiesPage /></MainLayout>} />

        {/* Booking Routes */}
        <Route
          path="/booking/:tripId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <BookingSeatPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Payment Routes */}
        <Route
          path="/booking/:tripId/passengers"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PassengerDetailsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/booking/:tripId/payment"
          element={
            <ProtectedRoute>
              <MainLayout>
                <PaymentsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Tickets Routes */}
        <Route
          path="/tickets"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TicketsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tickets/:bookingId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <TicketsPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Dashboard Routes */}
        <Route
          path="/driver"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DriverDashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/driver/:tripId"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DriverDashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/bookings"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MainLayout>
                <DashboardPage initialSection="account" />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <MainLayout>
                <AdminDashboardPage />
              </MainLayout>
            </ProtectedRoute>
          }
        />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
