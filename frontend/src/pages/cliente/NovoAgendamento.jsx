import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert.jsx';

import { 
  IoPricetagOutline, 
  IoTimeOutline, 
  IoPersonOutline, 
  IoCalendarOutline, 
  IoChevronForward, 
  IoChevronBack,
  IoCalendarNumberOutline,
  IoArrowBackOutline,
  IoCheckmarkCircle
} from 'react-icons/io5';

export default function NovoAgendamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [step, setStep] = useState(1);
  const [barbeiros, setBarbeiros] = useState([]);
  const [tiposCorte, setTiposCorte] = useState([]);
  const [agendaMensal, setAgendaMensal] = useState(null);
  const [todosAgendamentos, setTodosAgendamentos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  
  const [form, setForm] = useState({ 
    tipoCorte: '', 
    fk_barbeiro: '', 
    fk_barbeiroNome: '',
    fk_barbearia: '', 
    data: new Date().toLocaleDateString('en-CA'), 
    hora: '', 
    valor: 0 
  });

  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (form.fk_barbearia && form.data) {
      buscarEscalaDoDia();
    }
  }, [form.data, form.fk_barbearia]);

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      const resB = await api.get('/barbeiros');
      const lista = resB.data || resB;
      
      if (lista.length > 0) {
        const bId = lista[0].fk_barbearia?._id || lista[0].fk_barbearia;
        setForm(prev => ({ ...prev, fk_barbearia: bId }));

        const [resBarbearia, resAgendamentos] = await Promise.all([
          api.get(`/barbearias/${bId}`),
          api.get(`/agendamentos`)
        ]);

        const dadosB = resBarbearia.data || resBarbearia;
        setTiposCorte(dadosB.servicos || []);
        if (dadosB.agenda_detalhada) setAgendaMensal(dadosB.agenda_detalhada);
        
        const ags = resAgendamentos.data || resAgendamentos;
        setTodosAgendamentos(Array.isArray(ags) ? ags.filter(a => a.status === 'A') : []);
      }
    } catch (err) {
      console.error("erro ao carregar dados iniciais");
    } finally {
      setLoading(false);
    }
  };

  const buscarEscalaDoDia = async () => {
    try {
      const [anoStr, mesStr, diaStr] = form.data.split('-').map(Number);
      const mes = mesStr - 1; 

      const res = await api.get(`/barbearias/${form.fk_barbearia}`);
      const dados = res.data || res;
      const agenda = dados.agenda_detalhada;

      if (agenda && agenda.mes === mes && agenda.ano === anoStr) {
        setAgendaMensal(agenda);
        const configDia = agenda.grade.find(g => g.dia === diaStr);

        if (configDia && configDia.ativo) {
          const idsEscalados = configDia.escalas.map(e => (e.barbeiroId?._id || e.barbeiroId).toString());
          const resTodos = await api.get('/barbeiros');
          const todosBarbeiros = resTodos.data || resTodos;
          
          const disponiveis = todosBarbeiros.filter(b => 
            idsEscalados.includes(b._id.toString()) && 
            (b.fk_barbearia?._id || b.fk_barbearia) === form.fk_barbearia
          );
          setBarbeiros(disponiveis);
        } else {
          setBarbeiros([]);
        }
      }
    } catch (error) {
      console.error("erro ao buscar escala");
    }
  };

  const temHorarioDisponivelNoDia = (dataRef) => {
    if (!agendaMensal) return false;
    const dia = dataRef.getDate();
    const configDia = agendaMensal.grade.find(g => g.dia === dia);
    
    if (!configDia || !configDia.ativo) return false;

    const dataStr = dataRef.toLocaleDateString('en-CA');
    const agora = new Date();
    const hojeStr = agora.toLocaleDateString('en-CA');

    let [h, m] = configDia.abertura.split(':').map(Number);
    const [hFim, mFim] = configDia.fechamento.split(':').map(Number);
    const totalMinutosFim = hFim * 60 + mFim;

    while ((h * 60 + m) + 40 <= totalMinutosFim) {
      const horaFormatada = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      
      let horarioPassou = false;
      if (dataStr === hojeStr) {
        const slot = new Date();
        slot.setHours(h, m, 0, 0);
        if (slot <= agora) horarioPassou = true;
      }

      if (!horarioPassou) {
        const existeVaga = configDia.escalas.some(escala => {
          const bId = (escala.barbeiroId?._id || escala.barbeiroId).toString();
          const ocupado = todosAgendamentos.some(a => 
            a.fk_barbeiro?._id?.toString() === bId && 
            a.datahora.startsWith(`${dataStr}T${horaFormatada}:00`)
          );
          return !ocupado;
        });

        if (existeVaga) return true;
      }

      m += 40;
      if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    }

    return false;
  };

  const gerarHorarios40Min = () => {
    if (!agendaMensal || !form.data || !form.fk_barbeiro) return [];
    const [ano, mes, dia] = form.data.split('-').map(Number);
    const configDia = agendaMensal.grade.find(g => g.dia === dia);
    if (!configDia) return [];

    const escalaBarbeiro = configDia.escalas.find(e => (e.barbeiroId?._id || e.barbeiroId).toString() === form.fk_barbeiro.toString());
    const inicio = escalaBarbeiro ? escalaBarbeiro.entrada : configDia.abertura;
    const fim = escalaBarbeiro ? escalaBarbeiro.saida : configDia.fechamento;

    const horarios = [];
    let [h, m] = inicio.split(':').map(Number);
    const [hFim, mFim] = fim.split(':').map(Number);
    const totalMinutosFim = hFim * 60 + mFim;

    const agora = new Date();
    const hojeStr = agora.toLocaleDateString('en-CA');

    while ((h * 60 + m) + 40 <= totalMinutosFim) {
      const horaFormatada = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      let podeAdicionar = true;
      if (form.data === hojeStr) {
        const slot = new Date();
        slot.setHours(h, m, 0, 0);
        if (slot <= agora) podeAdicionar = false;
      }
      if (podeAdicionar) horarios.push(horaFormatada);
      m += 40;
      if (m >= 60) { h += Math.floor(m / 60); m = m % 60; }
    }
    return horarios;
  };

  const mudarMes = (direcao) => {
    const novoMes = new Date(currentMonth);
    novoMes.setMonth(currentMonth.getMonth() + direcao);
    setCurrentMonth(novoMes);
  };

  const getDiasNoMes = (mes, ano) => {
    const data = new Date(ano, mes, 1);
    const dias = [];
    while (data.getMonth() === mes) {
      dias.push(new Date(data));
      data.setDate(data.getDate() + 1);
    }
    return dias;
  };

  const formatarDataResumo = (dataStr) => {
    if (!dataStr) return '—';
    const [ano, mes, dia] = dataStr.split('-');
    return `${dia}/${mes}/${ano}`;
  };

  const handleFinalizar = async () => {
    try {
      const payload = { 
        tipoCorte: form.tipoCorte,
        fk_barbeiro: form.fk_barbeiro,
        fk_barbearia: form.fk_barbearia,
        datahora: `${form.data}T${form.hora}:00`,
        fk_cliente: id, 
        valor: Number(form.valor),
        status: 'A'
      };
      await api.post('/agendamentos', payload);
      navigate(`/cliente/${id}`);
    } catch (err) { console.error("erro ao salvar agendamento."); }
  };

  const btnConfig = getButtonConfig();
  function getButtonConfig() {
    if (step === 1) return { label: "escolher data", disabled: !form.tipoCorte, action: () => setStep(2) };
    if (step === 2) return { label: "escolher barbeiro", disabled: !form.data, action: () => setStep(3) };
    if (step === 3) return { label: "ver horários", disabled: !form.fk_barbeiro, action: () => setStep(4) };
    return { label: "confirmar reserva", disabled: !form.hora, action: handleFinalizar };
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#070707] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 pb-32 md:pb-8 font-sans`}>
      <div className="max-w-6xl mx-auto">
        
        <header className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${
                isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-slate-200 text-slate-600'
              }`}
            >
              <IoArrowBackOutline size={22} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter leading-none">novo.agendamento</h1>
              <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[3px] mt-1">etapa {step} de 4</p>
            </div>
          </div>
          
          <div className="flex gap-2 w-full md:w-64">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#e6b32a]' : isDarkMode ? 'bg-white/5' : 'bg-black/5'}`} />
            ))}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          <main className={`lg:col-span-8 p-6 md:p-10 rounded-[2.5rem] border shadow-2xl min-h-[500px] transition-colors ${
            isDarkMode ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-100'
          }`}>
            
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-[#e6b32a]">
                  <IoPricetagOutline size={24} />
                  <h2 className="text-lg font-black uppercase tracking-widest">o que vamos fazer?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiposCorte.map((t, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setForm({...form, tipoCorte: t.nome, valor: t.valor})} 
                      className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex justify-between items-center group ${
                        form.tipoCorte === t.nome 
                          ? 'border-[#e6b32a] bg-[#e6b32a]/5' 
                          : isDarkMode ? 'border-white/5 bg-black/40 hover:border-white/20' : 'border-slate-100 bg-slate-50 hover:border-slate-300'
                      }`}
                    >
                      <p className={`text-xl font-black lowercase ${form.tipoCorte === t.nome ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-gray-400'}`}>{t.nome}</p>
                      <div className={`px-4 py-2 rounded-xl font-mono font-black ${
                        form.tipoCorte === t.nome ? 'bg-[#e6b32a] text-black scale-110' : 'text-[#e6b32a] bg-[#e6b32a]/10'
                      }`}>R${t.valor.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3 text-[#e6b32a]">
                    <IoCalendarOutline size={24} />
                    <h2 className="text-lg font-black uppercase tracking-widest">para quando?</h2>
                  </div>
                  <button onClick={() => setShowFullCalendar(!showFullCalendar)} className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-[#e6b32a] text-black font-black uppercase text-[10px] tracking-widest active:scale-95 transition-all">
                    <IoCalendarNumberOutline size={18} /> {showFullCalendar ? 'voltar' : 'calendário'}
                  </button>
                </div>
                
                {showFullCalendar ? (
                  <div className={`p-4 md:p-8 rounded-[2rem] border ${isDarkMode ? 'bg-black/20 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-8">
                      <button onClick={() => mudarMes(-1)} className="p-3 hover:text-[#e6b32a]"><IoChevronBack size={24}/></button>
                      <span className="font-black text-sm md:text-base uppercase tracking-widest">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                      <button onClick={() => mudarMes(1)} className="p-3 hover:text-[#e6b32a]"><IoChevronForward size={24}/></button>
                    </div>
                    <div className="grid grid-cols-7 gap-2 md:gap-4">
                      {['dom','seg','ter','qua','qui','sex','sab'].map(d => <span key={d} className="text-center text-[8px] font-black uppercase text-gray-600 mb-2">{d}</span>)}
                      {getDiasNoMes(currentMonth.getMonth(), currentMonth.getFullYear()).map((dia, i) => {
                        const dStr = dia.toLocaleDateString('en-CA');
                        const hojeStr = new Date().toLocaleDateString('en-CA');
                        const isPast = dStr < hojeStr;
                        const semVaga = !temHorarioDisponivelNoDia(dia);

                        return (
                          <button 
                            key={i} 
                            disabled={isPast || semVaga} 
                            onClick={() => { setForm({...form, data: dStr, fk_barbeiro: '', hora: ''}); setShowFullCalendar(false); }} 
                            className={`aspect-square rounded-2xl text-xs font-black transition-all relative ${
                              form.data === dStr 
                                ? 'bg-[#e6b32a] text-black scale-110 shadow-lg shadow-[#e6b32a]/20' 
                                : (isPast || semVaga) 
                                  ? 'opacity-10 cursor-not-allowed grayscale' 
                                  : isDarkMode ? 'bg-white/5 hover:bg-white/10' : 'bg-white border border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {dia.getDate()}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {[...Array(14)].map((_, i) => {
                      const d = new Date(); d.setDate(d.getDate() + i);
                      const dStr = d.toLocaleDateString('en-CA');
                      if (!temHorarioDisponivelNoDia(d)) return null;

                      return (
                        <button 
                          key={dStr} 
                          onClick={() => setForm({...form, data: dStr, fk_barbeiro: '', hora: ''})} 
                          className={`p-6 rounded-[2rem] border-2 flex flex-col items-center gap-1 transition-all ${
                            form.data === dStr ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 
                            isDarkMode ? 'border-white/5 bg-black/40 hover:border-white/10' : 'border-slate-100 bg-slate-50 hover:border-slate-200'
                          }`}
                        >
                          <span className="text-[10px] uppercase font-black text-gray-500">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                          <span className="text-xl font-black">{d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-[#e6b32a]">
                  <IoPersonOutline size={24} />
                  <h2 className="text-lg font-black uppercase tracking-widest">com quem?</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {barbeiros.length > 0 ? barbeiros.map(b => (
                    <div key={b._id} onClick={() => setForm({...form, fk_barbeiro: b._id.toString(), fk_barbeiroNome: b.nome, hora: ''})} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex justify-between items-center ${form.fk_barbeiro === b._id.toString() ? 'border-[#e6b32a] bg-[#e6b32a]/10' : isDarkMode ? 'border-white/5 bg-black/40 hover:border-white/10' : 'border-slate-100 bg-slate-50 hover:border-slate-200'}`}>
                      <span className={`text-xl font-black lowercase ${form.fk_barbeiro === b._id.toString() ? 'text-[#e6b32a]' : (isDarkMode ? 'text-white' : 'text-slate-900')}`}>{b.nome}</span>
                      {form.fk_barbeiro === b._id.toString() && <IoCheckmarkCircle size={24} className="text-[#e6b32a]" />}
                    </div>
                  )) : (
                    <div className="col-span-full text-center py-16 opacity-50 flex flex-col items-center gap-4 text-[10px] font-black uppercase italic tracking-widest">
                       Nenhum profissional disponível para esta data.
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-[#e6b32a]">
                  <IoTimeOutline size={24} />
                  <h2 className="text-lg font-black uppercase tracking-widest">horários disponíveis</h2>
                </div>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scroll">
                  {loadingHorarios ? (
                    <div className="col-span-full text-center py-20 animate-pulse text-[10px] font-black italic tracking-widest">checando disponibilidade...</div>
                  ) : (
                    gerarHorarios40Min().length > 0 ? gerarHorarios40Min().map(h => {
                      const ocupado = todosAgendamentos.some(a => 
                        a.fk_barbeiro?._id?.toString() === form.fk_barbeiro && 
                        a.datahora.startsWith(`${form.data}T${h}:00`)
                      );
                      return (
                        <button key={h} disabled={ocupado} onClick={() => setForm({...form, hora: h})} className={`p-4 rounded-2xl border-2 text-sm font-black transition-all ${form.hora === h ? 'border-[#e6b32a] bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : ocupado ? 'opacity-10 border-transparent bg-transparent pointer-events-none' : isDarkMode ? 'border-white/5 bg-black hover:border-[#e6b32a]/40 text-gray-400' : 'border-slate-100 bg-white hover:border-slate-300 text-slate-600'}`}>{h}</button>
                      );
                    }) : (
                        <div className="col-span-full text-center py-16 opacity-50 text-[10px] font-black uppercase">Agenda lotada para este profissional.</div>
                    )
                  )}
                </div>
              </div>
            )}
          </main>

          <aside className="hidden lg:block lg:col-span-4 sticky top-8">
            <div className={`p-8 rounded-[2.5rem] border shadow-2xl space-y-8 ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
              <h3 className="text-xs font-black uppercase tracking-[4px] text-[#e6b32a]">resumo</h3>
              <div className="space-y-6">
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-gray-500">serviço</span><span className="font-bold lowercase">{form.tipoCorte || '—'}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-gray-500">data</span><span className="font-bold">{formatarDataResumo(form.data)}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-gray-500">barbeiro</span><span className="font-bold lowercase">{form.fk_barbeiroNome || '—'}</span></div>
                <div className="flex justify-between items-center"><span className="text-[10px] font-black uppercase text-gray-500">horário</span><span className="font-black text-[#e6b32a] text-xl">{form.hora || '--:--'}</span></div>
              </div>
              <div className={`pt-6 border-t ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                <div className="flex justify-between items-end"><span className="text-[10px] font-black uppercase text-gray-500">total</span><span className="text-3xl font-black font-mono">r$ {form.valor.toFixed(2).replace('.', ',')}</span></div>
              </div>

              <button 
                disabled={btnConfig.disabled} 
                onClick={btnConfig.action}
                className={`w-full py-5 rounded-2xl font-black uppercase text-xs tracking-widest transition-all ${
                  btnConfig.disabled 
                    ? 'bg-gray-200 dark:bg-white/5 text-gray-400 cursor-not-allowed' 
                    : 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20 hover:scale-[1.02] active:scale-95'
                }`}
              >
                {btnConfig.label}
              </button>
            </div>
          </aside>
        </div>
      </div>

      <div className="lg:hidden fixed bottom-8 left-0 right-0 px-6 z-50">
        <button 
          disabled={btnConfig.disabled} 
          onClick={btnConfig.action} 
          className={`w-full py-5 font-black uppercase text-[11px] tracking-widest rounded-3xl shadow-2xl transition-all duration-300 ${
            btnConfig.disabled
              ? 'bg-gray-200 dark:bg-[#181818] text-gray-400 dark:text-gray-700' 
              : 'bg-[#e6b32a] text-black active:scale-95'
          }`}
        >
          {btnConfig.label === "confirmar reserva" ? "finalizar reserva" : btnConfig.label}
        </button>
      </div>
    </div>
  );
}