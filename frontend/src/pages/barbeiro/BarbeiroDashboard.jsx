import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert'; 

import { 
  IoPersonCircleOutline, IoSettingsOutline, IoLogOutOutline, 
  IoCalendarOutline, IoFileTrayFullOutline,
  IoStatsChartOutline, IoChevronDownOutline, IoCloseOutline,
  IoCheckmarkCircleOutline, IoSyncOutline, 
  IoOptionsOutline, IoTimeOutline, IoShieldOutline,
  IoCloseCircleOutline, IoTodayOutline, IoCopyOutline,
  IoCutOutline, IoCashOutline, IoPersonOutline,
  IoSaveOutline
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
  
  const [configLimites, setConfigLimites] = useState({ inicio: 8, fim: 19 });

  const [currentTime, setCurrentTime] = useState(new Date());
  const menuRef = useRef();
  const selectRef = useRef();
  
  const getSafeId = useCallback(() => id || localStorage.getItem('barbeiroId'), [id]);
  
  const ALTURA_CABECALHO = 60;

  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0];
  
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });

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
      
      const barbeariaId = logado?.fk_barbearia?._id || logado?.fk_barbearia;
      setBarbeiros(listaBarbeiros.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === String(barbeariaId)));
      setAgendamentos(resA.data || resA || []);
      setClientes(dataClientes);

      const minhaBarbearia = barbearias.find(b => String(b._id) === String(barbeariaId));
      
      if (minhaBarbearia) {
        let abertura = minhaBarbearia.abertura;
        let fechamento = minhaBarbearia.fechamento;

        if (!abertura && minhaBarbearia.horarios_padrao?.length > 0) {
           abertura = minhaBarbearia.horarios_padrao[0].abertura;
           fechamento = minhaBarbearia.horarios_padrao[0].fechamento;
        }

        if (abertura && fechamento) {
          const hInicio = parseInt(abertura.split(':')[0]);
          const hFim = parseInt(fechamento.split(':')[0]);
          if (!isNaN(hInicio) && !isNaN(hFim)) {
            setConfigLimites({ inicio: hInicio, fim: hFim });
          }
        }
      }
    } catch (error) {
      console.error("Erro fetch:", error);
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  }, [getSafeId]);

  useEffect(() => {
    fetchData();
    const intervalData = setInterval(() => fetchData(true), 15000);
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
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

  const getNomeBarbeiro = (ag) => {
    const bId = ag.fk_barbeiro?._id || ag.fk_barbeiro;
    const barbeiro = barbeiros.find(b => String(b._id) === String(bId));
    return barbeiro ? barbeiro.nome.split(' ')[0] : 'Profissional';
  };

  const agendamentosHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr));

  const getEscopoHorarios = () => {
    const escopo = [];
    for (let i = configLimites.inicio; i <= configLimites.fim; i++) {
      const horaStr = `${i < 10 ? '0' + i : i}:00`;
      const temAgendamento = agendamentosHoje.some(a => new Date(a.datahora).getHours() === i);
      escopo.push({ hora: horaStr, hInt: i, temAgendamento });
    }
    return escopo;
  };

  const getTimelinePositionPercentage = (horaCard) => {
    const currentHour = currentTime.getHours();
    const [cardHour] = horaCard.split(':');
    if (currentHour === parseInt(cardHour)) {
      const minutes = currentTime.getMinutes();
      const seconds = currentTime.getSeconds();
      return ((minutes * 60 + seconds) / 3600) * 100;
    }
    return null;
  };

  const handleSalvarAcoes = async () => {
    if (!selectedAg) return;
    try {
      const payload = { status: novoStatus, valor: novoPreco };
      if (novoStatus === 'C') payload.canceladoPor = 'Barbeiro';
      await api.put(`/agendamentos/${selectedAg._id}`, payload);
      setIsAcoesModalOpen(false);
      fetchData(true);
      setAlertConfig({ show: true, titulo: 'Sucesso', mensagem: 'Agendamento atualizado.', tipo: 'success' });
    } catch (error) {
      setAlertConfig({ show: true, titulo: 'Erro', mensagem: 'Falha ao atualizar.', tipo: 'error' });
    }
  };

  const handleCopyLink = () => {
    const fkBarbearia = barbeiroLogado?.fk_barbearia?._id || barbeiroLogado?.fk_barbearia;
    if (!fkBarbearia) return;
    const linkCadastro = `${window.location.origin}/cliente/register?barbearia=${fkBarbearia}`;
    navigator.clipboard.writeText(linkCadastro).then(() => {
      setAlertConfig({ show: true, titulo: 'Copiado!', mensagem: 'Link de cadastro copiado.', tipo: 'success' });
    });
  };

  const openAcoes = (ag) => {
    setSelectedAg(ag);
    setNovoPreco(ag.valor || '');
    setNovoStatus(ag.status || 'A');
    setIsAcoesModalOpen(true);
  };

  const stats = {
    total: agendamentosHoje.length,
    agendados: agendamentosHoje.filter(a => a.status === 'A').length,
    finalizados: agendamentosHoje.filter(a => a.status === 'F').length,
    cancelados: agendamentosHoje.filter(a => a.status === 'C').length
  };

  const currentStatusObj = statusOptions.find(s => s.id === novoStatus) || statusOptions[0];

  const NavButton = ({ icon: Icon, label, onClick }) => (
    <div className="relative group">
      <button onClick={onClick} className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-[#e6b32a] hover:border-[#e6b32a]/50' : 'bg-white border-slate-200 text-slate-500 hover:text-black hover:shadow-md'}`}>
        <Icon size={20} />
      </button>
      <div className="absolute top-14 left-1/2 -translate-x-1/2 scale-75 opacity-0 group-hover:scale-100 group-hover:opacity-100 transition-all duration-200 pointer-events-none z-[100] hidden md:block">
        <div className={`px-3 py-1.5 rounded-xl shadow-xl border text-[10px] font-black uppercase tracking-tighter whitespace-nowrap ${isDarkMode ? 'bg-[#1a1a1a] border-white/10 text-[#e6b32a]' : 'bg-white border-slate-100 text-black'}`}>
          {label}
        </div>
      </div>
    </div>
  );

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 font-sans transition-colors duration-300`}>
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        {/* HEADER */}
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl font-black italic lowercase tracking-tighter leading-none">
                barber.<span className="text-[#e6b32a]">flow</span>
              </h1>
              <div className="flex items-center gap-2 mt-2">
                <IoCalendarOutline className="text-[#e6b32a]" size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                   {diaSemana}, {dataFormatada}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 md:gap-3 border-r border-black/5 dark:border-white/5 pr-4">
                <NavButton icon={IoCopyOutline} label="Link Cadastro" onClick={handleCopyLink} />
                <NavButton icon={IoCalendarOutline} label="Calendário" onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} />
                <NavButton icon={IoFileTrayFullOutline} label="Histórico" onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} />
                <NavButton icon={IoStatsChartOutline} label="Estatísticas" onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} />
              </div>

              {barbeiroLogado?.admin && (
                <button 
                  onClick={() => navigate(`/admin/dashboard/${getSafeId()}`)}
                  className="hidden lg:flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20"
                >
                  <IoShieldOutline size={16} /> Admin
                </button>
              )}

              <div className="relative" ref={menuRef}>
                <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-3 p-2 px-3 rounded-2xl border transition-all ${isProfileOpen ? 'bg-[#e6b32a] text-black border-[#e6b32a]' : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${isProfileOpen ? 'bg-black/10' : 'bg-[#e6b32a] text-black'}`}>
                    <IoPersonCircleOutline size={24} />
                  </div>
                  <IoChevronDownOutline size={14} className={isProfileOpen ? 'rotate-180' : ''} />
                </button>
                {isProfileOpen && (
                  <div className={`absolute right-0 mt-3 w-60 border rounded-[2rem] shadow-2xl z-50 overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-100'}`}>
                    <button onClick={() => navigate(`/barbeiro/configuracoes/${getSafeId()}`)} className="w-full flex items-center gap-3 p-4 text-[11px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/5">
                      <IoSettingsOutline size={18} className="text-[#e6b32a]"/> editar perfil
                    </button>
                    <button onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }} className="w-full p-4 text-[10px] font-black uppercase text-red-500 flex items-center gap-3 hover:bg-red-500/10 transition-colors">
                      <IoLogOutOutline size={18} /> encerrar sessão
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Total Hoje', value: stats.total, icon: IoStatsChartOutline, color: 'text-[#e6b32a]', bg: 'bg-[#e6b32a]/10' },
              { label: 'Agendados', value: stats.agendados, icon: IoTimeOutline, color: 'text-blue-500', bg: 'bg-blue-500/10' },
              { label: 'Finalizados', value: stats.finalizados, icon: IoCheckmarkCircleOutline, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
              { label: 'Cancelados', value: stats.cancelados, icon: IoCloseCircleOutline, color: 'text-red-500', bg: 'bg-red-500/10' },
            ].map((stat, i) => (
              <div key={i} className={`p-4 rounded-[1.5rem] border transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                    <stat.icon size={18} />
                  </div>
                  <span className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stat.value}</span>
                </div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-50">{stat.label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* AGENDA */}
        <div className={`relative rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="overflow-x-auto h-[calc(100vh-380px)] custom-scrollbar">
            <table className="w-full border-collapse min-w-[1200px] table-fixed">
              <thead>
                <tr style={{ height: `${ALTURA_CABECALHO}px` }}>
                  <th className={`sticky left-0 z-40 w-24 p-2 border-b border-r text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>Hora</th>
                  {barbeiros.map(b => (
                    <th key={b._id} className={`p-2 border-b border-r text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'border-white/5 text-white/80' : 'border-slate-100 text-slate-700'}`}>
                      {b.nome.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getEscopoHorarios().map(({ hora, hInt, temAgendamento }) => {
                  const posLinha = getTimelinePositionPercentage(hora);

                  return (
                    <tr 
                      key={hora} 
                      className={`relative group/row transition-all duration-300 ${temAgendamento ? 'h-[90px]' : 'h-[35px]'}`}
                    >
                      <td className={`sticky left-0 z-20 p-2 border-b border-r text-center font-mono text-[10px] font-black transition-colors ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-500 group-hover/row:text-[#e6b32a]' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover/row:text-black'}`}>
                        {hora}
                        {posLinha !== null && (
                          <div className="absolute left-0 w-[2000px] z-50 pointer-events-none flex items-center" style={{ top: `${posLinha}%`, transition: 'top 1s linear' }}>
                            <div className="w-full h-[1.5px] bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]"></div>
                          </div>
                        )}
                      </td>
                      {barbeiros.map(b => {
                        const ags = agendamentosHoje.filter(a => String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(b._id) && new Date(a.datahora).getHours() === hInt);
                        const isMeuAtendimento = String(b._id) === String(getSafeId());

                        return (
                          <td key={b._id} className={`p-1 border-b border-r align-top relative transition-all duration-300 ${isDarkMode ? 'border-white/5' : 'border-slate-100'} ${!temAgendamento ? 'bg-black/[0.02] dark:bg-white/[0.01]' : ''}`}>
                            <div className={`grid gap-1 h-full ${ags.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {ags.map(ag => (
                                <button 
                                  key={ag._id} 
                                  onClick={() => isMeuAtendimento && openAcoes(ag)}
                                  className={`group w-full p-2 rounded-xl text-left border shadow-sm transition-all h-fit relative z-10
                                    ${!isMeuAtendimento ? 'opacity-30 grayscale cursor-default' : 'hover:scale-[1.02] active:scale-95'}
                                    ${ag.status === 'F' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                    : ag.status === 'C' ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                    : 'bg-[#e6b32a] text-black border-[#e6b32a]'}`}
                                >
                                  <div className="flex flex-col gap-1">
                                    <div className="flex justify-between items-start">
                                      <p className="text-[9px] font-black uppercase truncate max-w-[70%]">{getNomeExibicao(ag)}</p>
                                      <span className="text-[8px] font-black opacity-70">
                                        {new Date(ag.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    
                                    <div className="mt-1 border-t border-black/5 pt-1">
                                      <div className="flex justify-between items-end">
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1 opacity-80">
                                            <IoCutOutline size={10}/>
                                            <p className="text-[8px] font-bold uppercase truncate">{ag.tipoCorte || 'serviço'}</p>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <IoCashOutline size={10}/>
                                            <p className="text-[9px] font-black">R$ {ag.valor || '0,00'}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-right">
                                           <p className="text-[9px] font-black uppercase truncate text-black/60">
                                              {getNomeBarbeiro(ag)}
                                           </p>
                                           <IoPersonOutline size={10} className="opacity-50"/>
                                        </div>
                                      </div>
                                    </div>
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
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md">
           <div className={`w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'} animate-in slide-in-from-bottom md:zoom-in duration-300`}>
             <div className="p-8">
               <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentStatusObj.bg} ${currentStatusObj.color}`}>
                    <currentStatusObj.icon size={22}/>
                  </div>
                  <h3 className="text-xl font-black italic">registro.<span className="text-[#e6b32a]">detalhes</span></h3>
                </div>
                <button onClick={() => setIsAcoesModalOpen(false)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><IoCloseOutline size={28}/></button>
              </div>

              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-wider">Cliente / Serviço</p>
                    <p className="text-sm font-black uppercase text-[#e6b32a]">{getNomeExibicao(selectedAg)}</p>
                    <div className="mt-3 pt-3 border-t border-black/5 dark:border-white/10 flex items-center gap-2">
                        <IoCutOutline size={14} className="text-[#e6b32a]" />
                        <p className="text-xs font-black uppercase">{selectedAg.tipoCorte || 'Corte/Serviço'}</p>
                    </div>
                </div>

                <div className={`p-5 rounded-[2rem] border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-[#e6b32a]/50' : 'bg-slate-50 border-slate-200 focus-within:border-black/30'}`}>
                  <label className="text-[9px] font-black uppercase text-[#e6b32a] mb-2 block tracking-widest ml-1">valor do serviço</label>
                  <div className="flex items-center relative">
                      <span className="absolute left-0 font-black text-gray-500 text-xl">R$</span>
                      <input 
                        type="number" 
                        value={novoPreco} 
                        onChange={(e) => setNovoPreco(e.target.value)} 
                        className="w-full bg-transparent border-none focus:ring-0 pl-7 font-black text-3xl py-1 outline-none text-inherit" 
                      />
                  </div>
                </div>

                <div className="space-y-2 relative" ref={selectRef}>
                  <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">atualizar status</label>
                  <button onClick={() => setIsSelectOpen(!isSelectOpen)} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} ${isSelectOpen ? 'border-[#e6b32a] ring-2 ring-[#e6b32a]/10' : ''}`}>
                    <div className="flex items-center gap-3">
                      <currentStatusObj.icon size={18} className={currentStatusObj.color} />
                      <span className="text-xs font-black uppercase">{currentStatusObj.label}</span>
                    </div>
                    <IoChevronDownOutline size={16} className={isSelectOpen ? 'rotate-180' : ''} />
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

                <button onClick={handleSalvarAcoes} className="w-full py-5 rounded-[2rem] bg-[#e6b32a] text-black font-black uppercase text-[11px] tracking-[2px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  <IoSaveOutline size={20}/> Salvar Alterações
                </button>
              </div>
             </div>
           </div>
        </div>
      )}

      {alertConfig.show && (
        <CustomAlert titulo={alertConfig.titulo} message={alertConfig.mensagem} type={alertConfig.tipo} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />
      )}
    </div>
  );
}