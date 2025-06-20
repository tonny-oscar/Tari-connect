import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../store/useTheme';

const ThemeToggle = ({ className = '' }) => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`p-2 rounded-lg transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 ${className}`}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <FaSun className="text-yellow-500" />
      ) : (
        <FaMoon className="text-gray-600" />
      )}
    </button>
  );
};

export default ThemeToggle;