import React, { useState } from 'react';
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
  IoTimeOutline
} from 'react-icons/io5';
import { MdContentCut } from 'react-icons/md';

export default function Sidebar() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState({ show: false, message: '', type: '' });
  
  const [config, setConfig] = useState({
    barbeariaId: null,
    abertura: '08:00',
    fechamento: '18:00'
  });

  const menuItems = [
    { label: 'Painel Admin', icon: <IoGridOutline size={22} />, path: `/admin/dashboard/${id}` },
    { label: 'Agenda', icon: <IoCalendarOutline size={22} />, path: `/admin/agenda/${id}` },
    { label: 'Barbeiros', icon: <IoPeopleOutline size={22} />, path: `/admin/barbeiros/${id}` },
    { label: 'Serviços', icon: <MdContentCut size={22} />, path: `/admin/valores/${id}` },
    { label: 'Logs', icon: <IoReaderOutline size={22} />, path: `/admin/logs/${id}` },
    { label: 'Analytics', icon: <IoStatsChartOutline size={22} />, path: `/admin/analytics/${id}` },
  ];

  const backItem = {
    label: 'Voltar para barbeiro',
    icon: <IoArrowBack size={20} />,
    path: `/barbeiro/dashboard/${id}`,
  };

  const abrirConfig = async () => {
    setIsModalOpen(true);
    try {
      const res = await api.get('/barbeiros');
      const lista = Array.isArray(res.data) ? res.data : res;
      const admin = lista.find(b => String(b._id) === String(id));
      
      const bId = admin?.fk_barbearia?._id || admin?.fk_barbearia || admin?.barbearia_id;
      
      if (!bId) return;

      const resBarb = await api.get(`/barbearias/${bId}`);
      const dadosBarb = resBarb.data || resBarb;

      setConfig({
        barbeariaId: bId,
        abertura: dadosBarb.abertura || '08:00',
        fechamento: dadosBarb.fechamento || '18:00'
      });

    } catch (e) {
      console.error("Erro ao carregar dados da barbearia.");
    }
  };

  const salvarHorarioFixo = async () => {
    if (!config.barbeariaId) return;
    setLoading(true);
    
    try {
      // Enviando campos simples conforme o novo Model
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

  return (
    <>
      <aside 
        className={`fixed left-0 top-0 h-screen w-20 z-50 border-r flex flex-col items-center py-8 print:hidden ${
          isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-slate-100'
        }`}
      >
        {/* Botão de Voltar */}
        <div className="w-full px-3 mb-6">
          <div className="relative group flex justify-center">
            <button
              onClick={() => navigate(backItem.path)}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all border shadow-sm active:scale-90 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-gray-400 hover:text-[#e6b32a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-[#e6b32a]'
              }`}
            >
              {backItem.icon}
            </button>
          </div>
        </div>

        <div className={`w-8 h-[1px] mb-6 ${isDarkMode ? 'bg-white/10' : 'bg-slate-100'}`} />

        {/* Navegação */}
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
              </div>
            );
          })}
        </nav>

        {/* Engrenagem */}
        <div className="w-full px-3 mt-auto">
          <div className="relative group flex justify-center">
            <button
              onClick={abrirConfig}
              className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all border group-hover:rotate-90 duration-500 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/10 text-gray-400 hover:text-[#e6b32a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-400 hover:text-[#e6b32a]'
              }`}
            >
              <IoSettingsOutline size={22} />
            </button>
          </div>
        </div>
      </aside>

      {/* Modal Simples */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-sm rounded-[2.5rem] p-8 border shadow-2xl ${isDarkMode ? 'bg-[#0d0d0d] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
            
            <div className="flex justify-between items-center mb-8">
              <div>
                <h3 className="text-xl font-black italic tracking-tighter lowercase">horario.<span className="text-[#e6b32a]">casa</span></h3>
                <p className="text-[9px] font-bold uppercase opacity-40 tracking-widest mt-1">Horário de funcionamento fixo</p>
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
                {loading ? 'Salvando...' : 'Salvar Horário'}
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