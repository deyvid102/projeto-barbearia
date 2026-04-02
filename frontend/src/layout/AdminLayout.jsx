import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useTheme } from '../components/ThemeContext';
import { Clock } from 'lucide-react';
import { IoMenuOutline, IoCloseOutline, IoReaderOutline, IoGridOutline, IoBrushOutline, IoCalendarOutline, IoPeopleOutline, IoStatsChartOutline, IoAddOutline } from 'react-icons/io5';
import { Outlet, useNavigate, useParams } from 'react-router-dom';

export default function AdminLayout({ children }) {
  const { isDarkMode } = useTheme();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAvulsoModalOpen, setIsAvulsoModalOpen] = useState(false); // Caso precise controlar o modal globalmente
  const navigate = useNavigate();
  const { id } = useParams();

  // Lógica de Data
  const dataAtual = new Date();
  const diaSemana = dataAtual.toLocaleDateString('pt-BR', { weekday: 'long' });
  const dataFormatada = dataAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });

  const NavButton = ({ icon: Icon, onClick, label, variant = 'default', colorClass, className = "" }) => (
    <div className={`relative group flex flex-col items-center flex-1 md:flex-none ${className}`}>
      <button 
        onClick={onClick}
        className={`w-full h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center transition-all active:scale-95 border
        ${variant === 'primary' 
          ? 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20 border-[#e6b32a] hover:scale-105' 
          : colorClass ? colorClass : isDarkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-[#e6b32a]' : 'bg-white border-slate-200 text-slate-500 hover:text-black'}`}
      >
        <Icon size={variant === 'primary' ? 22 : 18} className="md:w-[26px] md:h-[26px]" />
      </button>
      <span className="hidden md:block absolute -bottom-8 scale-0 group-hover:scale-100 transition-all duration-200 bg-black text-white text-[9px] font-black uppercase px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-50 pointer-events-none">
        {label}
      </span>
    </div>
  );

  return (
    <div className={`min-h-screen w-full flex overflow-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Sidebar mobile como overlay */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden print:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setIsSidebarOpen(false)} />
          <div className="relative z-50">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER PADRONIZADO (Desktop & Mobile) */}
        <header className={`sticky top-0 z-30 border-b px-4 py-4 md:px-8 ${isDarkMode ? 'bg-[#0a0a0a]/80 border-white/5' : 'bg-white/80 border-slate-200'} backdrop-blur-md`}>
          <div className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            
            {/* Título e Data */}
            <div>
              <div className="flex items-center gap-3">
                {/* Botão Menu Mobile */}
                <button 
                  onClick={() => setIsSidebarOpen(prev => !prev)}
                  className="md:hidden p-2 rounded-lg bg-white/5 border border-white/10"
                >
                  {isSidebarOpen ? <IoCloseOutline size={20} /> : <IoMenuOutline size={20} />}
                </button>
                <h1 className="text-2xl md:text-3xl font-black italic tracking-tighter">
                  Painel <span className="text-[#e6b32a]">Administrativo</span>
                </h1>
              </div>
              
              <div className="flex items-center gap-2 mt-1 ml-1 md:ml-0">
                <IoCalendarOutline className="text-[#e6b32a]" size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                  {diaSemana}, {dataFormatada}
                </p>
              </div>
            </div>

            {/* Ações/Navegação */}
            <div className="flex items-center gap-2 md:gap-3 overflow-hidden pb-2 md:pb-0">
              <div className="flex flex-1 items-center gap-2 md:gap-3 md:border-r border-black/5 dark:border-white/5 md:pr-4">
                <div className="hidden md:block">
                  <NavButton 
                    icon={IoAddOutline} label="Novo Agendamento" variant="primary" onClick={() => setIsAvulsoModalOpen(true)} 
                  />
                </div>
                <NavButton 
                  icon={IoGridOutline} label="Dashboard" onClick={() => navigate(`/admin/dashboard/${id}`)}  
                />
                <NavButton 
                  icon={Clock} label="Agenda" onClick={() => navigate(`/admin/agenda/${id}`)}  
                />
                <NavButton 
                  icon={IoPeopleOutline} label="Gestão" onClick={() => navigate(`/admin/gestao/${id}`)} 
                />
                <NavButton 
                  icon={IoStatsChartOutline} label="Estatísticas" onClick={() => navigate(`/admin/analytics/${id}`)}  
                />
                <NavButton 
                  icon={IoReaderOutline} label="Logs" onClick={() => navigate(`/admin/logs/${id}`)}  
                />
                <NavButton 
                  icon={IoBrushOutline} label="Personalizar" onClick={() => navigate(`/admin/personalizacao/${id}`)}  
                />
              </div>
            </div>
          </div>
        </header>

        {/* Área do Conteúdo da Página */}
        <div className="flex-1 w-full max-w-[1600px] mx-auto px-3 md:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

// export default function AdminLayout({ children }) {
//   const { isDarkMode } = useTheme();
//   const [isSidebarOpen, setIsSidebarOpen] = useState(false);

//   return (
//     <div className={`min-h-screen w-full flex overflow-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-slate-50 text-slate-900'}`}>
      
//       {/* Sidebar fixa em desktop */}
//       {/* <div className="hidden lg:block flex-shrink-0 print:hidden">
//         <Sidebar />
//       </div> */}

//       {/* Sidebar mobile como overlay */}
//       {isSidebarOpen && (
//         <div className="fixed inset-0 z-40 flex md:hidden print:hidden">
//           <div
//             className="absolute inset-0 bg-black/60"
//             onClick={() => setIsSidebarOpen(false)}
//           />
//           <div className="relative z-50">
//             <Sidebar />
//           </div>
//         </div>
//       )}

//       {/* Conteúdo Principal */}
//       <main className="flex-1 flex flex-col min-w-0">
//         {/* Topbar mobile com botão de menu */}
//         <div
//           className={`md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b ${
//             isDarkMode ? 'bg-[#0a0a0a] border-white/10' : 'bg-slate-50 border-slate-200'
//           }`}
//         >
//           <button
//             onClick={() => setIsSidebarOpen(prev => !prev)}
//             className="flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-black uppercase tracking-[2px] active:scale-95 transition-all
//               bg-white/5 border-white/10"
//           >
//             {isSidebarOpen ? <IoCloseOutline size={18} /> : <IoMenuOutline size={18} />}
//             <span>Menu</span>
//           </button>
//         </div>

//         <div className="flex-1 w-full max-w-[1600px] mx-auto px-3 md:px-6 lg:px-8">
//           {children}
//         </div>
//       </main>

//     </div>
//   );
// }