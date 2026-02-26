import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert'; 

import { 
  IoPersonCircleOutline, 
  IoSettingsOutline, 
  IoLogOutOutline, 
  IoShieldCheckmarkOutline,
  IoCalendarOutline,
  IoFileTrayFullOutline,
  IoStatsChartOutline,
  IoCheckmarkDoneOutline,
  IoChevronDownOutline
} from 'react-icons/io5';

export default function BarbeiroDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbeiroLogado, setBarbeiroLogado] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState({ agendamento: null, novoStatus: '', mensagem: '', tipo: '' });
  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'success' });

  // Estado para a linha de tempo
  const [currentTime, setCurrentTime] = useState(new Date());

  const menuRef = useRef();
  const getSafeId = () => id || localStorage.getItem('barbeiroId');

  const horaInicio = 8;
  const totalHoras = 15; // Das 08:00 às 22:00
  const alturaLinhaPx = 100; // Altura aproximada de cada célula em pixels

  const horariosEscopo = Array.from({ length: totalHoras }, (_, i) => {
    const hora = i + horaInicio;
    return `${hora < 10 ? '0' + hora : hora}:00`;
  });

  // Atualiza a linha do tempo a cada minuto
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchData = async (currentId, isAutoRefresh = false) => {
    if (!currentId || currentId === 'undefined') return;
    try {
      if (!isAutoRefresh) setLoading(true);
      const [resAgendados, resClientes, resBarbeirosLista] = await Promise.all([
        api.get('/agendamentos'),
        api.get('/clientes'),
        api.get('/barbeiros') 
      ]);

      setAgendamentos(resAgendados.data || resAgendados || []);
      setClientes(resClientes.data || resClientes || []);
      const listaBarbeiros = resBarbeirosLista.data || resBarbeirosLista || [];
      setBarbeiros(listaBarbeiros);
      setBarbeiroLogado(listaBarbeiros.find(b => String(b._id) === String(currentId)));
    } catch (error) { console.error(error); } finally { if (!isAutoRefresh) setLoading(false); }
  };

  useEffect(() => {
    const barbeiroId = getSafeId();
    if (!barbeiroId) return navigate('/barbeiro/login');
    fetchData(barbeiroId);
    const interval = setInterval(() => fetchData(barbeiroId, true), 15000);
    return () => clearInterval(interval);
  }, [id]);

  const getNomeCliente = (fk) => {
    const clienteId = fk?._id || fk;
    return clientes.find(c => String(c._id) === String(clienteId))?.nome || 'desconhecido';
  };

  const handleUpdateStatus = async () => {
    const { agendamento, novoStatus } = statusTarget;
    try {
      await api.put(`/agendamentos/${agendamento._id}`, { status: novoStatus });
      setIsConfirmModalOpen(false);
      fetchData(getSafeId(), true);
    } catch (error) {
      setAlertConfig({ show: true, titulo: 'erro', mensagem: 'falha ao atualizar status.', tipo: 'error' });
    }
  };

  // Cálculo da posição da linha vermelha
  const calculateTimelinePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    
    if (hours < horaInicio || hours >= (horaInicio + totalHoras)) return null;

    const diffHours = hours - horaInicio;
    const percentageOfHour = minutes / 60;
    
    // 56px é a altura aproximada do header da tabela (thead)
    // alturaLinhaPx é a altura de cada tr
    return 56 + (diffHours * alturaLinhaPx) + (percentageOfHour * alturaLinhaPx);
  };

  const linePosition = calculateTimelinePosition();
  const hojeStr = new Date().toISOString().split('T')[0];
  const agendamentosHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr));

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 pb-20 font-sans transition-colors duration-300`}>
      <div className="max-w-[100%] mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter">
              barbearia.<span className="text-[#e6b32a]">geral</span>
            </h1>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[4px] mt-1">escala de atendimento hoje</p>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-2 border-r border-black/5 dark:border-white/5 pr-4 mr-2">
              <button onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} title="Calendário" className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#e6b32a]' : 'bg-white border-slate-200 hover:border-black'}`}>
                <IoCalendarOutline size={20} />
              </button>
              <button onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} title="Histórico" className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#e6b32a]' : 'bg-white border-slate-200 hover:border-black'}`}>
                <IoFileTrayFullOutline size={20} />
              </button>
              <button onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} title="Estatísticas" className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#e6b32a]' : 'bg-white border-slate-200 hover:border-black'}`}>
                <IoStatsChartOutline size={20} />
              </button>
            </div>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-3 p-2 pr-4 rounded-2xl border transition-all duration-300 active:scale-95 shadow-sm ${isProfileOpen ? 'bg-[#e6b32a] text-black border-[#e6b32a]' : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isProfileOpen ? 'bg-white/20' : 'bg-[#e6b32a] text-black'}`}>
                  <IoPersonCircleOutline size={24} />
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-[11px] font-bold truncate max-w-[80px]">{barbeiroLogado?.nome?.split(' ')[0] || 'profissional'}</p>
                </div>
                <IoChevronDownOutline size={14} className={`${isProfileOpen ? 'rotate-180' : ''} transition-transform`} />
              </button>
              
              {isProfileOpen && (
                <div className={`absolute right-0 mt-3 w-64 border rounded-[2rem] shadow-2xl z-50 overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-100'}`}>
                  <div className="p-4 border-b border-black/5 dark:border-white/5">
                    <p className="text-[9px] font-black uppercase text-[#e6b32a] mb-1">configurações</p>
                    <button onClick={() => navigate(`/barbeiro/configuracoes/${getSafeId()}`)} className="w-full flex items-center gap-3 py-2 text-xs font-bold hover:opacity-70">
                      <IoSettingsOutline size={16} /> editar perfil
                    </button>
                    {barbeiroLogado?.admin && (
                      <button onClick={() => navigate(`/admin/dashboard/${getSafeId()}`)} className="w-full flex items-center gap-3 py-2 text-xs font-bold text-blue-500 hover:opacity-70">
                        <IoShieldCheckmarkOutline size={16} /> painel administrativo
                      </button>
                    )}
                  </div>
                  <div className="p-2 border-t border-black/5 dark:border-white/5">
                    <button onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }} className="w-full px-4 py-3 rounded-xl text-[10px] font-black uppercase text-red-500 flex items-center gap-3 hover:bg-red-500/10 transition-colors">
                      <IoLogOutOutline size={18} /> encerrar sessão
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* GRADE COM LINHA DE TEMPO */}
        <div className={`relative rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          
          {/* Linha de Tempo Atual */}
          {linePosition && (
            <div 
              className="absolute left-0 right-0 z-30 pointer-events-none flex items-center"
              style={{ top: `${linePosition}px` }}
            >
              <div className="w-24 h-[2px] bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
              <div className="flex-1 h-[1px] bg-red-500/40"></div>
              <div className="absolute left-[88px] w-2 h-2 bg-red-500 rounded-full"></div>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[1000px] relative">
              <thead>
                <tr style={{ height: '56px' }}>
                  <th className={`p-4 border-b border-r w-24 text-[10px] font-black uppercase tracking-widest sticky left-0 z-40 ${isDarkMode ? 'border-white/5 bg-[#111]' : 'border-slate-100 bg-slate-50'}`}>
                    Horário
                  </th>
                  {barbeiros.map(barb => (
                    <th key={barb._id} className={`p-4 border-b border-r text-[11px] font-black uppercase tracking-tighter text-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      <div className="flex flex-col items-center">
                        <span className="text-[#e6b32a] text-[8px]">profissional</span>
                        {barb.nome}
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horariosEscopo.map(horaFixo => {
                  const horaFixoInt = parseInt(horaFixo.split(':')[0]);

                  return (
                    <tr key={horaFixo} style={{ height: `${alturaLinhaPx}px` }}>
                      <td className={`p-4 border-b border-r text-center font-mono text-xs font-black sticky left-0 z-20 ${isDarkMode ? 'border-white/5 text-gray-500 bg-[#111]' : 'border-slate-100 text-slate-400 bg-slate-50'}`}>
                        {horaFixo}
                      </td>
                      {barbeiros.map(barb => {
                        const agsNoIntervalo = agendamentosHoje.filter(a => {
                          const dataAg = new Date(a.datahora);
                          return String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(barb._id) && dataAg.getHours() === horaFixoInt;
                        });

                        return (
                          <td key={barb._id} className={`p-2 border-b border-r align-top relative ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex flex-col gap-2">
                              {agsNoIntervalo.map(ag => (
                                <button 
                                  key={ag._id}
                                  onClick={() => {
                                    setStatusTarget({ agendamento: ag, novoStatus: 'F', mensagem: `concluir atendimento de ${getNomeCliente(ag.fk_cliente)}?`, tipo: 'confirmar' });
                                    setIsConfirmModalOpen(true);
                                  }}
                                  className={`w-full p-3 rounded-2xl text-left transition-all hover:scale-[1.02] active:scale-95 border z-10
                                    ${ag.status === 'F' 
                                      ? 'bg-emerald-500/10 border-emerald-500/20 opacity-60' 
                                      : 'bg-[#e6b32a] text-black border-[#e6b32a] shadow-lg shadow-[#e6b32a]/10'}`}
                                >
                                  <div className="flex justify-between items-start mb-1">
                                    <span className="text-[9px] font-black font-mono bg-black/10 px-1 rounded">
                                      {new Date(ag.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-[10px] font-black leading-tight truncate">{getNomeCliente(ag.fk_cliente)}</p>
                                  <p className="text-[8px] uppercase font-bold opacity-70 mt-1 truncate">{ag.tipoCorte || 'serviço'}</p>
                                  {ag.status === 'F' && <IoCheckmarkDoneOutline className="mt-1" size={14}/>}
                                </button>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ModalConfirmacao 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        onConfirm={handleUpdateStatus} 
        mensagem={statusTarget.mensagem} 
        tipo={statusTarget.tipo} 
      />
      
      {alertConfig.show && (
        <CustomAlert 
          titulo={alertConfig.titulo} 
          message={alertConfig.mensagem} 
          type={alertConfig.tipo} 
          onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
        />
      )}
    </div>
  );
}