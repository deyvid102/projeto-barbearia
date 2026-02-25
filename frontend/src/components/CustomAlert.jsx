import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';
import { useTheme } from './ThemeContext';

export default function CustomAlert({ message, type = 'success', onClose, duration = 3000 }) {
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = {
    success: {
      icon: <FaCheckCircle className="text-[#e6b32a]" />,
      border: isDarkMode ? 'border-[#e6b32a]/50' : 'border-[#e6b32a]/40',
      bg: isDarkMode ? 'bg-[#111]' : 'bg-white'
    },
    error: {
      icon: <FaExclamationCircle className="text-red-500" />,
      border: isDarkMode ? 'border-red-500/50' : 'border-red-500/40',
      bg: isDarkMode ? 'bg-[#111]' : 'bg-white'
    },
    info: {
      icon: <FaInfoCircle className="text-blue-400" />,
      border: isDarkMode ? 'border-blue-400/50' : 'border-blue-400/40',
      bg: isDarkMode ? 'bg-[#111]' : 'bg-white'
    }
  };

  const { icon, border, bg } = config[type] || config.success;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-xs animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`${bg} ${border} border rounded-[1.5rem] p-4 shadow-2xl flex items-center gap-3 transition-all duration-300`}>
        <div className="text-lg">
          {icon}
        </div>
        <div className="flex-1">
          <p className={`text-[11px] font-black uppercase tracking-widest leading-tight ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {message}
          </p>
        </div>
        <button 
          onClick={onClose}
          className={`${isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'} transition-colors`}
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
}