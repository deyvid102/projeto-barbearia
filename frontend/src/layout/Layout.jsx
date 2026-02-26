import React from 'react';
import Sidebar from '../components/Sidebar'
import { useTheme } from '../components/ThemeContext';

export default function AdminLayout({ children }) {
  const { isDarkMode } = useTheme();

  return (
    <div className={`min-h-screen flex ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} transition-colors duration-300`}>
      {/* Sidebar Fixo */}
      <Sidebar />

      {/* Conteúdo da Página */}
      <main className="flex-1 overflow-x-hidden">
        {children}
      </main>
    </div>
  );
}