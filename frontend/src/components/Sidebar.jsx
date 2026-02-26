import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext'; // Ajuste o caminho se necessário
import { 
  IoArrowBack, IoPeople, IoCalendar, IoAnalytics, 
  IoCut, IoDocumentText, IoLogOutOutline 
} from 'react-icons/io5';

export default function Sidebar() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const menuItems = [
    { icon: <IoAnalytics />, label: 'Analytics', path: `/admin/analytics/${id}` },
    { icon: <IoPeople />, label: 'Equipe', path: `/admin/barbeiros/${id}` },
    { icon: <IoDocumentText />, label: 'Logs', path: `/admin/logs/${id}` },
    { icon: <IoCalendar />, label: 'Agenda', path: `/admin/dashboard/${id}` },
    { icon: <IoCut />, label: 'Serviços', path: `/admin/valores/${id}` },
  ];

  return (
    <aside className={`w-20 hidden md:flex flex-col items-center py-8 gap-8 border-r h-screen sticky top-0 z-[100] ${isDarkMode ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
      {/* Botão Voltar (Para o Perfil do Barbeiro) */}
      <button 
        onClick={() => navigate(`/barbeiro/${id}`)} 
        className="p-3 rounded-2xl hover:bg-[#e6b32a] hover:text-black transition-all mb-4 text-gray-500"
      >
        <IoArrowBack size={22} />
      </button>

      {/* Itens de Navegação */}
      <div className="flex flex-col gap-6 flex-1">
        {menuItems.map((item, index) => (
          <SidebarIcon 
            key={index}
            icon={item.icon} 
            onClick={() => navigate(item.path)} 
            label={item.label} 
          />
        ))}
      </div>

      {/* Logout Rápido */}
      <button 
        onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }}
        className="p-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all"
      >
        <IoLogOutOutline size={24} />
      </button>
    </aside>
  );
}

function SidebarIcon({ icon, onClick, label }) {
  return (
    <div className="group relative flex items-center justify-center">
      <button 
        onClick={onClick}
        className="p-4 rounded-2xl text-gray-500 hover:bg-[#e6b32a]/10 hover:text-[#e6b32a] transition-all"
      >
        {React.cloneElement(icon, { size: 24 })}
      </button>
      <span className="absolute left-20 bg-black text-white text-[10px] font-black uppercase py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
        {label}
      </span>
    </div>
  );
}