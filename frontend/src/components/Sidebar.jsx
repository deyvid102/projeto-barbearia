import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { 
  IoGridOutline, 
  IoCalendarOutline, 
  IoPeopleOutline, 
  IoStatsChartOutline,
  IoReaderOutline,
  IoArrowBack
} from 'react-icons/io5';
import { MdContentCut } from 'react-icons/md';

export default function Sidebar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const menuItems = [
    {
      label: 'voltar para tela de barbeiro',
      icon: <IoArrowBack size={22} />,
      path: `/barbeiro/dashboard/${id}`,
      special: true 
    },
    {
      label: 'Painel Admin',
      icon: <IoGridOutline size={22} />,
      path: `/admin/dashboard/${id}`,
    },
    {
      label: 'Agenda',
      icon: <IoCalendarOutline size={22} />,
      path: `/admin/agenda/${id}`,
    },
    {
      label: 'Barbeiros',
      icon: <IoPeopleOutline size={22} />,
      path: `/admin/barbeiros/${id}`,
    },
    {
      label: 'Serviços',
      icon: <MdContentCut size={22} />,
      path: `/admin/valores/${id}`,
    },
    {
      label: 'Logs de Atividade',
      icon: <IoReaderOutline size={22} />,
      path: `/admin/logs/${id}`,
    },
    {
      label: 'Analytics',
      icon: <IoStatsChartOutline size={22} />,
      path: `/admin/analytics/${id}`,
    },
  ];

  return (
    <aside 
      className={`fixed left-0 top-0 h-screen w-20 z-50 border-r flex flex-col items-center py-10 print:hidden ${
        isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-100'
      }`}
    >
      {/* Logo removido conforme solicitado */}

      {/* Navegação */}
      <nav className="flex-1 flex flex-col gap-4 w-full px-3">
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <div key={item.label} className="relative group flex justify-center">
              <button
                onClick={() => navigate(item.path)}
                className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-colors ${
                  isActive 
                    ? 'bg-[#e6b32a] text-black shadow-md' 
                    : isDarkMode 
                      ? 'text-gray-500 hover:bg-white/5 hover:text-white' 
                      : 'text-slate-400 hover:bg-slate-50 hover:text-slate-900'
                } ${item.special ? 'mb-6 border-b border-black/10 dark:border-white/10 pb-6 w-full' : ''}`}
              >
                {item.icon}
              </button>

              {/* Tooltip Instantâneo */}
              <div className="absolute left-full ml-3 px-3 py-2 bg-black text-white text-[9px] font-black uppercase tracking-widest rounded-lg hidden group-hover:block z-50 whitespace-nowrap border border-white/10 shadow-2xl">
                <div className="absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-black rotate-45 border-l border-b border-white/10" />
                {item.label}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}