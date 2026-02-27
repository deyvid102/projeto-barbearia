import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
// Importações conforme orientações [2026-02-22] e [2026-02-25]
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert'; 

import { 
  IoPersonCircleOutline, IoSettingsOutline, IoLogOutOutline, 
  IoShieldCheckmarkOutline, IoCalendarOutline, IoFileTrayFullOutline,
  IoStatsChartOutline, IoChevronDownOutline, IoCloseOutline,
  IoCheckmarkCircleOutline, IoSyncOutline, 
  IoOptionsOutline, IoTimeOutline, IoShieldOutline,
  IoCloseCircleOutline, IoTodayOutline 
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
  const [isAcoesModalOpen, setIsAcoesModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  
  const [selectedAg, setSelectedAg] = useState(null);
  const [novoPreco, setNovoPreco] = useState('');
  const [novoStatus, setNovoStatus] = useState('A');

  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'success' });
  const [configLimites, setConfigLimites] = useState({ inicio: 8, fim: 18 });

  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef();
  const selectRef = useRef();
  
  const getSafeId = useCallback(() => id || localStorage.getItem('barbeiroId'), [id]);
  
  const ALTURA_LINHA = 110; 
  const ALTURA_CABECALHO = 56;

  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0];
  const diaDoMes = hoje.getDate();
  
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' }).split('-')[0];

  const statusOptions = [
    { id: 'A', label: 'Agendado (Aberto)', icon: IoTimeOutline, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'F', label: 'Finalizado / Pago', icon: IoCheckmarkCircleOutline, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'C', label: 'Cancelado', icon: IoCloseCircleOutline, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    const currentId = getSafeId();
    if (!currentId) return;

    try {
      if (!isAutoRefresh) setLoading(true);

      const [resBeb, resB, resA, resC] = await Promise.all([
        api.get('/barbearias'),
        api.get('/barbeiros'),
        api.get('/agendamentos'),
        api.get('/clientes')
      ]);

      const barbearias = resBeb.data || resBeb || [];
      const listaBarbeiros = resB.data || resB || [];
      const dataClientes = resC.data || resC || [];
      
      const logado = listaBarbeiros.find(b => String(b._id) === String(currentId));
      setBarbeiroLogado(logado);
      setBarbeiros(listaBarbeiros.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === String(logado?.fk_barbearia?._id || logado?.fk_barbearia)));
      setAgendamentos(resA.data || resA || []);
      setClientes(dataClientes);

      const minhaBarbearia = barbearias.find(b => String(b._id) === String(logado?.fk_barbearia?._id || logado?.fk_barbearia));
      if (minhaBarbearia) {
        const gradeDia = minhaBarbearia.agenda_detalhada?.grade?.find(g => g.dia === diaDoMes);
        if (gradeDia?.escalas?.length > 0) {
          const todasEntradas = gradeDia.escalas.map(e => parseInt(e.entrada.split(':')[0]));
          const todasSaidas = gradeDia.escalas.map(e => parseInt(e.saida.split(':')[0]));
          setConfigLimites({
            inicio: Math.min(...todasEntradas),
            fim: Math.max(...todasSaidas)
          });
        }
      }

    } catch (error) {
      console.error("Erro fetch:", error);
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  }, [getSafeId, diaDoMes]);

  useEffect(() => {
    fetchData();
    const intervalData = setInterval(() => fetchData(true), 15000);
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => { clearInterval(intervalData); clearInterval(intervalTime); };
  }, [fetchData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsProfileOpen(false);
      if (selectRef.current && !selectRef.current.contains(event.target)) setIsSelectOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNomeExibicao = (ag) => {
    if (ag.nomeCliente) return ag.nomeCliente;
    const idCliente = ag.fk_cliente?._id || ag.fk_cliente;
    const clienteEncontrado = clientes.find(c => String(c._id) === String(idCliente));
    return clienteEncontrado ? clienteEncontrado.nome : 'Cliente';
  };

  const getEscopoHorarios = () => {
    const escopo = [];
    for (let i = configLimites.inicio; i <= configLimites.fim; i++) {
      escopo.push(`${i < 10 ? '0' + i : i}:00`);
    }
    return escopo;
  };

  const calculateTimelinePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    if (hours < configLimites.inicio || hours > configLimites.fim) return null;
    const horasDesdeInicio = hours - configLimites.inicio;
    const percentualMinutos = minutes / 60;
    return ALTURA_CABECALHO + (horasDesdeInicio * ALTURA_LINHA) + (percentualMinutos * ALTURA_LINHA);
  };

  const handleSalvarAcoes = async () => {
    if (!selectedAg) return;
    try {
      // Ao cancelar pelo painel do barbeiro, enviamos explicitamente que foi o barbeiro
      const payload = { 
        status: novoStatus,
        valor: novoPreco 
      };

      if (novoStatus === 'C') {
        payload.canceladoPor = 'Barbeiro';
      }

      await api.put(`/agendamentos/${selectedAg._id}`, payload);
      setIsAcoesModalOpen(false);
      fetchData(true);
      setAlertConfig({ show: true, titulo: 'sucesso', mensagem: 'agendamento atualizado.', tipo: 'success' });
    } catch (error) {
      setAlertConfig({ show: true, titulo: 'erro', mensagem: 'falha ao atualizar.', tipo: 'error' });
    }
  };

  const openAcoes = (ag) => {
    setSelectedAg(ag);
    setNovoPreco(ag.valor || '');
    setNovoStatus(ag.status || 'A');
    setIsAcoesModalOpen(true);
  };

  const agendamentosHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr));

  const stats = {
    agendados: agendamentosHoje.filter(a => a.status === 'A').length,
    finalizados: agendamentosHoje.filter(a => a.status === 'F').length,
    cancelados: agendamentosHoje.filter(a => a.status === 'C').length
  };

  const NavButton = ({ icon: Icon, label, onClick }) => (
    <div className="relative group">
      <button onClick={onClick} className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-[#e6b32a] hover:border-[#e6b32a]/50 hover:bg-[#e6b32a]/5' : 'bg-white border-slate-200 text-slate-500 hover:text-black hover:border-slate-400 hover:shadow-md'}`}>
        <Icon size={22} />
      </button>
      <div className="absolute top-14 left-1/2 -translate-x-1/2 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[100]">
        <div className={`px-3 py-1.5 rounded-xl shadow-xl border text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-[#e6b32a]' : 'bg-white border-slate-100 text-black'}`}>
          {label}
        </div>
      </div>
    </div>
  );

  const currentStatusObj = statusOptions.find(s => s.id === novoStatus) || statusOptions[0];

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-3 md:p-6 pb-24 font-sans transition-colors duration-300`}>
      <div className="max-w-[1400px] mx-auto space-y-4">
        
        <header className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter leading-none">
              barbearia.<span className="text-[#e6b32a]">geral</span>
            </h1>
            <p className="hidden md:block text-[9px] text-gray-500 uppercase font-black tracking-[3px] mt-2">Painel do Profissional</p>
          </div>

          <div className="flex items-center gap-3 md:gap-4">
            <div className="flex items-center gap-3 border-r border-black/5 dark:border-white/5 pr-4 md:pr-6">
              <NavButton icon={IoCalendarOutline} label="Calendário" onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} />
              <NavButton icon={IoFileTrayFullOutline} label="Histórico" onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} />
              <NavButton icon={IoStatsChartOutline} label="Estatísticas" onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} />
            </div>

            {barbeiroLogado?.admin && (
                <button 
                  onClick={() => navigate(`/admin/dashboard/${getSafeId()}`)}
                  className="hidden md:flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-black text-[10px] uppercase tracking-widest shadow-[0_10px_20px_rgba(37,99,235,0.3)] hover:scale-105 active:scale-95 transition-all border border-white/10"
                >
                  <IoShieldOutline size={16} className="animate-pulse" />
                  Painel Admin
                </button>
            )}

            <div className="relative" ref={menuRef}>
              <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-3 p-2 px-3 rounded-2xl border transition-all duration-300 ${isProfileOpen ? 'bg-[#e6b32a] text-black border-[#e6b32a] shadow-lg shadow-[#e6b32a]/20' : isDarkMode ? 'bg-white/5 border-white/10 hover:border-white/30' : 'bg-white border-slate-200 hover:shadow-md'}`}>
                <div className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isProfileOpen ? 'bg-black/10' : 'bg-[#e6b32a] text-black'}`}>
                  <IoPersonCircleOutline size={24} />
                </div>
                <IoChevronDownOutline size={14} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              {isProfileOpen && (
                <div className={`absolute right-0 mt-3 w-60 border rounded-[2rem] shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-100'}`}>
                  <div className="p-4 border-b border-black/5 dark:border-white/5">
                    <button onClick={() => navigate(`/barbeiro/configuracoes/${getSafeId()}`)} className="w-full flex items-center gap-3 p-3 rounded-xl text-[11px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors"><IoSettingsOutline size={18} className="text-[#e6b32a]"/> editar perfil</button>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }} className="w-full p-3 rounded-xl text-[10px] font-black uppercase text-red-500 flex items-center gap-3 hover:bg-red-500/10 transition-colors"><IoLogOutOutline size={18} /> encerrar sessão</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Stats Section */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-2">
          <div className={`p-4 md:p-5 rounded-[2rem] border flex items-center gap-4 transition-all ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-xl bg-[#e6b32a]/10 text-[#e6b32a] flex items-center justify-center">
              <IoTodayOutline size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest leading-none mb-1">hoje</p>
              <p className="text-[11px] font-black uppercase tracking-tighter leading-none">{diaSemana}, {dataFormatada}</p>
            </div>
          </div>

          <div className={`p-4 md:p-5 rounded-[2rem] border flex items-center gap-4 transition-all ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <IoTimeOutline size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest leading-none mb-1">agendados</p>
              <p className="text-xl font-black leading-none">{stats.agendados}</p>
            </div>
          </div>

          <div className={`p-4 md:p-5 rounded-[2rem] border flex items-center gap-4 transition-all ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <IoCheckmarkCircleOutline size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest leading-none mb-1">finalizados</p>
              <p className="text-xl font-black leading-none">{stats.finalizados}</p>
            </div>
          </div>

          <div className={`p-4 md:p-5 rounded-[2rem] border flex items-center gap-4 transition-all ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center">
              <IoCloseCircleOutline size={20} />
            </div>
            <div>
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest leading-none mb-1">cancelados</p>
              <p className="text-xl font-black leading-none">{stats.cancelados}</p>
            </div>
          </div>
        </section>

        <div className={`relative rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          {calculateTimelinePosition() && (
            <div className="absolute left-0 right-0 z-[60] group pointer-events-auto flex items-center cursor-help" style={{ top: `${calculateTimelinePosition()}px`, transition: 'top 0.5s linear' }}>
              <div className="w-14 h-[3px] bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] rounded-full"></div>
              <div className="flex-1 h-[1px] bg-red-600/40"></div>
              <div className="absolute left-16 px-2 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">{currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          )}

          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full border-collapse min-w-[1200px] table-fixed">
              <thead>
                <tr style={{ height: `${ALTURA_CABECALHO}px` }}>
                  <th className={`sticky left-0 z-40 w-24 p-2 border-b border-r text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>Horário</th>
                  {barbeiros.map(b => (
                    <th key={b._id} className={`p-2 border-b border-r text-xs font-black uppercase tracking-wider ${isDarkMode ? 'border-white/5 text-white/80' : 'border-slate-100 text-slate-700'}`}>{b.nome.split(' ')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getEscopoHorarios().map(hora => {
                  const hInt = parseInt(hora.split(':')[0]);
                  return (
                    <tr key={hora} style={{ height: `${ALTURA_LINHA}px` }}>
                      <td className={`sticky left-0 z-20 p-2 border-b border-r text-center font-mono text-[11px] font-black ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>{hora}</td>
                      {barbeiros.map(b => {
                        const ags = agendamentosHoje.filter(a => String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(b._id) && new Date(a.datahora).getHours() === hInt);
                        const isMeuAtendimento = String(b._id) === String(getSafeId());
                        return (
                          <td key={b._id} className={`p-1.5 border-b border-r align-top relative ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className={`grid gap-2 h-full overflow-y-auto custom-scrollbar pr-1 ${ags.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {ags.map(ag => (
                                <button 
                                  key={ag._id} 
                                  onClick={() => isMeuAtendimento && openAcoes(ag)} 
                                  className={`w-full p-2.5 rounded-xl text-left border shadow-sm transition-all h-fit 
                                    ${!isMeuAtendimento ? 'opacity-30 grayscale' : 'hover:scale-[1.02] active:scale-95'} 
                                    ${ag.status === 'F' 
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                      : ag.status === 'C'
                                        ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                        : 'bg-[#e6b32a] text-black border-[#e6b32a]'}`}
                                >
                                  <div className="flex justify-between items-start gap-1">
                                    <p className="text-[9px] font-black uppercase truncate leading-tight">
                                      {getNomeExibicao(ag)}
                                      {/* Exibição de quem cancelou */}
                                      {ag.status === 'C' && (
                                        <span className="block text-[7px] mt-0.5 opacity-80 bg-red-500/20 px-1 rounded w-fit">
                                          [{ag.canceladoPor || 'S/ INFO'}]
                                        </span>
                                      )}
                                    </p>
                                    <span className="text-[8px] font-black bg-black/10 px-1 rounded whitespace-nowrap">{new Date(ag.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                  </div>
                                  <p className="text-[8px] font-bold opacity-80 italic lowercase truncate mt-0.5">{ag.tipoCorte || 'serviço'}</p>
                                  <div className="flex justify-between items-center mt-1.5 border-t border-black/5 pt-1">
                                     <span className="text-[9px] font-black">R$ {Number(ag.valor).toFixed(2)}</span>
                                     {isMeuAtendimento && <IoOptionsOutline size={12} className="opacity-60" />}
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

      {isAcoesModalOpen && selectedAg && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md transition-all">
          <div className={`w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'} animate-in slide-in-from-bottom md:zoom-in duration-300`}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${currentStatusObj.bg} ${currentStatusObj.color}`}>
                    <currentStatusObj.icon size={22}/>
                  </div>
                  <h3 className="text-xl font-black italic">detalhes.<span className="text-[#e6b32a]">agendamento</span></h3>
                </div>
                <button onClick={() => setIsAcoesModalOpen(false)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><IoCloseOutline size={28}/></button>
              </div>

              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                   <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-wider">Cliente / Serviço</p>
                   <p className="text-sm font-black uppercase text-[#e6b32a]">{getNomeExibicao(selectedAg)}</p>
                   <p className="text-xs font-bold opacity-70 italic">{selectedAg.tipoCorte || 'Não especificado'}</p>
                </div>

                <div className={`p-5 rounded-[2rem] border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-[#e6b32a]/50' : 'bg-slate-50 border-slate-200 focus-within:border-black/30'}`}>
                  <label className="text-[9px] font-black uppercase text-[#e6b32a] mb-2 block tracking-widest ml-1">valor final</label>
                  <div className="flex items-center relative">
                      <span className="absolute left-0 font-black text-gray-500 text-xl">R$</span>
                      <input type="number" value={novoPreco} onChange={(e) => setNovoPreco(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 pl-7 font-black text-3xl py-1 outline-none" />
                  </div>
                </div>

                <div className="space-y-2 relative" ref={selectRef}>
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">atualizar status</label>
                  <button onClick={() => setIsSelectOpen(!isSelectOpen)} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} ${isSelectOpen ? 'border-[#e6b32a] ring-2 ring-[#e6b32a]/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      <currentStatusObj.icon size={18} className={currentStatusObj.color} />
                      <span className="text-xs font-black uppercase">{currentStatusObj.label}</span>
                    </div>
                    <IoChevronDownOutline size={16} className={`transition-transform duration-300 ${isSelectOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isSelectOpen && (
                    <div className={`absolute bottom-full mb-2 w-full border rounded-2xl shadow-2xl z-[130] overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-200 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-100'}`}>
                      {statusOptions.map((opt) => (
                        <button key={opt.id} onClick={() => { setNovoStatus(opt.id); setIsSelectOpen(false); }} className={`w-full p-4 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-none ${isDarkMode ? 'border-white/5' : 'border-slate-50'} ${novoStatus === opt.id ? 'bg-[#e6b32a]/5' : ''}`}>
                          <opt.icon size={18} className={opt.color} />
                          <span className={`text-[11px] font-black uppercase ${novoStatus === opt.id ? 'text-[#e6b32a]' : 'text-gray-500'}`}>{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <button onClick={handleSalvarAcoes} className="w-full py-5 rounded-[2rem] bg-[#e6b32a] text-black font-black uppercase text-[11px] tracking-[2px] shadow-lg shadow-[#e6b32a]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  <IoCheckmarkCircleOutline size={20}/> Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {alertConfig.show && ( <CustomAlert titulo={alertConfig.titulo} message={alertConfig.mensagem} type={alertConfig.tipo} onClose={() => setAlertConfig({ ...alertConfig, show: false })} /> )}
    </div>
  );
}