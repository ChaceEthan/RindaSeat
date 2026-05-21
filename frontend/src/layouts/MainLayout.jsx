// @ts-nocheck
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/navbar/Navbar';
import { Footer } from '../components/footer/Footer';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';

export const MainLayout = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthenticated } = useAuthStore();
  const links = [
    ['/', 'Home'],
    ['/trips', 'Search Trips'],
    ['/about', 'About'],
    ['/contact', 'Contact'],
    ['/faq', 'FAQ'],
    ...(isAuthenticated ? [['/dashboard', 'Dashboard'], ['/tickets', 'Tickets']] : [['/login', 'Login'], ['/signup', 'Sign Up']]),
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      <Navbar onMenuClick={() => setMobileMenuOpen(!mobileMenuOpen)} />

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 space-y-2"
        >
          {links.map(([to, label]) => (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 px-4 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition"
            >
              {label}
            </Link>
          ))}
        </motion.div>
      )}

      {/* Main Content */}
      <main className="flex-grow">
        {children}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default MainLayout;
