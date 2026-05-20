// @ts-nocheck
import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '../../components/buttons/Button';
import { TextInput } from '../../components/forms/FormInputs';
import { LoadingSpinner } from '../../components/loaders/Loaders';
import { authService } from '../../services/api';
import useAuthStore from '../../store/authStore';
import toast from 'react-hot-toast';

export const SignupPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.signup({
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
      });
      const payload = response.data || response;
      login(payload.user, payload.token, payload.refreshToken || payload.token);
      toast.success('Account created');
      navigate(searchParams.get('redirect') || '/dashboard', { replace: true });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Signup failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 py-12">
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
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Join RindaSeat today
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <TextInput
            label="Full Name"
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="John Doe"
            required
          />

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
            label="Phone Number"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+250 7XX XXX XXX"
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

          <TextInput
            label="Confirm Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="********"
            required
          />

          <label className="flex items-start gap-2">
            <input type="checkbox" className="w-4 h-4 accent-primary-600 mt-1" required />
            <span className="text-sm text-gray-700 dark:text-gray-300">
              I agree to the{' '}
              <Link to="/terms" className="text-primary-600 hover:text-primary-700 font-medium">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link to="/privacy" className="text-primary-600 hover:text-primary-700 font-medium">
                Privacy Policy
              </Link>
            </span>
          </label>

          <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? <LoadingSpinner /> : 'Create Account'}
          </Button>
        </form>

        {/* Sign In Link */}
        <p className="text-center text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to={`/auth/login${searchParams.get('redirect') ? `?redirect=${encodeURIComponent(searchParams.get('redirect'))}` : ''}`} className="text-primary-600 font-semibold hover:text-primary-700">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
