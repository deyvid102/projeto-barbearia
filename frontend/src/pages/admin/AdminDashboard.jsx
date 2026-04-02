import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext.jsx';
import CustomAlert from '../../components/CustomAlert.jsx'; 
// import AdminLayout from '../../layout/AdminLayout.jsx';
import ScheduleGrid from '../../components/agenda/ScheduleGrid.jsx';
import DateSelector from "../../components/agenda/DateSelector";

import { 
  IoSaveOutline, IoCloseOutline, IoSyncOutline, 
  IoPersonOutline, IoCheckmarkCircleOutline, IoTimeOutline, 
  IoCloseCircleOutline, IoChevronDownOutline, IoOptionsOutline,
  IoCutOutline, IoCashOutline, IoCalendarOutline, IoStatsChartOutline, IoAddOutline, IoFileTrayFullOutline, IoPeopleOutline
} from 'react-icons/io5';
import { FaWhatsapp } from 'react-icons/fa';

export default function AdministradorDashboard() {
  const { id } = useParams(); 
  const { isDarkMode } = useTheme(); 
  const navigate = useNavigate();
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [configLimites, setConfigLimites] = useState({ abertura: "08:00", fechamento: "18:00" });
  const [loading, setLoading] = useState(true);
  
  const [isAcoesModalOpen, setIsAcoesModalOpen] = useState(false);
  const [isSelectOpen, setIsSelectOpen] = useState(false);
  const [selectedAg, setSelectedAg] = useState(null);
  const [novoPreco, setNovoPreco] = useState('');
  const [novoStatus, setNovoStatus] = useState('A');

  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'success' });
  const [currentTime, setCurrentTime] = useState(new Date());

  // Controle de seleção de barbeiro no mobile
  const [selectedProfessionalId, setSelectedProfessionalId] = useState('');
  const [isSelectProfMobileOpen, setIsSelectProfMobileOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const selectRef = useRef();
  const profSelectRef = useRef();

  const ALTURA_LINHA = 20; 
  const ALTURA_CABECALHO = 48;

  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0];

  const statusOptions = [
    { id: 'A', label: 'Agendado (Aberto)', icon: IoTimeOutline, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'F', label: 'Finalizado / Pago', icon: IoCheckmarkCircleOutline, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'C', label: 'Cancelado', icon: IoCloseCircleOutline, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  /**
   * BUSCA DE DADOS GLOBAL
   */
  const fetchGlobalData = useCallback(async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      
      const resBeb = await api.get('/barbearias');
      const barbearias = Array.isArray(resBeb.data) ? resBeb.data : (Array.isArray(resBeb) ? resBeb : []);
      
      const urlId = String(id).trim();
      let minhaBarbearia = barbearias.find(b => {
        const bId = String(b._id || b.id || "").trim();
        const aId = String(b.fk_admin?._id || b.fk_admin || "").trim();
        return bId === urlId || aId === urlId;
      });

      if (!minhaBarbearia && barbearias.length === 1) {
        minhaBarbearia = barbearias[0];
      }

      if (!minhaBarbearia) {
        console.warn("Barbearia não encontrada para o ID:", urlId);
        if (!isAutoRefresh) setLoading(false);
        return;
      }

      const barbeariaIdReal = String(minhaBarbearia._id || minhaBarbearia.id);
      
      // LOG 1: Identificação da Barbearia
      console.log("=== DEBUG BARBEARIA ===");
      console.log("ID da URL:", urlId);
      console.log("Barbearia Encontrada:", minhaBarbearia);
      console.log("ID Real Utilizado:", barbeariaIdReal);

      setConfigLimites({
        abertura: minhaBarbearia.abertura || "08:00",
        fechamento: minhaBarbearia.fechamento || "18:00"
      });

      const [resB, resA] = await Promise.all([
        api.get('/barbeiros').catch(() => ({ data: [] })),
        api.get(`/agendamentos/barbearia/${barbeariaIdReal}`).catch(() => api.get('/agendamentos')).catch(() => ({ data: [] }))
      ]);

      const todosBarbeiros = resB.data || resB || [];
      const todosAgs = resA.data || resA || [];

      // LOG 2: Dados Brutos do Backend
      console.log("=== DEBUG DADOS BRUTOS ===");
      console.log("Total Barbeiros Recebidos:", todosBarbeiros.length);
      console.log("Total Agendamentos Recebidos:", todosAgs.length);
      if (todosAgs.length > 0) console.log("Exemplo Agendamento (Bruto):", todosAgs[0]);

      // Filtros de segurança
      const barbeirosFiltrados = todosBarbeiros.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === barbeariaIdReal);
      const agendamentosFiltrados = todosAgs.filter(a => String(a.fk_barbearia?._id || a.fk_barbearia) === barbeariaIdReal);

      // LOG 3: Resultado após Filtro por fk_barbearia
      console.log("=== DEBUG FILTROS ===");
      console.log("Barbeiros da Unidade:", barbeirosFiltrados);
      console.log("Agendamentos da Unidade:", agendamentosFiltrados);

      setBarbeiros(barbeirosFiltrados);
      if (!selectedProfessionalId && barbeirosFiltrados.length > 0) {
        setSelectedProfessionalId(String(barbeirosFiltrados[0]._id));
      }
      setAgendamentos(agendamentosFiltrados);
      
      if (todosAgs.length > 0) {
        console.log("Estrutura para checagem de nome:", {
          fk_usuario_nome: todosAgs[0].fk_usuario?.nome,
          usuario_nome: todosAgs[0].usuario?.nome,
          cliente_nome: todosAgs[0].cliente?.nome
        });
      }
      
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  }, [id, selectedProfessionalId]);

  useEffect(() => {
    fetchGlobalData();
    const intervalData = setInterval(() => fetchGlobalData(true), 30000); 
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(intervalData); clearInterval(intervalTime); };
  }, [fetchGlobalData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) setIsSelectOpen(false);
      if (profSelectRef.current && !profSelectRef.current.contains(event.target)) setIsSelectProfMobileOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNomeExibicao = (ag) => {
    if (!ag) return "Cliente";
    return (
      ag.fk_usuario?.nome || 
      ag.usuario?.nome || 
      ag.cliente?.nome || 
      ag.nomeCliente || 
      ag.nome || 
      "Cliente"
    );
  };

  const handleWhatsApp = (ag) => {
    const telefone = 
      ag.fk_usuario?.numero || 
      ag.usuario?.numero || 
      ag.numero || 
      ag.telefone || 
      ag.telefoneCliente || 
      "";

    const foneLimpo = telefone.replace(/\D/g, '');
    if (foneLimpo) {
      window.open(`https://wa.me/55${foneLimpo}`, '_blank');
    } else {
      setAlertConfig({ show: true, titulo: 'Atenção', mensagem: 'Número não disponível.', tipo: 'error' });
    }
  };

  const getNomeBarbeiro = (ag) => {
    const barbeiroId = String(ag.fk_barbeiro?._id || ag.fk_barbeiro || "");
    const barbeiro = barbeiros.find(b => String(b._id) === barbeiroId);
    return barbeiro ? barbeiro.nome.split(' ')[0] : 'Barbeiro';
  };

  const openAcoes = (ag) => {
    setSelectedAg(ag);
    setNovoPreco(ag.valor || '');
    setNovoStatus(ag.status || 'A');
    setIsAcoesModalOpen(true);
  };

  const handleSalvarAcoes = async () => {
    if (!selectedAg) return;
    try {
      const payload = { status: novoStatus, valor: novoPreco };
      if (novoStatus === 'C') payload.canceladoPor = 'Administrador';
      else if (novoStatus === 'F') payload.finalizadoPor = 'Administrador';

      await api.put(`/agendamentos/${selectedAg._id}`, payload);
      setIsAcoesModalOpen(false);
      fetchGlobalData(true);
      setAlertConfig({ show: true, titulo: 'Sucesso', mensagem: 'Agendamento atualizado.', tipo: 'success' });
    } catch (error) {
      setAlertConfig({ show: true, titulo: 'Erro', mensagem: 'Falha ao atualizar.', tipo: 'error' });
    }
  };

  const getEscopoHorarios = () => {
    const escopo = [];
    const hInicio = parseInt(configLimites.abertura.split(':')[0]) || 8;
    const hFim = parseInt(configLimites.fechamento.split(':')[0]) || 18;
    for (let i = hInicio; i <= hFim; i++) {
      escopo.push(`${i < 10 ? '0' + i : i}:00`);
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

  //const agendamentosHoje = agendamentos.filter(a => a.datahora && a.datahora.startsWith(hojeStr));
  const agendamentosHoje = agendamentos;
  const stats = {
    total: agendamentosHoje.length,
    abertos: agendamentosHoje.filter(a => a.status === 'A').length,
    finalizados: agendamentosHoje.filter(a => a.status === 'F').length,
    cancelados: agendamentosHoje.filter(a => a.status === 'C').length
  };

  const agendamentosFiltrados = agendamentos.filter((ag) => {
    const dataAg = new Date(ag.datahora);
  
    return (
      dataAg.toDateString() === selectedDate.toDateString()
    );
  });

  const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
  const currentStatusObj = statusOptions.find(s => s.id === novoStatus) || statusOptions[0];

  const configLimitesNumerico = {
    inicio: parseInt(configLimites.abertura.split(':')[0]) || 8,
    fim: parseInt(configLimites.fechamento.split(':')[0]) || 18
  };

  const barbeirosExibidos = barbeiros.filter(b => {
    if (typeof window !== 'undefined' && window.innerWidth >= 768) return true;
    return String(b._id) === selectedProfessionalId;
  });

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

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
    // <AdminLayout>
    <>
      <div className="p-4 md:p-8 flex flex-col w-full">
        <header className="mb-6 md:mb-8 space-y-4 md:space-y-6">
          {/* <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4"> */}
            {/* <div>
              <h1 className="text-3xl font-black italic tracking-tighter">Painel <span className="text-[#e6b32a]">Administrativo</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <IoCalendarOutline className="text-[#e6b32a]" size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {diaSemana}, {dataFormatada}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 md:gap-3">
              <div className="flex flex-1 items-center gap-2 md:gap-3 md:border-r border-black/5 dark:border-white/5 md:pr-4">
                <div className="hidden md:block">
                    <NavButton icon={IoAddOutline} label="Novo Agendamento" variant="primary" onClick={() => setIsAvulsoModalOpen(true)} />
                </div> */}
                {/* <NavButton icon={IoCalendarOutline} label="Calendário" onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} /> */}
                {/* <NavButton icon={IoPeopleOutline} label="Gestão" onClick={() => navigate(`/admin/gestao/${id}`)} />
                <NavButton icon={IoStatsChartOutline} label="Estatísticas" onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} />
              </div>
            </div> */}
            
            {/* <div className={`flex items-center gap-4 px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <IoSyncOutline className="animate-spin text-[#e6b32a]" size={18} />
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase opacity-50 leading-none">Status do Sistema</p>
                  <p className="text-xs font-black">Sincronizado</p>
                </div>
            </div> */}
          {/* </div> */}

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {[
              { label: 'Atendimentos', value: stats.total, icon: IoStatsChartOutline, color: 'text-[#e6b32a]', bg: 'bg-[#e6b32a]/10' },
              { label: 'Agendados', value: stats.abertos, icon: IoTimeOutline, color: 'text-blue-500', bg: 'bg-blue-500/10' },
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

        {/* Seletor de barbeiro exclusivo para mobile */}
        <div className="md:hidden space-y-2 mb-4">
          <label className="text-[9px] font-black uppercase opacity-60 tracking-widest ml-1">
            Exibir profissional
          </label>
          <div className="relative" ref={profSelectRef}>
            <button
              onClick={() => setIsSelectProfMobileOpen(prev => !prev)}
              className={`w-full p-4 h-12 rounded-xl border flex items-center justify-between ${
                isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-200 shadow-sm'
              }`}
            >
              <div className="flex items-center gap-3">
                <IoPersonOutline size={18} className="text-[#e6b32a]" />
                <span className="text-[10px] font-black uppercase">
                  {barbeiros.find(b => String(b._id) === selectedProfessionalId)?.nome || 'Selecionar barbeiro'}
                </span>
              </div>
              <IoChevronDownOutline
                size={16}
                className={`transition-transform ${isSelectProfMobileOpen ? 'rotate-180' : ''}`}
              />
            </button>
            {isSelectProfMobileOpen && (
              <div
                className={`absolute top-full mt-2 w-full border rounded-xl shadow-2xl z-[130] overflow-hidden ${
                  isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-100'
                }`}
              >
                {barbeiros.map(b => (
                  <button
                    key={b._id}
                    onClick={() => {
                      setSelectedProfessionalId(String(b._id));
                      setIsSelectProfMobileOpen(false);
                    }}
                    className={`w-full p-4 flex items-center gap-3 hover:bg-[#e6b32a] hover:text-black transition-colors border-b last:border-none text-[10px] font-black uppercase ${
                      isDarkMode ? 'border-white/5' : 'border-slate-50'
                    }`}
                  >
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
          configLimites={configLimitesNumerico}
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
          getNomeBarbeiro={getNomeBarbeiro}
        />
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
                  <h3 className="text-xl font-black italic">detalhes.<span className="text-[#e6b32a]">registro</span></h3>
                </div>
                <button onClick={() => setIsAcoesModalOpen(false)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><IoCloseOutline size={28}/></button>
              </div>
              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border relative ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-wider">Cliente / Profissional</p>
                    <p className="text-sm font-black uppercase text-[#e6b32a] pr-10">{getNomeExibicao(selectedAg)}</p>
                    <p className="text-xs font-bold opacity-70 italic">Atendido por: {getNomeBarbeiro(selectedAg)}</p>
                    
                    <button 
                      onClick={() => handleWhatsApp(selectedAg)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all"
                    >
                      <FaWhatsapp size={20} />
                    </button>

                    <div className="mt-3 pt-3 border-t border-white/10 flex items-center gap-2">
                        <IoCutOutline size={14} className="text-[#e6b32a]" />
                        <p className="text-xs font-black uppercase">{selectedAg.tipoCorte || 'Corte/Serviço'}</p>
                    </div>
                </div>

                <div className={`p-5 rounded-[2rem] border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-[#e6b32a]/50' : 'bg-slate-50 border-slate-200 focus-within:border-black/30'}`}>
                  <label className="text-[9px] font-black uppercase text-[#e6b32a] mb-2 block tracking-widest ml-1">valor do serviço</label>
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
    </>
    // </AdminLayout>
  );
}