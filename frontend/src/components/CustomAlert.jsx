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
      bg: isDarkMode ? 'bg-[#0d0d0d]' : 'bg-white'
    },
    error: {
      icon: <FaExclamationCircle className="text-red-500" />,
      border: isDarkMode ? 'border-red-500/50' : 'border-red-500/40',
      bg: isDarkMode ? 'bg-[#0d0d0d]' : 'bg-white'
    },
    info: {
      icon: <FaInfoCircle className="text-blue-400" />,
      border: isDarkMode ? 'border-blue-400/50' : 'border-blue-400/40',
      bg: isDarkMode ? 'bg-[#0d0d0d]' : 'bg-white'
    }
  };

  const { icon, border, bg } = config[type] || config.success;

  return (
    // Removido max-w-xs e adicionado md:max-w-md para PC. 
    // w-max garante que ele não fique "esticado" se a mensagem for curta.
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[92%] sm:w-max md:max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`${bg} ${border} border rounded-[1.8rem] p-4 pr-5 shadow-[0_20px_50px_rgba(0,0,0,0.3)] flex items-center gap-4 transition-all duration-300 backdrop-blur-xl`}>
        
        <div className="text-xl shrink-0">
          {icon}
        </div>

        <div className="flex-1 min-w-0">
          <p className={`text-[10px] md:text-[11px] font-black uppercase tracking-[2px] md:tracking-[3px] leading-snug whitespace-normal break-words ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            {message}
          </p>
        </div>

        <button 
          onClick={onClose}
          className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isDarkMode 
            ? 'text-gray-500 hover:text-white hover:bg-white/5' 
            : 'text-gray-400 hover:text-black hover:bg-black/5'
          }`}
        >
          <FaTimes size={14} />
        </button>
      </div>
    </div>
  );
}