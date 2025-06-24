import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../store/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-all duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 min-h-[44px] min-w-[44px] flex items-center justify-center ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <FaMoon className="text-gray-300 text-lg" />
      ) : (
        <FaSun className="text-yellow-500 text-lg" />
      )}
    </button>
  );
};

export default ThemeToggle;