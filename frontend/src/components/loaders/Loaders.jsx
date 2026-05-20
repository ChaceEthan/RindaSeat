// @ts-nocheck
import { motion } from 'framer-motion';

export const Skeleton = ({ width = 'w-full', height = 'h-4', className = '' }) => {
  return (
    <motion.div
      animate={{ opacity: [0.6, 1, 0.6] }}
      transition={{ duration: 1.5, repeat: Infinity }}
      className={`${width} ${height} bg-gray-200 dark:bg-gray-700 rounded ${className}`}
    />
  );
};

export const LoadingSpinner = ({ size = 'md' }) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      className={`${sizes[size]} border-4 border-gray-200 dark:border-gray-700 border-t-primary-600 rounded-full`}
    />
  );
};

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white dark:bg-gray-900">
      <div className="flex flex-col items-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-600 dark:text-gray-400">Loading...</p>
      </div>
    </div>
  );
};

export default LoadingSpinner;
