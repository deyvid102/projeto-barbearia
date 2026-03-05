import React, { useEffect, useState, useRef } from 'react';
import { IoCheckmarkCircle, IoCloseCircle, IoInformationCircle } from 'react-icons/io5';
import { useTheme } from './ThemeContext';

export default function CustomAlert({ titulo, message, type = 'success', onClose, duration = 3000 }) {
  const { isDarkMode } = useTheme();
  const [visible, setVisible] = useState(false);
  const onCloseRef = useRef(onClose);

  // Mantém a referência da função sempre atualizada sem disparar o useEffect
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    // 1. Entrada
    const entryTimer = setTimeout(() => setVisible(true), 10);

    // 2. Saída (Animação)
    const exitTimer = setTimeout(() => {
      setVisible(false);
    }, duration - 500);

    // 3. Fechamento Real
    const closeTimer = setTimeout(() => {
      if (onCloseRef.current) onCloseRef.current();
    }, duration);

    return () => {
      clearTimeout(entryTimer);
      clearTimeout(exitTimer);
      clearTimeout(closeTimer);
    };
  }, [duration]); // Removi onClose das dependências para evitar o loop!

  const config = {
    success: { icon: <IoCheckmarkCircle className="text-[#e6b32a]" />, border: 'border-[#e6b32a]/20', text: 'text-[#e6b32a]' },
    error: { icon: <IoCloseCircle className="text-red-500" />, border: 'border-red-500/20', text: 'text-red-500' },
    info: { icon: <IoInformationCircle className="text-blue-400" />, border: 'border-blue-400/20', text: 'text-blue-400' }
  };

  const current = config[type] || config.success;

  return (
    <div className={`
      fixed top-10 left-1/2 -translate-x-1/2 z-[10000]
      transition-all duration-700 ease-in-out transform
      ${visible ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-12 scale-90'}
    `}>
      <div className={`
        flex items-center gap-3 px-6 py-2.5
        ${isDarkMode ? 'bg-[#0a0a0a]/95 border-white/5' : 'bg-white/95 border-slate-200'}
        ${current.border} border backdrop-blur-2xl
        rounded-full shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)]
      `}>
        <div className="text-xl shrink-0">{current.icon}</div>
        <div className="flex flex-col min-w-0">
          {titulo && (
            <span className={`text-[7px] font-black uppercase tracking-[0.25em] leading-none mb-0.5 ${current.text} opacity-80`}>
              {titulo}
            </span>
          )}
          <span className={`text-[10px] font-bold uppercase tracking-[0.15em] whitespace-nowrap ${isDarkMode ? 'text-white/90' : 'text-slate-800'}`}>
            {message}
          </span>
        </div>
      </div>
    </div>
  );
}