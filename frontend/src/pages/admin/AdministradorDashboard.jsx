import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert'; 
import AdminLayout from '../../layout/layout';

import { 
  IoSaveOutline, IoCloseOutline, IoSyncOutline, 
  IoPersonOutline, IoCheckmarkCircleOutline, IoTimeOutline, 
  IoCloseCircleOutline, IoChevronDownOutline, IoOptionsOutline,
  IoCutOutline, IoCashOutline, IoCalendarOutline, IoStatsChartOutline
} from 'react-icons/io5';
import { FaWhatsapp } from 'react-icons/fa';

export default function AdministradorDashboard() {
  const { id } = useParams(); 
  const { isDarkMode } = useTheme(); 
  
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
  
  const selectRef = useRef();

  const ALTURA_LINHA = 20; 
  const ALTURA_CABECALHO = 48;

  const hoje = new Date();
  const hojeStr = hoje.toISOString().split('T')[0];

  const statusOptions = [
    { id: 'A', label: 'Agendado (Aberto)', icon: IoTimeOutline, color: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/20' },
    { id: 'F', label: 'Finalizado / Pago', icon: IoCheckmarkCircleOutline, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
    { id: 'C', label: 'Cancelado', icon: IoCloseCircleOutline, color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/20' },
  ];

  const fetchGlobalData = useCallback(async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      
      const resBeb = await api.get('/barbearias');
      const barbearias = Array.isArray(resBeb.data) ? resBeb.data : (Array.isArray(resBeb) ? resBeb : []);
      
      let minhaBarbearia = barbearias.find(b => {
        const bId = String(b._id || b.id).trim();
        const aId = String(b.fk_admin?._id || b.fk_admin || "").trim();
        const urlId = String(id).trim();
        return bId === urlId || aId === urlId;
      });

      if (!minhaBarbearia && barbearias.length === 1) {
        minhaBarbearia = barbearias[0];
      }

      if (!minhaBarbearia) {
        setLoading(false);
        return;
      }

      const barbeariaIdReal = String(minhaBarbearia._id || minhaBarbearia.id);

      setConfigLimites({
        abertura: minhaBarbearia.abertura || "08:00",
        fechamento: minhaBarbearia.fechamento || "18:00"
      });

      // Removida a rota de clientes - Busca apenas Barbeiros e Agendamentos
      const [resB, resA] = await Promise.all([
        api.get('/barbeiros').catch(() => ({ data: [] })),
        api.get(`/agendamentos/barbearia/${barbeariaIdReal}`).catch(() => api.get('/agendamentos')).catch(() => ({ data: [] }))
      ]);

      const todosBarbeiros = resB.data || resB || [];
      const todosAgs = resA.data || resA || [];

      setBarbeiros(todosBarbeiros.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === barbeariaIdReal));
      setAgendamentos(todosAgs.filter(a => String(a.fk_barbearia?._id || a.fk_barbearia) === barbeariaIdReal));
      
    } catch (error) {
      console.error("Erro ao carregar dashboard:", error);
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchGlobalData();
    const intervalData = setInterval(() => fetchGlobalData(true), 30000); 
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => { clearInterval(intervalData); clearInterval(intervalTime); };
  }, [fetchGlobalData]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (selectRef.current && !selectRef.current.contains(event.target)) setIsSelectOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Busca o nome diretamente dos campos do agendamento
  const getNomeExibicao = (ag) => {
    return ag.nome || ag.nomeCliente || "Cliente";
  };

  const handleWhatsApp = (ag) => {
    // Busca o número diretamente dos campos do agendamento
    const telefone = ag.numero || ag.telefone || ag.telefoneCliente || "";
    const foneLimpo = telefone.replace(/\D/g, '');
    if (foneLimpo) {
      window.open(`https://wa.me/55${foneLimpo}`, '_blank');
    } else {
      setAlertConfig({ show: true, titulo: 'Atenção', mensagem: 'Número não disponível neste agendamento.', tipo: 'error' });
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
    const hInicio = parseInt(configLimites.abertura.split(':')[0]);
    const hFim = parseInt(configLimites.fechamento.split(':')[0]);
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

  const agendamentosHoje = agendamentos.filter(a => a.datahora && a.datahora.startsWith(hojeStr));
  
  const stats = {
    total: agendamentosHoje.length,
    abertos: agendamentosHoje.filter(a => a.status === 'A').length,
    finalizados: agendamentosHoje.filter(a => a.status === 'F').length,
    cancelados: agendamentosHoje.filter(a => a.status === 'C').length
  };

  const dataFormatada = hoje.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const diaSemana = hoje.toLocaleDateString('pt-BR', { weekday: 'long' });
  const currentStatusObj = statusOptions.find(s => s.id === novoStatus) || statusOptions[0];

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 flex flex-col min-h-screen">
        <header className="mb-8 space-y-6">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-black italic lowercase tracking-tighter">admin.<span className="text-[#e6b32a]">escala</span></h1>
              <div className="flex items-center gap-2 mt-1">
                <IoCalendarOutline className="text-[#e6b32a]" size={14} />
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">
                    {diaSemana}, {dataFormatada}
                </p>
              </div>
            </div>
            
            <div className={`flex items-center gap-4 px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>
                <IoSyncOutline className="animate-spin text-[#e6b32a]" size={18} />
                <div className="text-right">
                  <p className="text-[10px] font-black uppercase opacity-50 leading-none">Status do Sistema</p>
                  <p className="text-xs font-black">Sincronizado</p>
                </div>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
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

        <div className={`relative flex-1 rounded-[2rem] border overflow-hidden mb-10 ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
          <div className="overflow-x-auto min-h-fit custom-scrollbar">
            <table className="w-full border-collapse min-w-[1200px] table-fixed">
              <thead>
                <tr style={{ height: `${ALTURA_CABECALHO}px` }}>
                  <th className={`sticky left-0 z-40 w-20 p-2 border-b border-r text-[9px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>Hora</th>
                  {barbeiros.map(b => (
                    <th key={b._id} className={`p-2 border-b border-r text-[10px] font-black uppercase tracking-wider ${isDarkMode ? 'border-white/5 text-white/80' : 'border-slate-100 text-slate-700'}`}>
                      {b.nome.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getEscopoHorarios().map(hora => {
                  const hInt = parseInt(hora.split(':')[0]);
                  const posLinha = getTimelinePositionPercentage(hora);

                  return (
                    <tr key={hora} className="relative group/row" style={{ height: `${ALTURA_LINHA}px` }}>
                      <td className={`sticky left-0 z-20 p-2 border-b border-r text-center font-mono text-[10px] font-black transition-colors ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-500 group-hover/row:text-[#e6b32a]' : 'bg-slate-50 border-slate-100 text-slate-400 group-hover/row:text-black'}`}>
                        {hora}
                        {posLinha !== null && (
                          <div className="absolute left-0 w-[2000px] z-50 pointer-events-auto flex items-center group/line" style={{ top: `${posLinha}%`, transition: 'top 1s linear' }}>
                            <div className="w-full h-[1.5px] bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]"></div>
                          </div>
                        )}
                      </td>
                      {barbeiros.map(b => {
                        const ags = agendamentosHoje.filter(a => {
                          const hAg = new Date(a.datahora).getHours();
                          const barbeiroId = String(a.fk_barbeiro?._id || a.fk_barbeiro || "").trim();
                          return barbeiroId === String(b._id).trim() && hAg === hInt;
                        });

                        return (
                          <td key={b._id} className={`p-1 border-b border-r align-top relative ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className={`grid gap-1 h-full ${ags.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {ags.map(ag => (
                                <button 
                                  key={ag._id} 
                                  onClick={() => openAcoes(ag)}
                                  className={`group w-full p-1.5 rounded-lg text-left border shadow-sm transition-all h-fit hover:scale-[1.02] active:scale-95 relative z-10
                                    ${ag.status === 'F' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                    : ag.status === 'C' ? 'bg-red-500/10 border-red-500/20 text-red-500' 
                                    : 'bg-[#e6b32a] text-black border-[#e6b32a]'}`}
                                >
                                  <div className="flex flex-col">
                                    <div className="flex justify-between items-start">
                                      <p className="text-[8px] font-black uppercase truncate max-w-[70%]">{getNomeExibicao(ag)}</p>
                                      <span className="text-[7px] font-black opacity-70">
                                        {new Date(ag.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                      </span>
                                    </div>
                                    <div className="mt-1 border-t border-black/5 pt-1">
                                      <div className="flex justify-between items-end">
                                        <div className="space-y-0.5">
                                          <div className="flex items-center gap-1 opacity-80">
                                            <IoCutOutline size={8}/>
                                            <p className="text-[7px] font-bold uppercase truncate">{ag.tipoCorte || 'Serviço'}</p>
                                          </div>
                                          <div className="flex items-center gap-1">
                                            <IoCashOutline size={8}/>
                                            <p className="text-[8px] font-black">R$ {ag.valor || '0,00'}</p>
                                          </div>
                                        </div>
                                        <div className="flex items-center gap-1 text-right">
                                            <p className="text-[9px] font-black uppercase truncate text-black/60 dark:text-black/80">
                                              {getNomeBarbeiro(ag)}
                                            </p>
                                            <IoPersonOutline size={9} className="opacity-50"/>
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
    </AdminLayout>
  );
}