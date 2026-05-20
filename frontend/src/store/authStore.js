// @ts-nocheck
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      setUser: (user) => set({ user }),

      setToken: (token) => set({ token }),

      login: (user, token, refreshToken) => {
        localStorage.setItem('token', token);
        localStorage.setItem('refreshToken', refreshToken);
        set({
          user,
          token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        });
      },

      updateUser: (userData) => set((state) => ({
        user: { ...state.user, ...userData },
      })),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);

export default useAuthStore;
