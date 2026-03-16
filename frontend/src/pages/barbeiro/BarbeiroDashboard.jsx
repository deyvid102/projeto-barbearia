import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert'; 
import ModalAgendamentoAvulso from '../../components/modais/ModalAgendamentoAvulso';
import ScheduleGrid from '../../components/agenda/ScheduleGrid';
import DateSelector from '../../components/agenda/DateSelector.jsx';

import { 
  IoPersonCircleOutline, IoSettingsOutline, IoLogOutOutline, 
  IoCalendarOutline, IoFileTrayFullOutline,
  IoStatsChartOutline, IoChevronDownOutline, IoCloseOutline,
  IoCheckmarkCircleOutline, IoTimeOutline,
  IoCloseCircleOutline,
  IoPersonOutline,
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
  
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAcoesModalOpen, setIsAcoesModalOpen] = useState(false);
  const [isAvulsoModalOpen, setIsAvulsoModalOpen] = useState(false);
  const [isSelectStatusOpen, setIsSelectStatusOpen] = useState(false);
  const [isSelectProfMobileOpen, setIsSelectProfMobileOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [selectedAg, setSelectedAg] = useState(null);
  const [novoPreco, setNovoPreco] = useState('');
  const [novoStatus, setNovoStatus] = useState('A');

  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'success' });
  const [configLimites, setConfigLimites] = useState({ inicio: 8, fim: 19 });
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const menuRef = useRef();
  const profSelectRef = useRef();
  
  const getSafeId = useCallback(() => id || localStorage.getItem('barbeiroId'), [id]);
  
  const ALTURA_CABECALHO = 48;
  const ALTURA_LINHA_VAZIA = '32px';

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
      
      if (!selectedProfessionalId) {
         setSelectedProfessionalId(String(currentId));
      }

      const barbeariaId = logado?.fk_barbearia?._id || logado?.fk_barbearia;
      
      setBarbeiros(listaBarbeiros.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === String(barbeariaId)));
      const todosAgs = resA.data || resA || [];
      setAgendamentos(todosAgs.filter(a => String(a.fk_barbearia?._id || a.fk_barbearia) === String(barbeariaId)));
      
      const listaBarbearias = resBarbearias.data || resBarbearias;
      const minhaBarbearia = listaBarbearias.find(b => String(b._id) === String(barbeariaId));
      
      if (minhaBarbearia) {
        let abertura = minhaBarbearia.abertura || "08:00";
        let fechamento = minhaBarbearia.fechamento || "19:00";
        setConfigLimites({ 
          inicio: parseInt(abertura.split(':')[0]), 
          fim: parseInt(fechamento.split(':')[0]) 
        });

        if (minhaBarbearia.nome) {
          const slug = minhaBarbearia.nome.toLowerCase().trim().replace(/\s+/g, '-');
          localStorage.setItem('lastBarbeariaSlug', slug);
        }
      }
    } catch (error) { console.error(error); } finally { if (!isAutoRefresh) setLoading(false); }
  }, [getSafeId, selectedProfessionalId]);

  useEffect(() => {
    fetchData();
    const intervalData = setInterval(() => fetchData(true), 15000);
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(intervalData); clearInterval(intervalTime); };
  }, [fetchData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (profSelectRef.current && !profSelectRef.current.contains(event.target)) setIsSelectProfMobileOpen(false);
      if (menuRef.current && !menuRef.current.contains(event.target)) setIsProfileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    const nomeBruto = barbeiroLogado?.fk_barbearia?.nome;
    const slugFinal = nomeBruto 
      ? nomeBruto.toLowerCase().trim().replace(/\s+/g, '-') 
      : (localStorage.getItem('lastBarbeariaSlug') || 'admin');
    localStorage.clear();
    navigate(`/barbeiro/login/${slugFinal}`, { replace: true });
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

  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const dataAg = new Date(ag.datahora);
  
    return (
      dataAg.toDateString() === selectedDate.toDateString()
    );
  });
  
  // CORREÇÃO: Filtragem hoje também deve considerar a string da data UTC
  const agendamentosHoje = agendamentos.filter(a => a.datahora && a.datahora.startsWith(hojeStr));
  
  const stats = { 
    total: agendamentosHoje.length, 
    agendados: agendamentosHoje.filter(a => a.status === 'A').length, 
    finalizados: agendamentosHoje.filter(a => a.status === 'F').length, 
    cancelados: agendamentosHoje.filter(a => a.status === 'C').length 
  };

  const currentStatusObj = statusOptions.find(s => s.id === novoStatus) || statusOptions[0];

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

  const barbeirosExibidos = barbeiros.filter(b => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return true;
    return String(b._id) === selectedProfessionalId;
  });

  if (loading) return <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}><div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-3 md:p-8 font-sans transition-colors duration-300`}>
      <div className="max-w-[1600px] mx-auto space-y-4 md:space-y-8">
        
        <header className="space-y-4 md:space-y-6">
          <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4">
            <div className="flex justify-between items-center md:items-start gap-4">
              <div>
                <h1 className="text-xl md:text-3xl font-black italic uppercase tracking-tighter leading-none">barber <span className="text-[#e6b32a]">max</span></h1>
                <div className="flex items-center gap-2 mt-1 md:mt-2">
                  <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-widest opacity-60">{diaSemana}, {dataFormatada}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex flex-1 items-center gap-2 md:gap-3 md:border-r border-black/5 dark:border-white/5 md:pr-4">
                <div className="hidden md:block">
                    <NavButton icon={IoAddOutline} label="Novo Agendamento" variant="primary" onClick={() => setIsAvulsoModalOpen(true)} />
                </div>
                <NavButton icon={IoCalendarOutline} label="Calendário" onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} />
                <NavButton icon={IoFileTrayFullOutline} label="Histórico" onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} />
                <NavButton icon={IoStatsChartOutline} label="Estatísticas" onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} />
              </div>

              <div className="flex items-center gap-2 md:gap-3">
                {barbeiroLogado?.admin && (
                  <NavButton 
                    className="hidden md:flex"
                    icon={IoShieldCheckmarkOutline} 
                    label="Painel Administrativo" 
                    onClick={() => {
                      const idBarbearia = barbeiroLogado.fk_barbearia?._id || barbeiroLogado.fk_barbearia;
                      navigate(`/admin/dashboard/${idBarbearia}`);
                    }}
                    colorClass={`bg-blue-600/10 border-blue-600/20 text-blue-500 hover:bg-blue-600 hover:text-white`}
                  />
                )}

                <div className="relative" ref={menuRef}>
                  <button 
                    onClick={() => setIsProfileOpen(!isProfileOpen)} 
                    className={`flex items-center gap-2 p-2 px-3 h-10 md:h-14 rounded-xl md:rounded-2xl border transition-all ${isProfileOpen ? 'bg-[#e6b32a] text-black' : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
                  >
                    <IoPersonCircleOutline size={22} className="md:w-6 md:h-6" />
                    <IoChevronDownOutline size={12} className={`transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isProfileOpen && (
                    <div className={`absolute right-0 mt-3 w-60 border rounded-[1.5rem] md:rounded-[2rem] shadow-2xl z-[150] overflow-hidden animate-in fade-in slide-in-from-top-2 ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-100'}`}>
                      <div className="p-4 border-b border-black/5 dark:border-white/5 bg-black/5 dark:bg-white/5">
                          <p className="text-[9px] font-black uppercase opacity-40">Barbeiro</p>
                          <p className="text-xs font-black truncate">{barbeiroLogado?.nome}</p>
                      </div>
                      {barbeiroLogado?.admin && (
                        <button onClick={() => navigate(`/admin/dashboard/${barbeiroLogado.fk_barbearia?._id || barbeiroLogado.fk_barbearia}`)} className="md:hidden w-full flex items-center gap-3 p-4 text-[10px] font-black uppercase bg-blue-600/10 text-blue-500 border-b border-black/5 dark:border-white/5">
                          <IoShieldCheckmarkOutline size={16} /> Painel Admin
                        </button>
                      )}
                      <button onClick={() => navigate(`/barbeiro/configuracoes/${getSafeId()}`)} className="w-full flex items-center gap-3 p-4 text-[10px] font-black uppercase hover:bg-[#e6b32a] hover:text-black transition-colors border-b border-black/5 dark:border-white/5">
                        <IoSettingsOutline size={16} /> meu perfil
                      </button>
                      <button onClick={handleLogout} className="w-full p-4 text-[10px] font-black uppercase text-red-500 flex items-center gap-3 bg-red-500/5 hover:bg-red-500 transition-colors hover:text-white">
                        <IoLogOutOutline size={16} /> sair
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="block md:hidden">
            <button onClick={() => setIsAvulsoModalOpen(true)} className="w-full h-12 rounded-xl bg-[#e6b32a] text-black flex items-center justify-center gap-3 shadow-lg shadow-[#e6b32a]/20 active:scale-[0.98]">
              <IoAddOutline size={20} /><span className="text-[11px] font-black uppercase tracking-widest">Novo Agendamento</span>
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[ 
              { label: 'Total Hoje', value: stats.total, icon: IoStatsChartOutline, color: 'text-[#e6b32a]', bg: 'bg-[#e6b32a]/10' }, 
              { label: 'Agendados', value: stats.agendados, icon: IoTimeOutline, color: 'text-blue-500', bg: 'bg-blue-500/10' }, 
              { label: 'Finalizados', value: stats.finalizados, icon: IoCheckmarkCircleOutline, color: 'text-emerald-500', bg: 'bg-emerald-500/10' }, 
              { label: 'Cancelados', value: stats.cancelados, icon: IoCloseCircleOutline, color: 'text-red-500', bg: 'bg-red-500/10' } 
            ].map((stat, i) => (
              <div key={i} className={`p-3 md:p-4 rounded-[1.2rem] md:rounded-[1.5rem] border ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex justify-between items-start mb-1 md:mb-2">
                  <div className={`p-1.5 md:p-2 rounded-xl ${stat.bg} ${stat.color}`}><stat.icon size={16} /></div>
                  <span className="text-xl md:text-2xl font-black">{stat.value}</span>
                </div>
                <p className="text-[8px] md:text-[10px] font-black uppercase opacity-50 tracking-widest">{stat.label}</p>
              </div>
            ))}
          </div>
        </header>

        <div className="md:hidden space-y-2 mb-2">
          <label className="text-[9px] font-black uppercase opacity-50 tracking-widest ml-1">Exibir Profissional</label>
          <div className="relative" ref={profSelectRef}>
            <button onClick={() => setIsSelectProfMobileOpen(!isSelectProfMobileOpen)} className={`w-full p-4 h-12 rounded-xl border flex items-center justify-between ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center gap-3">
                <IoPersonOutline size={18} className="text-[#e6b32a]" />
                <span className="text-[10px] font-black uppercase">{barbeiros.find(b => String(b._id) === selectedProfessionalId)?.nome || 'Selecionar Barbeiro'}</span>
              </div>
              <IoChevronDownOutline size={16} className={`transition-transform ${isSelectProfMobileOpen ? 'rotate-180' : ''}`} />
            </button>
            {isSelectProfMobileOpen && (
              <div className={`absolute top-full mt-2 w-full border rounded-xl shadow-2xl z-[130] overflow-hidden ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-100'}`}>
                {barbeiros.map((b) => (
                  <button key={b._id} onClick={() => { setSelectedProfessionalId(String(b._id)); setIsSelectProfMobileOpen(false); }} className={`w-full p-4 flex items-center gap-3 hover:bg-[#e6b32a] hover:text-black transition-colors border-b last:border-none text-[10px] font-black uppercase ${isDarkMode ? 'border-white/5' : 'border-slate-50'}`}>
                    <IoPersonOutline size={16} /> {b.nome}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <DateSelector
          selectedDate={selectedDate}
          setSelectedDate={setSelectedDate}
          isDarkMode={isDarkMode}
        />

        <ScheduleGrid
          barbeiros={barbeirosExibidos}
          agendamentos={agendamentosFiltrados}
          isDarkMode={isDarkMode}
          configLimites={configLimites}
          currentTime={currentTime}
          getNomeExibicao={getNomeExibicao}
          getHourFromDate={(dataStr) => new Date(dataStr).getHours()}
          formatHourLabel={(ag) =>
            new Date(ag.datahora).toLocaleTimeString('pt-BR', {
              hour: '2-digit',
              minute: '2-digit',
            })
          }
          onCardClick={openAcoes}
          disableOthersForId={String(getSafeId())}
        />
    </div>

      <ModalAgendamentoAvulso isOpen={isAvulsoModalOpen} onClose={() => setIsAvulsoModalOpen(false)} onSave={handleSalvarAvulso} isDarkMode={isDarkMode} />

      {isAcoesModalOpen && selectedAg && (
        <div className="fixed inset-0 z-[200] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md">
            <div className={`w-full max-w-md rounded-t-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-black italic">registro.<span className="text-[#e6b32a]">detalhes</span></h3>
                    <button onClick={() => setIsAcoesModalOpen(false)} className="p-2 text-gray-500 hover:text-red-500"><IoCloseOutline size={28}/></button>
                </div>
                <div className="space-y-5">
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <p className="text-sm font-black uppercase text-[#e6b32a]">{getNomeExibicao(selectedAg)}</p>
                        <p className="text-[10px] font-black uppercase opacity-50">{selectedAg.tipoCorte}</p>
                    </div>
                    <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
                     <label className="text-[9px] font-black uppercase text-[#e6b32a] mb-1 block">valor</label>
                     <input type="number" value={novoPreco} onChange={(e) => setNovoPreco(e.target.value)} className="w-full bg-transparent font-black text-2xl outline-none" />
                    </div>
                    <div className="relative">
                     <button onClick={() => setIsSelectStatusOpen(!isSelectStatusOpen)} className={`w-full p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}><div className="flex items-center gap-3"><currentStatusObj.icon size={18} className={currentStatusObj.color} /><span className="text-xs font-black uppercase">{currentStatusObj.label}</span></div><IoChevronDownOutline size={16} /></button>
                     {isSelectStatusOpen && (
                      <div className={`absolute bottom-full mb-2 w-full border rounded-2xl shadow-2xl z-[210] overflow-hidden ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-100'}`}>
                        {statusOptions.map((opt) => (
                          <button key={opt.id} onClick={() => { setNovoStatus(opt.id); setIsSelectStatusOpen(false); }} className={`w-full p-4 flex items-center gap-3 hover:bg-black/5 dark:hover:bg-white/5 border-b last:border-none ${isDarkMode ? 'border-white/5' : 'border-slate-50'} text-[11px] font-black uppercase`}><opt.icon size={18} className={opt.color} />{opt.label}</button>
                        ))}
                      </div>
                     )}
                    </div>
                    <button onClick={handleSalvarAcoes} className="w-full py-5 rounded-[2rem] bg-[#e6b32a] text-black font-black uppercase text-[11px] tracking-widest shadow-lg flex items-center justify-center gap-3"><IoSaveOutline size={20}/> Salvar</button>
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