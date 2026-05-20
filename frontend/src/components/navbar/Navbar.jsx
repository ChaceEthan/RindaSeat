// @ts-nocheck
import { motion } from 'framer-motion';
import { NavLink, Link } from 'react-router-dom';
import { BsSun, BsMoon, BsPersonCircle } from 'react-icons/bs';
import { useTheme } from '../../context/ThemeContext';
import useAuthStore from '../../store/authStore';

const navClass = ({ isActive }) => (
  `font-medium transition ${isActive ? 'text-primary-600' : 'text-gray-700 dark:text-gray-300 hover:text-primary-600'}`
);

export const Navbar = ({ onMenuClick }) => {
  const { isDark, toggleTheme } = useTheme();
  const { isAuthenticated, user } = useAuthStore();

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="sticky top-0 z-40 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">RS</span>
            </div>
            <span className="font-bold text-xl text-gray-900 dark:text-white hidden sm:inline">
              RindaSeat
            </span>
          </Link>

          <div className="hidden md:flex gap-8">
            <NavLink to="/" className={navClass}>Home</NavLink>
            <NavLink to="/trips" className={navClass}>Trips</NavLink>
            <NavLink to="/about" className={navClass}>About</NavLink>
            <NavLink to="/contact" className={navClass}>Contact</NavLink>
            {isAuthenticated && <NavLink to="/dashboard" className={navClass}>Dashboard</NavLink>}
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <BsSun className="w-5 h-5 text-yellow-500" />
              ) : (
                <BsMoon className="w-5 h-5 text-gray-600" />
              )}
            </button>

            <div className="hidden sm:flex items-center gap-2">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition"
                >
                  <BsPersonCircle />
                  {user?.name || user?.fullName || 'Account'}
                </Link>
              ) : (
                <>
                  <Link to="/auth/login" className="px-3 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 transition">
                    Login
                  </Link>
                  <Link to="/auth/signup" className="px-4 py-2 rounded-lg text-sm font-medium bg-primary-600 text-white hover:bg-primary-700 shadow-sm transition">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={onMenuClick}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6 text-gray-900 dark:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
