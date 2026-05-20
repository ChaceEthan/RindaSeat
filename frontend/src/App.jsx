import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';
import { ToastProvider } from './context/ToastProvider';
import { ThemeProvider } from './context/ThemeContext';

function App() {
  useEffect(() => {
    // Initialize theme on app load
    const isDark = localStorage.getItem('darkMode') === 'true';
    if (isDark) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <ThemeProvider>
      <ToastProvider />
      <AppRoutes />
    </ThemeProvider>
  );
}

export default App;
