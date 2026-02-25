import React from 'react';
import { IoClose } from 'react-icons/io5';
import { useTheme } from './ThemeContext';

export default function SidebarFiltros({ isOpen, onClose, title, children, onApply }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`fixed inset-0 z-[1000] ${isOpen ? 'visible' : 'invisible'}`}>
      {/* Overlay */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`} 
        onClick={onClose} 
      />
      
      {/* Painel Lateral */}
      <aside className={`absolute top-0 right-0 h-full w-80 bg-white dark:bg-[#0d0d0d] p-6 shadow-2xl transition-transform duration-300 ${isOpen ? 'translate-x-0' : 'translate-x-full'} overflow-y-auto`}>
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-sm font-black italic lowercase tracking-tighter text-gray-900 dark:text-white">
            {title.split('.')[0]}.<span className="text-[#e6b32a]">{title.split('.')[1]}</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-red-500 transition-colors">
            <IoClose size={24} />
          </button>
        </div>

        <div className="space-y-8">
          {children}

          <button 
            onClick={() => { onApply?.(); onClose(); }} 
            className="w-full py-4 bg-black dark:bg-white text-white dark:text-black rounded-2xl font-black uppercase text-[10px] tracking-[4px] hover:bg-[#e6b32a] dark:hover:bg-[#e6b32a] hover:text-black transition-all mt-4 shadow-xl"
          >
            aplicar filtros
          </button>
        </div>
      </aside>
    </div>
  );
}