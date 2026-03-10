import React from 'react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../components/ThemeContext';

export default function AdminLayout({ children }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar Fixa */}
      <div className="print:hidden">
        <Sidebar />
      </div>

      {/* Conteúdo Principal com margem fixa para compensar a Sidebar de 80px (w-20) */}
      <main className="flex-1 flex flex-col ml-20 print:ml-0">
        <div className="flex-1 w-full max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>

    </div>
  );
}