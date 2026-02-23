import React, { useEffect } from 'react';
import { FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaTimes } from 'react-icons/fa';

export default function CustomAlert({ message, type = 'success', onClose, duration = 3000 }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [onClose, duration]);

  const config = {
    success: {
      icon: <FaCheckCircle className="text-[#e6b32a]" />,
      border: 'border-[#e6b32a]/50',
      bg: 'bg-[#111]'
    },
    error: {
      icon: <FaExclamationCircle className="text-red-500" />,
      border: 'border-red-500/50',
      bg: 'bg-[#111]'
    },
    info: {
      icon: <FaInfoCircle className="text-blue-400" />,
      border: 'border-blue-400/50',
      bg: 'bg-[#111]'
    }
  };

  const { icon, border, bg } = config[type] || config.success;

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[9999] w-[90%] max-w-xs animate-in fade-in slide-in-from-top-4 duration-300">
      <div className={`${bg} ${border} border rounded-[1.5rem] p-4 shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex items-center gap-3 backdrop-blur-md`}>
        <div className="text-lg">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-white/90 leading-tight">
            {message}
          </p>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-white transition-colors"
        >
          <FaTimes size={12} />
        </button>
      </div>
    </div>
  );
}