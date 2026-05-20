import { Toaster } from 'react-hot-toast';

export const ToastProvider = () => {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          background: '#fff',
          color: '#000',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
          borderRadius: '0.5rem',
          padding: '1rem',
        },
        success: {
          style: {
            background: '#10b981',
            color: '#fff',
          },
          icon: '✅',
        },
        error: {
          style: {
            background: '#ef4444',
            color: '#fff',
          },
          icon: '❌',
        },
      }}
    />
  );
};

export default ToastProvider;
