import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../components/ThemeContext';
import { IoMenuOutline, IoCloseOutline } from 'react-icons/io5';

export default function AdminLayout({ children }) {
  const { isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className={`min-h-screen w-full flex overflow-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar fixa em desktop */}
      <div className="hidden lg:block flex-shrink-0 print:hidden">
        <Sidebar />
      </div>

      {/* Sidebar mobile como overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden print:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="relative z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Topbar mobile com botão de menu */}
        <div
          className={`md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b ${
            isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-slate-50 border-slate-200'
          }`}
        >
          <button
            onClick={() => setIsSidebarOpen(prev => !prev)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-black uppercase tracking-[2px] active:scale-95 transition-all
              bg-white/5 border-white/10"
          >
            {isSidebarOpen ? <IoCloseOutline size={18} /> : <IoMenuOutline size={18} />}
            <span>Menu</span>
          </button>
        </div>

        <div className="flex-1 w-full max-w-[1600px] mx-auto px-3 md:px-6 lg:px-8">
          {children}
        </div>
      </main>

    </div>
  );
}