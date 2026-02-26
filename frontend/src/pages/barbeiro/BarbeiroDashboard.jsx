import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert'; 

import { 
  IoPersonCircleOutline, IoSettingsOutline, IoLogOutOutline, 
  IoShieldCheckmarkOutline, IoCalendarOutline, IoFileTrayFullOutline,
  IoStatsChartOutline, IoChevronDownOutline, IoCloseOutline,
  IoTrashOutline, IoCashOutline, IoPersonOutline, IoPeopleOutline,
  IoFilterOutline, IoCreateOutline, IoCheckmarkCircleOutline
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
  
  const [barbeiroSelecionadoId, setBarbeiroSelecionadoId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isAcoesModalOpen, setIsAcoesModalOpen] = useState(false);
  const [selectedAg, setSelectedAg] = useState(null);
  const [novoPreco, setNovoPreco] = useState('');

  const [statusTarget, setStatusTarget] = useState({ agendamento: null, novoStatus: '', mensagem: '', tipo: '' });
  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'success' });

  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef();
  
  const getSafeId = () => id || localStorage.getItem('barbeiroId');

  const horaInicio = 8;
  const totalHoras = 15; 
  const alturaLinhaPx = 90; 

  const horariosEscopo = Array.from({ length: totalHoras }, (_, i) => {
    const hora = i + horaInicio;
    return `${hora < 10 ? '0' + hora : hora}:00`;
  });

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
      
      const logado = listaBarbeiros.find(b => String(b._id) === String(currentId));
      setBarbeiroLogado(logado);
      
      if (!barbeiroSelecionadoId) setBarbeiroSelecionadoId(String(currentId));

    } catch (error) { console.error(error); } finally { if (!isAutoRefresh) setLoading(false); }
  };

  useEffect(() => {
    const barbeiroId = getSafeId();
    if (!barbeiroId) return navigate('/barbeiro/login');
    fetchData(barbeiroId);
    const interval = setInterval(() => fetchData(barbeiroId, true), 15000);
    return () => clearInterval(interval);
  }, [id]);

  const getNomeCliente = (ag) => {
    if (ag.nomeCliente) return ag.nomeCliente;
    const clienteId = ag.fk_cliente?._id || ag.fk_cliente;
    const encontrado = clientes.find(c => String(c._id) === String(clienteId));
    return encontrado ? encontrado.nome : 'Cliente';
  };

  const handleUpdateAgendamento = async (dadosExtras = {}) => {
    const agId = selectedAg?._id || statusTarget.agendamento?._id;
    try {
      await api.put(`/agendamentos/${agId}`, { 
        status: statusTarget.novoStatus || selectedAg.status,
        ...dadosExtras 
      });

      setIsConfirmModalOpen(false);
      setIsAcoesModalOpen(false);
      fetchData(getSafeId(), true);
      setAlertConfig({ show: true, titulo: 'Sucesso', mensagem: 'Agenda atualizada.', tipo: 'success' });
    } catch (error) {
      setAlertConfig({ show: true, titulo: 'Erro', mensagem: 'Falha ao processar.', tipo: 'error' });
    }
  };

  const openAcoes = (ag) => {
    const barbeiroIdAgendamento = String(ag.fk_barbeiro?._id || ag.fk_barbeiro);
    const barbeiroIdLogado = String(getSafeId());

    if (barbeiroIdAgendamento !== barbeiroIdLogado) {
      setAlertConfig({ 
        show: true, 
        titulo: 'Acesso Restrito', 
        mensagem: 'Ações permitidas apenas para seus atendimentos.', 
        tipo: 'error' 
      });
      return;
    }

    setSelectedAg(ag);
    setNovoPreco(ag.valor || '');
    setIsAcoesModalOpen(true);
  };

  const confirmarAcao = (status, msg, tipo) => {
    setStatusTarget({ agendamento: selectedAg, novoStatus: status, mensagem: msg, tipo: tipo });
    setIsConfirmModalOpen(true);
  };

  const calculateTimelinePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    if (hours < horaInicio || hours >= (horaInicio + totalHoras)) return null;
    const diffHours = hours - horaInicio;
    return 45 + (diffHours * alturaLinhaPx) + ((minutes / 60) * alturaLinhaPx);
  };

  const linePosition = calculateTimelinePosition();
  const hojeStr = new Date().toISOString().split('T')[0];
  const agendamentosHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr));

  // Cálculo dos contadores ajustado para contar apenas status "A"
  const meusAgsHoje = agendamentosHoje.filter(a => 
    String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(getSafeId()) && a.status === 'A'
  ).length;

  const geralAgsHoje = agendamentosHoje.filter(a => a.status === 'A').length;

  const dataDeHoje = new Intl.DateTimeFormat('pt-BR', { 
    weekday: 'long', day: '2-digit', month: 'long' 
  }).format(new Date());

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-3 md:p-6 pb-24 font-sans transition-colors duration-300`}>
      <div className="max-w-[1400px] mx-auto space-y-4">
        
        {/* HEADER */}
        <header className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black italic lowercase tracking-tighter">
              barbearia.<span className="text-[#e6b32a]">geral</span>
            </h1>
            <p className="hidden md:block text-[8px] text-gray-500 uppercase font-black tracking-[3px] mt-1">escala profissional</p>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1.5 md:gap-2 border-r border-black/5 dark:border-white/5 pr-3 md:pr-4">
              <button onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}><IoCalendarOutline size={18} /></button>
              <button onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}><IoFileTrayFullOutline size={18} /></button>
              <button onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} className={`w-9 h-9 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}><IoStatsChartOutline size={18} /></button>
            </div>

            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all active:scale-95 ${isProfileOpen ? 'bg-[#e6b32a] text-black border-[#e6b32a]' : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${isProfileOpen ? 'bg-white/20' : 'bg-[#e6b32a] text-black'}`}><IoPersonCircleOutline size={20} /></div>
                <IoChevronDownOutline size={12} />
              </button>
              {isProfileOpen && (
                <div className={`absolute right-0 mt-3 w-56 border rounded-3xl shadow-2xl z-50 overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-100'}`}>
                  <div className="p-3 border-b border-black/5 dark:border-white/5">
                    <button onClick={() => navigate(`/barbeiro/configuracoes/${getSafeId()}`)} className="w-full flex items-center gap-3 py-2 text-[11px] font-bold hover:opacity-70"><IoSettingsOutline size={14} /> editar perfil</button>
                    {barbeiroLogado?.admin && (
                      <button onClick={() => navigate(`/admin/dashboard/${getSafeId()}`)} className="w-full flex items-center gap-3 py-2 text-[11px] font-bold text-blue-500 hover:opacity-70"><IoShieldCheckmarkOutline size={14} /> painel administrativo</button>
                    )}
                  </div>
                  <div className="p-2">
                    <button onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }} className="w-full px-3 py-2 rounded-lg text-[9px] font-black uppercase text-red-500 flex items-center gap-2 hover:bg-red-500/10"><IoLogOutOutline size={16} /> encerrar sessão</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* INFO BAR - CONTADORES FILTRADOS */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 bg-black/5 dark:bg-white/5 p-3 rounded-2xl border border-black/5 dark:border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-1 h-8 bg-[#e6b32a] rounded-full"></div>
            <div>
              <p className="text-[10px] font-black uppercase text-[#e6b32a] leading-none mb-1">agenda de hoje</p>
              <p className="text-xs font-bold capitalize">{dataDeHoje}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <IoPersonOutline size={16} className="text-[#e6b32a]" />
              <div className="leading-none text-left">
                <p className="text-sm font-black">{meusAgsHoje}</p>
                <p className="text-[8px] font-bold uppercase opacity-50 tracking-tighter">aguardando meus</p>
              </div>
            </div>
            <div className={`flex-1 md:flex-none flex items-center justify-center gap-3 px-4 py-2.5 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <IoPeopleOutline size={18} className="text-slate-400" />
              <div className="leading-none text-left">
                <p className="text-sm font-black">{geralAgsHoje}</p>
                <p className="text-[8px] font-bold uppercase opacity-50 tracking-tighter">aguardando geral</p>
              </div>
            </div>
          </div>
        </div>

        {/* ÁREA DA PLANILHA */}
        <div className={`relative rounded-[2rem] border overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          {linePosition && (
            <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: `${linePosition}px` }}>
              <div className="w-12 md:w-14 h-[2px] bg-red-500 shadow-[0_0_10px_red]"></div>
              <div className="flex-1 h-[0.5px] bg-red-500/30"></div>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead>
                <tr className="h-14">
                  <th className={`sticky left-0 z-40 p-2 border-b border-r text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-slate-50 border-slate-100'}`}>Horário</th>
                  {barbeiros.map(b => (
                    <th key={b._id} className={`p-2 border-b border-r text-xs font-black uppercase ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>{b.nome.split(' ')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horariosEscopo.map(horaFixo => {
                  const horaFixoInt = parseInt(horaFixo.split(':')[0]);
                  return (
                    <tr key={horaFixo} style={{ height: `${alturaLinhaPx}px` }}>
                      <td className={`sticky left-0 z-20 p-2 border-b border-r text-center font-mono text-[11px] font-black ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{horaFixo}</td>
                      {barbeiros.map(b => {
                        const ags = agendamentosHoje.filter(a => {
                          const h = new Date(a.datahora).getHours();
                          return String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(b._id) && h === horaFixoInt;
                        });

                        const isDonoDaColuna = String(b._id) === String(getSafeId());

                        return (
                          <td key={b._id} className={`p-2 border-b border-r align-top relative ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex flex-col gap-2">
                              {ags.map(ag => (
                                <button 
                                  key={ag._id} 
                                  onClick={() => isDonoDaColuna && openAcoes(ag)}
                                  className={`group w-full p-3 rounded-2xl text-left transition-all border shadow-sm ${
                                    !isDonoDaColuna ? 'opacity-30 grayscale cursor-default' : 'hover:scale-[1.02] active:scale-95'
                                  } ${
                                    ag.status === 'F' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                                    ag.status === 'C' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                                    'bg-[#e6b32a] text-black border-[#e6b32a]'
                                  }`}
                                >
                                  <p className="text-[11px] font-black leading-none truncate uppercase tracking-tighter">
                                    {getNomeCliente(ag)}
                                  </p>
                                  <p className="text-[9px] font-bold mt-1 opacity-80 italic">
                                    {ag.tipoCorte === 'C' ? 'Cabelo' : ag.tipoCorte === 'B' ? 'Barba' : 'Cabelo + Barba'}
                                  </p>
                                  <div className="flex justify-between items-center mt-2 border-t border-black/10 pt-1">
                                    <span className="text-[10px] font-black">R$ {Number(ag.valor).toFixed(2)}</span>
                                    {isDonoDaColuna && <IoCreateOutline size={12} className="opacity-40" />}
                                  </div>
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

      {/* MODAL DE AÇÕES */}
      {isAcoesModalOpen && selectedAg && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic tracking-tighter">gerenciar.<span className="text-[#e6b32a]">atendimento</span></h3>
                <button onClick={() => setIsAcoesModalOpen(false)} className="p-2 text-gray-500 hover:text-red-500"><IoCloseOutline size={28}/></button>
              </div>

              <div className="space-y-6">
                <div className={`p-5 rounded-3xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                  <label className="text-[10px] font-black uppercase text-[#e6b32a] mb-3 block tracking-widest">ajustar valor final (R$)</label>
                  <div className="flex gap-3">
                    <input type="number" value={novoPreco} onChange={(e) => setNovoPreco(e.target.value)} className="flex-1 bg-transparent border-b-2 border-[#e6b32a] focus:outline-none font-mono font-bold text-2xl py-1" />
                    <button onClick={() => handleUpdateAgendamento({ valor: novoPreco })} className="bg-[#e6b32a] text-black p-4 rounded-2xl active:scale-95 shadow-lg shadow-[#e6b32a]/20"><IoCheckmarkCircleOutline size={24}/></button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => confirmarAcao('F', `Deseja concluir o atendimento?`, 'confirmar')} className="flex flex-col items-center justify-center gap-3 p-6 bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 rounded-[2rem] active:scale-95 transition-all">
                    <IoCashOutline size={30}/><span className="text-[10px] font-black uppercase tracking-tighter">Finalizar</span>
                  </button>
                  <button onClick={() => confirmarAcao('C', `Cancelar agendamento?`, 'remover')} className="flex flex-col items-center justify-center gap-3 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-[2rem] active:scale-95 transition-all">
                    <IoTrashOutline size={30}/><span className="text-[10px] font-black uppercase tracking-tighter">Cancelar</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ModalConfirmacao isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={() => handleUpdateAgendamento()} mensagem={statusTarget.mensagem} tipo={statusTarget.tipo} />
      {alertConfig.show && <CustomAlert titulo={alertConfig.titulo} message={alertConfig.mensagem} type={alertConfig.tipo} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />}
    </div>
  );
}