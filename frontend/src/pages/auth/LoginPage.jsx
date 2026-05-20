// @ts-nocheck
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { TextInput } from '../../components/forms/FormInputs';
import { LoadingSpinner } from '../../components/loaders/Loaders';
import GoogleAuthButton from '../../components/auth/GoogleAuthButton';
import { authService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await authService.login(formData.email, formData.password);
      const { data, success } = response;
      
      if (!success || !data || !data.user || !data.token) {
        throw new Error('Invalid response from server');
      }

      login(data.user, data.token, data.refreshToken || data.token);
      toast.success('Login successful');
      navigate(searchParams.get('redirect') || '/dashboard', { replace: true });
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.message 
        || error.message 
        || 'Login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-2xl">RS</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome Back
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Sign in to your RindaSeat account
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5 mb-6">
          <TextInput
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            required
          />

          <TextInput
            label="Password"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="********"
            required
          />

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2">
              <input type="checkbox" className="w-4 h-4 accent-primary-600" />
              <span className="text-sm text-gray-700 dark:text-gray-300">
                Remember me
              </span>
            </label>
            <Link to="/help" className="text-sm text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : 'Sign In'}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400">
              Or continue with
            </span>
          </div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-1 gap-3 mb-6">
          <GoogleAuthButton 
            size="md"
            onSuccess={() => navigate(searchParams.get('redirect') || '/dashboard', { replace: true })}
          />
        </div>

        {/* Sign Up Link */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          Don&apos;t have an account?{' '}
          <Link to={`/auth/signup${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`} className="text-primary-600 font-semibold hover:text-primary-700">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default LoginPage;
