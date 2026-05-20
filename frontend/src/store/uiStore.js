// @ts-nocheck
import { create } from 'zustand';

const useUIStore = create((set) => ({
  darkMode: localStorage.getItem('darkMode') === 'true',
  sidebarOpen: true,

  toggleDarkMode: () => set((state) => {
    const newValue = !state.darkMode;
    localStorage.setItem('darkMode', newValue);
    if (newValue) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    return { darkMode: newValue };
  }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));

export default useUIStore;
