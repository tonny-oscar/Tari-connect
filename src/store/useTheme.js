import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useTheme = create(
  persist(
    (set, get) => ({
      isDark: false,
      toggleTheme: () => {
        const newTheme = !get().isDark;
        set({ isDark: newTheme });
        
        // Update document class
        if (newTheme) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      },
      initTheme: () => {
        const isDark = get().isDark;
        if (isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    {
      name: 'theme-storage',
    }
  )
);