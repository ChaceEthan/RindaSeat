// @ts-nocheck
import { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import toast from 'react-hot-toast';
import { Button } from '../buttons/Button';
import { LoadingSpinner } from '../loaders/Loaders';
import firebaseAuthService from '../../services/firebaseAuthService';
import { authService } from '../../services/api';
import useAuthStore from '../../store/authStore';

const getAuthErrorMessage = (error) => {
  if (!error?.response && (error?.code === 'ERR_NETWORK' || error?.message === 'Network Error')) {
    return 'RindaSeat API is not reachable. Check VITE_API_URL or start the backend service.';
  }

  return error.response?.data?.message || error.message || 'Sign in failed. Please try again.';
};

export const GoogleAuthButton = ({ onSuccess, size = 'md' }) => {
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuthStore();

  const handleGoogleAuth = async () => {
    if (!firebaseAuthService.isConfigured()) {
      toast.error('Google authentication is not configured');
      return;
    }

    setIsLoading(true);

    try {
      // Get Firebase ID token
      const firebaseResult = await firebaseAuthService.signInWithGoogle();

      if (!firebaseResult.success) {
        toast.error(firebaseResult.error || 'Google sign-in failed');
        setIsLoading(false);
        return;
      }

      // Send token to backend
      const response = await authService.googleAuth(firebaseResult.idToken);

      if (!response.success || !response.data) {
        throw new Error(response.message || 'Server error');
      }

      // Store auth data
      const { user, token, refreshToken } = response.data;
      login(user, token, refreshToken || token);

      toast.success('Sign in successful');
      
      if (onSuccess) {
        onSuccess(user);
      }
    } catch (error) {
      if (import.meta.env.VITE_DEBUG_AUTH === 'true') {
        console.error('Google auth error:', error);
      }
      toast.error(getAuthErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size={size}
      onClick={handleGoogleAuth}
      disabled={isLoading}
      className="w-full flex items-center justify-center gap-2"
    >
      {isLoading ? (
        <LoadingSpinner />
      ) : (
        <>
          <FcGoogle size={20} />
          <span>Google</span>
        </>
      )}
    </Button>
  );
};

export default GoogleAuthButton;
