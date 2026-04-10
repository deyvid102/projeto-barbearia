import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTheme } from '../components/ThemeContext';
import { api } from '../services/Api.js';
import CustomAlert from '../components/CustomAlert';
import { 
  IoGridOutline, 
  IoCalendarOutline, 
  IoPeopleOutline, 
  IoStatsChartOutline,
  IoReaderOutline,
  IoArrowBack,
  IoSettingsOutline,
  IoCloseOutline,
  IoBrushOutline,
  IoAddOutline 
} from 'react-icons/io5';

export default function Sidebar() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  const [slugBarbearia, setSlugBarbearia] = useState('');
  
  const [config, setConfig] = useState({
    barbeariaId: null,
    abertura: '08:00',
    fechamento: '18:00'
  });

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        // Tenta buscar como barbeiro primeiro
        const res = await api.get(`/barbeiros/${id}`);
        const barbeiro = res.data || res;
        
        // Se não encontrar fk_barbearia, tenta tratar o ID como sendo da própria barbearia (Admin direto)
        const bId = barbeiro?.fk_barbearia?._id || barbeiro?.fk_barbearia || id;
        
        if (bId) {
          const resBarb = await api.get(`/barbearias/${bId}`);
          const dadosBarb = resBarb.data || resBarb;
          
          // Define o slug para a rota de agendamento
          const slug = dadosBarb.nome_url || dadosBarb.slug;
          setSlugBarbearia(slug);
          
          setConfig({
            barbeariaId: bId,
            abertura: dadosBarb.abertura || '08:00',
            fechamento: dadosBarb.fechamento || '18:00'
          });
        }
      } catch (e) {
        console.error("Erro ao carregar contexto da sidebar:", e);
      }
    };

    if (id) carregarDadosIniciais();
  }, [id]);

  const menuItems = [
    { label: 'Painel Admin', icon: <IoGridOutline size={22} />, path: `/admin/dashboard/${id}` },
    { label: 'Agenda', icon: <IoCalendarOutline size={22} />, path: `/admin/agenda/${id}` },
    { label: 'Gestão', icon: <IoPeopleOutline size={22} />, path: `/admin/gestao/${id}` },
    { label: 'Analytics', icon: <IoStatsChartOutline size={22} />, path: `/admin/analytics/${id}` },
    { label: 'Logs', icon: <IoReaderOutline size={22} />, path: `/admin/logs/${id}` },
    { label: 'Personalizar', icon: <IoBrushOutline size={22} />, path: `/admin/personalizacao/${id}` },
  ];

  const handleNovoAgendamento = () => {
    if (slugBarbearia) {
      // Agora aponta para a rota que corrigimos no App.jsx
      navigate(`/${slugBarbearia}/novo-agendamento`);
    } else {
      setAlert({ show: true, message: 'Identificador da barbearia não encontrado.', type: 'error' });
    }
  };

  const handleVoltar = () => {
    const barbeiroId = localStorage.getItem('barbeiroId');
    if (barbeiroId) {
      navigate(`/barbeiro/dashboard/${barbeiroId}`);
    } else {
      navigate('/select-profile');
    }
  };

  const salvarHorarioFixo = async () => {
    if (!config.barbeariaId) return;
    setLoading(true);
    try {
      await api.put(`/barbearias/${config.barbeariaId}`, {
        abertura: config.abertura,
        fechamento: config.fechamento
      });
      setAlert({ show: true, message: 'Horário padrão atualizado!', type: 'success' });
      setTimeout(() => {
        setIsModalOpen(false);
        setAlert({ show: false, message: '', type: '' });
      }, 1500);
    } catch (e) {
      setAlert({ show: true, message: 'Erro ao salvar alterações.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const Tooltip = ({ text }) => (
    <span className="absolute left-16 scale-0 transition-all rounded-lg bg-gray-900 px-3 py-2 text-[10px] text-white group-hover:scale-100 font-black uppercase tracking-widest z-[60] whitespace-nowrap shadow-2xl border border-white/10">
      {text}
    </span>
  );

  return (
    <>
      <aside 
        className={`fixed left-0 top-0 h-screen w-20 z-50 border-r flex flex-col items-center py-8 print:hidden ${
          isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-100'
        }`}
      >
        <div className={`w-8 h-[1px] mb-6 ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`} />

        <nav className="flex-1 flex flex-col gap-4 w-full px-3">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <div key={item.label} className="relative group flex justify-center">
                <button
                  onClick={() => navigate(item.path)}
                  className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all duration-300 ${
                    isActive 
                      ? 'bg-[#e6b32a] text-black shadow-lg scale-110' 
                      : isDarkMode 
                        ? 'text-gray-500 hover:bg-white/5' 
                        : 'text-slate-400 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                </button>
                <Tooltip text={item.label} />
              </div>
            );
          })}
        </nav>

        {/* Botão de Novo Agendamento (+) */}
        <div className="w-full px-3 mb-4">
          <div className="relative group flex justify-center">
            <button
              onClick={handleNovoAgendamento}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all border-2 border-dashed shadow-sm active:scale-95 ${
                isDarkMode 
                  ? 'bg-[#e6b32a]/10 border-[#e6b32a]/40 text-[#e6b32a] hover:bg-[#e6b32a] hover:text-black' 
                  : 'bg-amber-50 border-amber-200 text-[#e6b32a] hover:bg-[#e6b32a] hover:text-white'
              }`}
            >
              <IoAddOutline size={26} />
            </button>
            <Tooltip text="Novo Agendamento" />
          </div>
        </div>

        <div className="w-full px-3 mb-6">
          <div className="relative group flex justify-center">
            <button
              onClick={handleVoltar}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all border shadow-sm active:scale-90 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-gray-400 hover:text-[#e6b32a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-[#e6b32a]'
              }`}
            >
              <IoArrowBack size={20} />
            </button>
            <Tooltip text="Painel Barbeiro" />
          </div>
        </div>

        <div className="w-full px-3 mt-auto">
          <div className="relative group flex justify-center">
            <button
              onClick={() => setIsModalOpen(true)}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all border group-hover:rotate-90 duration-500 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-gray-400 hover:text-[#e6b32a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-[#e6b32a]'
              }`}
            >
              <IoSettingsOutline size={22} />
            </button>
            <Tooltip text="Horário Padrão" />
          </div>
        </div>
      </aside>

      {/* Modal de Configuração de Horário */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-sm rounded-[2.5rem] p-8 border shadow-2xl ${isDarkMode ? 'bg-[#0d0d0d] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter lowercase">config.<span className="text-[#e6b32a]">geral</span></h3>
                <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest mt-1">Horário de funcionamento</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-red-500 p-2 hover:bg-red-500/10 rounded-full transition-colors"><IoCloseOutline size={24} /></button>
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">Abertura</label>
                  <div className={`flex items-center gap-2 p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <input 
                      type="time" 
                      value={config.abertura}
                      onChange={(e) => setConfig({...config, abertura: e.target.value})}
                      className="bg-transparent border-none outline-none font-bold text-sm w-full"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[8px] font-black uppercase opacity-40 ml-1">Fechamento</label>
                  <div className={`flex items-center gap-2 p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                    <input 
                      type="time" 
                      value={config.fechamento}
                      onChange={(e) => setConfig({...config, fechamento: e.target.value})}
                      className="bg-transparent border-none outline-none font-bold text-sm w-full"
                    />
                  </div>
                </div>
              </div>

              <button 
                onClick={salvarHorarioFixo}
                disabled={loading}
                className="w-full py-4 bg-[#e6b32a] text-black rounded-2xl font-black uppercase text-[10px] tracking-[2px] hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Salvando...' : 'Salvar Alterações'}
              </button>
            </div>

            {alert.show && (
              <div className="mt-4">
                <CustomAlert message={alert.message} type={alert.type} onClose={() => setAlert({...alert, show: false})} />
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}