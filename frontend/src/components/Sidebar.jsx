import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { 
  IoArrowBack, IoPeople, IoCalendar, IoAnalytics, 
  IoCut, IoDocumentText, IoLogOutOutline 
} from 'react-icons/io5';

export default function Sidebar() {
  const { id } = useParams(); // ID que está na URL
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  // RECUPERAR ID DA BARBEARIA DO STORAGE
  // Geralmente você salva o usuário como string no login. 
  // Se o campo for diferente de 'fk_barbearia', ajuste o nome abaixo.
  const userData = JSON.parse(localStorage.getItem('user') || '{}');
  const barbeariaId = userData.fk_barbearia || id; 

  const menuItems = [
    { icon: <IoAnalytics />, label: 'Analytics', path: `/admin/analytics/${barbeariaId}` },
    { icon: <IoPeople />, label: 'Equipe', path: `/admin/barbeiros/${barbeariaId}` },
    { icon: <IoDocumentText />, label: 'Histórico', path: `/admin/logs/${barbeariaId}` },
    { icon: <IoCalendar />, label: 'Agenda', path: `/admin/agenda/${barbeariaId}` },
    { icon: <IoCut />, label: 'Serviços', path: `/admin/valores/${barbeariaId}` },
  ];

  return (
    <aside className={`w-20 hidden md:flex flex-col items-center py-8 gap-8 border-r h-screen sticky top-0 z-[100] transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-[#0d0d0d] border-white/5' 
        : 'bg-white border-slate-200 shadow-sm'
    }`}>
      
      {/* Botão Voltar - Usa o ID do usuário para voltar ao perfil dele */}
      <button 
        onClick={() => navigate(`/barbeiro/${id}`)} 
        className={`p-3 rounded-2xl transition-all mb-4 ${
          isDarkMode ? 'text-gray-500 hover:bg-white/5 hover:text-white' : 'text-gray-400 hover:bg-slate-100 hover:text-black'
        }`}
      >
        <IoArrowBack size={22} />
      </button>

      {/* Itens de Navegação */}
      <div className="flex flex-col gap-6 flex-1">
        {menuItems.map((item, index) => {
          // Verifica se a rota atual começa com o path do item (para manter ativo mesmo em subrotas)
          const isActive = location.pathname.includes(item.path.split('/').slice(0, 3).join('/'));
          
          return (
            <SidebarIcon 
              key={index}
              icon={item.icon} 
              onClick={() => navigate(item.path)} 
              label={item.label} 
              isDarkMode={isDarkMode}
              isActive={isActive}
            />
          );
        })}
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

function SidebarIcon({ icon, onClick, label, isDarkMode, isActive }) {
  return (
    <div className="group relative flex items-center justify-center">
      <button 
        onClick={onClick}
        className={`p-4 rounded-2xl transition-all ${
          isActive 
            ? 'bg-[#e6b32a]/20 text-[#e6b32a]' 
            : isDarkMode 
              ? 'text-gray-500 hover:bg-[#e6b32a]/10 hover:text-[#e6b32a]' 
              : 'text-gray-400 hover:bg-[#e6b32a]/10 hover:text-[#e6b32a]'
        }`}
      >
        {React.cloneElement(icon, { size: 24 })}
      </button>
      
      {/* Tooltip */}
      <span className={`absolute left-20 py-1 px-3 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity font-black uppercase text-[10px] tracking-widest whitespace-nowrap z-50 shadow-xl ${
        isDarkMode ? 'bg-white text-black' : 'bg-black text-white'
      }`}>
        {label}
      </span>
    </div>
  );
}