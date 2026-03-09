import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert'; 
import ModalAgendamentoAvulso from '../../components/modais/ModalAgendamentoAvulso';

import { 
  IoPersonCircleOutline, IoSettingsOutline, IoLogOutOutline, 
  IoCalendarOutline, IoFileTrayFullOutline,
  IoStatsChartOutline, IoChevronDownOutline, IoCloseOutline,
  IoCheckmarkCircleOutline, IoTimeOutline, IoShieldOutline,
  IoCloseCircleOutline, IoCopyOutline,
  IoCutOutline, IoCashOutline, IoPersonOutline,
  IoSaveOutline, IoAddOutline,
  IoShieldCheckmarkOutline
} from 'react-icons/io5';

export default function BarbeiroDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbeiroLogado, setBarbeiroLogado] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAcoesModalOpen, setIsAcoesModalOpen] = useState(false);
  const [isAvulsoModalOpen, setIsAvulsoModalOpen] = useState(false);
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
  
  const ALTURA_LINHA = 80;
  const ALTURA_CABECALHO = 48;

  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0];
  const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });

  const statusOptions = [
    { id: 'A', label: 'Agendado (Aberto)', icon: IoTimeOutline, color: 'text-blue-500', bg: 'bg-blue-500/10' },
    { id: 'F', label: 'Finalizado / Pago', icon: IoCheckmarkCircleOutline, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 'C', label: 'Cancelado', icon: IoCloseCircleOutline, color: 'text-red-500', bg: 'bg-red-500/10' },
  ];

  const fetchData = useCallback(async (isAutoRefresh = false) => {
    const currentId = getSafeId();
    if (!currentId) return;
    try {
      if (!isAutoRefresh) setLoading(true);
      
      const [resB, resA, resBarbearias] = await Promise.all([
        api.get('/barbeiros'),
        api.get('/agendamentos'),
        api.get('/barbearias')
      ]);

      const listaBarbeiros = resB.data || resB || [];
      const logado = listaBarbeiros.find(b => String(b._id) === String(currentId));
      setBarbeiroLogado(logado);
      
      const barbeariaId = logado?.fk_barbearia?._id || logado?.fk_barbearia;
      setBarbeiros(listaBarbeiros.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === String(barbeariaId)));
      
      const todosAgs = resA.data || resA || [];
      setAgendamentos(todosAgs.filter(a => String(a.fk_barbearia?._id || a.fk_barbearia) === String(barbeariaId)));
      
      const minhaBarbearia = (resBarbearias.data || resBarbearias).find(b => String(b._id) === String(barbeariaId));
      if (minhaBarbearia) {
        let abertura = minhaBarbearia.abertura || "08:00";
        let fechamento = minhaBarbearia.fechamento || "19:00";
        setConfigLimites({ 
          inicio: parseInt(abertura.split(':')[0]), 
          fim: parseInt(fechamento.split(':')[0]) 
        });
      }
    } catch (error) { console.error(error); } finally { if (!isAutoRefresh) setLoading(false); }
  }, [getSafeId]);

  useEffect(() => {
    fetchData();
    const intervalData = setInterval(() => fetchData(true), 15000);
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(intervalData); clearInterval(intervalTime); };
  }, [fetchData]);

  const handleLogout = () => {
    const barbeariaId = barbeiroLogado?.fk_barbearia?._id || barbeiroLogado?.fk_barbearia;
    localStorage.clear();
    navigate(barbeariaId ? `/barbeiro/login?barbearia=${barbeariaId}` : '/barbeiro/login');
  };

  const handleSalvarAvulso = async (payload) => {
    try {
      const finalPayload = { ...payload, fk_barbearia: barbeiroLogado.fk_barbearia?._id || barbeiroLogado.fk_barbearia };
      await api.post('/agendamentos', finalPayload);
      setIsAvulsoModalOpen(false);
      fetchData(true);
      setAlertConfig({ show: true, titulo: 'Sucesso', mensagem: 'Agendamento realizado!', tipo: 'success' });
    } catch (error) {
      setAlertConfig({ show: true, titulo: 'Erro', mensagem: error.response?.data?.message || 'Falha ao processar.', tipo: 'error' });
    }
  };

  const handleSalvarAcoes = async () => {
    if (!selectedAg) return;
    try {
      const payload = { status: novoStatus, valor: Number(novoPreco), cliente: selectedAg.cliente };
      await api.put(`/agendamentos/${selectedAg._id}`, payload);
      setIsAcoesModalOpen(false);
      fetchData(true);
      setAlertConfig({ show: true, titulo: 'Sucesso', mensagem: 'Agendamento atualizado.', tipo: 'success' });
    } catch (error) {
      setAlertConfig({ show: true, titulo: 'Erro', mensagem: 'Falha ao atualizar.', tipo: 'error' });
    }
  };

  const openAcoes = (ag) => {
    setSelectedAg(ag);
    setNovoPreco(ag.valor || '');
    setNovoStatus(ag.status || 'A');
    setIsAcoesModalOpen(true);
  };

  const copiarLinkCadastro = () => {
    const idBarbearia = barbeiroLogado.fk_barbearia?._id || barbeiroLogado.fk_barbearia;
    const link = `${window.location.origin}/cliente/register?barbearia=${idBarbearia}`;
    navigator.clipboard.writeText(link);
    setAlertConfig({ show: true, titulo: 'Copiado!', mensagem: 'Link de cadastro copiado.', tipo: 'success' });
    setIsProfileOpen(false);
  };

  const getEscopoHorarios = () => {
    const escopo = [];
    for (let i = configLimites.inicio; i <= configLimites.fim; i++) {
      escopo.push({ hora: `${i < 10 ? '0' + i : i}:00`, hInt: i });
    }
    return escopo;
  };

  const getTimelinePositionPercentage = (horaCard) => {
    const currentHour = currentTime.getHours();
    const [cardHour] = horaCard.split(':');
    if (currentHour === parseInt(cardHour)) return (currentTime.getMinutes() / 60) * 100;
    return null;
  };

  const getNomeExibicao = (ag) => ag.cliente?.nome || ag.nomeCliente || 'Cliente';
  
  const agendamentosHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr));
  const stats = { 
    total: agendamentosHoje.length, 
    agendados: agendamentosHoje.filter(a => a.status === 'A').length, 
    finalizados: agendamentosHoje.filter(a => a.status === 'F').length, 
    cancelados: agendamentosHoje.filter(a => a.status === 'C').length 
  };

  const currentStatusObj = statusOptions.find(s => s.id === novoStatus) || statusOptions[0];

  const NavButton = ({ icon: Icon, onClick, label, variant = 'default' }) => (
    <div className="relative group flex flex-col items-center">
      <button 
        onClick={onClick}
        className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center transition-all active:scale-95 border
        ${variant === 'primary' 
          ? 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20 border-[#e6b32a] hover:scale-105' 
          : isDarkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-[#e6b32a]' : 'bg-white border-slate-200 text-slate-500 hover:text-black'}`}
      >
        <Icon size={variant === 'primary' ? 26 : 20} />
      </button>
      <span className={`absolute -bottom-10 scale-0 group-hover:scale-100 transition-all duration-200 z-[100] px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest pointer-events-none whitespace-nowrap border shadow-xl
        ${isDarkMode ? 'bg-[#1a1a1a] text-white border-white/10' : 'bg-black text-white border-black'}`}>
        {label}
      </span>
    </div>
  );

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}><div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 font-sans transition-colors duration-300`}>
      <div className="max-w-[1600px] mx-auto space-y-8">
        
        <header className="space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div className="flex items-center gap-4">
              {/* BOTÃO VOLTAR REMOVIDO */}
              <div>
                <h1 className="text-3xl font-black italic lowercase tracking-tighter leading-none">barber.<span className="text-[#e6b32a]">flow</span></h1>
                <div className="flex items-center gap-2 mt-2">
                  <IoCalendarOutline className="text-[#e6b32a]" size={14} />
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">{diaSemana}, {dataFormatada}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 md:gap-3 border-r border-black/5 dark:border-white/5 pr-4">
                <NavButton icon={IoAddOutline} label="Agendar Agora" variant="primary" onClick={() => setIsAvulsoModalOpen(true)} />
                <NavButton icon={IoCalendarOutline} label="Calendário" onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} />
                <NavButton icon={IoFileTrayFullOutline} label="Histórico" onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} />
                <NavButton icon={IoStatsChartOutline} label="Estatísticas" onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} />
              </div>

              <div className="flex items-center gap-2">
                {barbeiroLogado?.admin && (
                  <button onClick={() => navigate(`/admin/dashboard/${barbeiroLogado.fk_barbearia?._id || barbeiroLogado.fk_barbearia}`)} className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl shadow-lg shadow-blue-600/20 transition-all active:scale-95 group">
                    <IoShieldCheckmarkOutline size={20} className="group-hover:rotate-12 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-wider">Admin</span>
                  </button>
                )}

                <div className="relative group" ref={menuRef}>
                  <button onClick={() => setIsProfileOpen(!isProfileOpen)} className={`flex items-center gap-3 p-2 px-3 rounded-2xl border transition-all ${isProfileOpen ? 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
                    <div className="relative"><IoPersonCircleOutline size={24} /></div>
                    <IoChevronDownOutline size={14} className={isProfileOpen ? 'rotate-180' : ''} />
                  </button>
                  
                  {isProfileOpen && (
                    <div className={`absolute right-0 top-full mt-3 w-64 border rounded-[2.2rem] shadow-2xl z-[150] overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-100'}`}>
                      <div className="p-4 border-b border-black/5 dark:border-white/5">
                          <p className="text-[9px] font-black uppercase opacity-40 tracking-widest ml-1">Minha Conta</p>
                      </div>

                      <button onClick={copiarLinkCadastro} className="w-full flex items-center gap-3 p-4 text-[11px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b border-black/5 dark:border-white/5">
                        <IoCopyOutline size={18} className="text-[#e6b32a]"/> copiar link de cadastro
                      </button>
                      <button onClick={() => navigate(`/barbeiro/configuracoes/${getSafeId()}`)} className="w-full flex items-center gap-3 p-4 text-[11px] font-bold hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <IoSettingsOutline size={18} className="text-[#e6b32a]"/> editar meu perfil
                      </button>
                      <button onClick={handleLogout} className="w-full p-5 text-[10px] font-black uppercase text-red-500 flex items-center gap-3 bg-red-500/5 hover:bg-red-500/10 transition-colors">
                        <IoLogOutOutline size={18} /> encerrar sessão
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[ 
              { label: 'Total Hoje', value: stats.total, icon: IoStatsChartOutline, color: 'text-[#e6b32a]', bg: 'bg-[#e6b32a]/10' }, 
              { label: 'Agendados', value: stats.agendados, icon: IoTimeOutline, color: 'text-blue-500', bg: 'bg-blue-500/10' }, 
              { label: 'Finalizados', value: stats.finalizados, icon: IoCheckmarkCircleOutline, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }, 
              { label: 'Cancelados', value: stats.cancelados, icon: IoCloseCircleOutline, color: 'text-red-500', bg: 'bg-red-500/10' } 
            ].map((stat, i) => (
              <div key={i} className={`p-4 rounded-[1.5rem] border transition-all ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-2">
                  <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={18} /></div>
                  <span className="text-2xl font-black">{stat.value}</span>
                </div>
                <p className="text-[10px] font-black uppercase opacity-50 tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </header>

        {/* TABELA DE AGENDAMENTOS */}
        <div className={`relative rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="overflow-x-auto min-h-fit custom-scrollbar">
            <table className="w-full border-collapse min-w-[1200px] table-fixed">
              <thead>
                <tr style={{ height: `${ALTURA_CABECALHO}px` }}>
                  <th className={`sticky left-0 z-40 w-24 p-2 border-b border-r text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>Hora</th>
                  {barbeiros.map(b => (
                    <th key={b._id} className={`p-2 border-b border-r text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'border-white/5 text-white/80' : 'border-slate-100 text-slate-700'}`}>{b.nome.split(' ')[0]}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getEscopoHorarios().map(({ hora, hInt }) => {
                  const posLinha = getTimelinePositionPercentage(hora);
                  return (
                    <tr key={hora} className="relative group/row" style={{ height: `${ALTURA_LINHA}px` }}>
                      <td className={`sticky left-0 z-20 p-2 border-b border-r text-center font-mono text-[10px] font-black transition-colors ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-500 group-hover/row:text-[#e6b32a]' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover/row:text-black'}`}>
                        {hora}
                        {posLinha !== null && <div className="absolute left-0 w-[2000px] z-50 pointer-events-none flex items-center" style={{ top: `${posLinha}%` }}><div className="w-full h-[2px] bg-red-600"></div></div>}
                      </td>
                      {barbeiros.map(b => {
                        const ags = agendamentosHoje.filter(a => String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(b._id) && new Date(a.datahora).getHours() === hInt);
                        const isMeu = String(b._id) === String(getSafeId());
                        const temAgendamento = ags.length > 0;

                        return (
                          <td 
                            key={b._id} 
                            className={`p-1 border-r align-top relative transition-all ${
                              temAgendamento 
                                ? `border-b ${isDarkMode ? 'border-white/10' : 'border-slate-200'}` 
                                : `border-b-[0.5px] ${isDarkMode ? 'border-white/5' : 'border-slate-100 opacity-40'}`
                            }`}
                          >
                            <div className={`grid gap-1 h-full ${ags.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {ags.map(ag => (
                                <button key={ag._id} onClick={() => isMeu && openAcoes(ag)} className={`group w-full p-2 rounded-xl text-left border shadow-sm transition-all h-fit relative z-10 ${!isMeu ? 'opacity-40 grayscale pointer-events-none' : 'hover:scale-[1.02]'} ${ag.status === 'F' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : ag.status === 'C' ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-[#e6b32a] text-black border-[#e6b32a]'}`}>
                                  <div className="flex flex-col">
                                    <div className="flex justify-between items-start">
                                      <p className="text-[9px] font-black uppercase truncate">{getNomeExibicao(ag)}</p>
                                      <span className="text-[8px] font-black opacity-70">{new Date(ag.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                    <div className="mt-2 border-t border-black/5 pt-2 flex justify-between items-end">
                                      <div className="space-y-0.5">
                                        <div className="flex items-center gap-1 opacity-80"><IoCutOutline size={9}/><p className="text-[8px] font-bold uppercase truncate">{ag.tipoCorte || 'serviço'}</p></div>
                                        <div className="flex items-center gap-1"><IoCashOutline size={9}/><p className="text-[9px] font-black">R$ {ag.valor?.toFixed(2) || '0,00'}</p></div>
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

      <ModalAgendamentoAvulso isOpen={isAvulsoModalOpen} onClose={() => setIsAvulsoModalOpen(false)} onSave={handleSalvarAvulso} isDarkMode={isDarkMode} />

      {/* MODAL DE AÇÕES */}
      {isAcoesModalOpen && selectedAg && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md">
            <div className={`w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'} animate-in slide-in-from-bottom duration-300`}>
              <div className="p-8">
                <div className="flex justify-between items-center mb-6">
                 <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentStatusObj.bg} ${currentStatusObj.color}`}><currentStatusObj.icon size={22}/></div>
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
                   <div className="flex items-center relative"><span className="absolute left-0 font-black text-gray-500 text-xl">R$</span><input type="number" value={novoPreco} onChange={(e) => setNovoPreco(e.target.value)} className="w-full bg-transparent border-none focus:ring-0 pl-7 font-black text-3xl py-1 outline-none text-inherit" /></div>
                 </div>
                 <div className="space-y-2 relative" ref={selectRef}>
                   <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest ml-1">atualizar status</label>
                   <button onClick={() => setIsSelectOpen(!isSelectOpen)} className={`w-full p-4 rounded-2xl border flex items-center justify-between transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} ${isSelectOpen ? 'border-[#e6b32a] ring-2 ring-[#e6b32a]/10' : ''}`}><div className="flex items-center gap-3"><currentStatusObj.icon size={18} className={currentStatusObj.color} /><span className="text-xs font-black uppercase">{currentStatusObj.label}</span></div><IoChevronDownOutline size={16} className={isSelectOpen ? 'rotate-180' : ''} /></button>
                   {isSelectOpen && (
                     <div className={`absolute bottom-full mb-2 w-full border rounded-2xl shadow-2xl z-[130] overflow-hidden ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-100'}`}>
                       {statusOptions.map((opt) => (
                         <button key={opt.id} onClick={() => { setNovoStatus(opt.id); setIsSelectOpen(false); }} className={`w-full p-4 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 transition-colors border-b last:border-none ${isDarkMode ? 'border-white/5' : 'border-slate-50'} ${novoStatus === opt.id ? 'bg-[#e6b32a]/5' : ''}`}><opt.icon size={18} className={opt.color} /><span className={`text-[11px] font-black uppercase ${novoStatus === opt.id ? 'text-[#e6b32a]' : 'text-gray-500'}`}>{opt.label}</span></button>
                       ))}
                     </div>
                   )}
                 </div>
                 <button onClick={handleSalvarAcoes} className="w-full py-5 rounded-[2rem] bg-[#e6b32a] text-black font-black uppercase text-[11px] tracking-[2px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"><IoSaveOutline size={20}/> Salvar Alterações</button>
               </div>
             </div>
            </div>
        </div>
      )}

      {alertConfig.show && (
        <CustomAlert titulo={alertConfig.titulo} message={alertConfig.mensagem} type={alertConfig.tipo} onClose={() => setAlertConfig(prev => ({ ...prev, show: false }))} />
      )}
    </div>
  );
}