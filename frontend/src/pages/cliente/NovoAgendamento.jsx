import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert';

import { 
  IoPricetagOutline, 
  IoTimeOutline, 
  IoPersonOutline, 
  IoCalendarOutline, 
  IoChevronForward, 
  IoChevronBack,
  IoArrowBackOutline,
  IoCheckmarkCircle,
  IoCheckmarkDoneOutline, // Novo ícone para o sucesso
  IoCalendarClearOutline
} from 'react-icons/io5';

export default function NovoAgendamento() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [step, setStep] = useState(1);
  const [barbeiros, setBarbeiros] = useState([]);
  const [listaCompletaProfissionais, setListaCompletaProfissionais] = useState([]); 
  const [tiposCorte, setTiposCorte] = useState([]);
  const [gradeMensal, setGradeMensal] = useState([]); 
  const [todosAgendamentos, setTodosAgendamentos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showSuccessScreen, setShowSuccessScreen] = useState(false); // ESTADO PARA TELA DE SUCESSO
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', type: 'error' });
  
  const [form, setForm] = useState({ 
    tipoCorte: '', 
    fk_barbeiro: '', 
    fk_barbeiroNome: '',
    fk_barbearia: '', 
    data: '', 
    hora: '', 
    valor: 0,
    tempo: 0 
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    carregarDadosIniciais();
  }, [currentMonth]);

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      const resB = await api.get('/barbeiros');
      const profissionais = resB.data || resB;
      setListaCompletaProfissionais(Array.isArray(profissionais) ? profissionais : []);
      
      if (profissionais.length > 0) {
        const bId = (profissionais[0].fk_barbearia?._id || profissionais[0].fk_barbearia);
        const [resBarbearia, resAgendamentos, resAgendas] = await Promise.all([
          api.get(`/barbearias/${bId}`),
          api.get(`/agendamentos`),
          api.get(`/agendas`) 
        ]);

        const dadosB = resBarbearia.data || resBarbearia;
        setTiposCorte(dadosB.servicos || []);
        
        const agendasDB = resAgendas.data || resAgendas;
        setGradeMensal(Array.isArray(agendasDB) ? agendasDB : []);
        
        setForm(prev => ({ ...prev, fk_barbearia: bId }));
        const ags = resAgendamentos.data || resAgendamentos;
        setTodosAgendamentos(Array.isArray(ags) ? ags.filter(a => a.status === 'A') : []);
      }
    } catch (err) {
      console.error("Erro ao carregar:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (form.data) {
      const escalasDoDia = gradeMensal.filter(item => item.data?.startsWith(form.data));

      const profissionaisNoDia = escalasDoDia.map(esc => {
        const idB = (esc.fk_barbeiro?._id || esc.fk_barbeiro).toString();
        const dadosProf = listaCompletaProfissionais.find(p => p._id.toString() === idB);
        return {
          _id: idB,
          nome: dadosProf?.nome || esc.fk_barbeiro?.nome || "Profissional",
          entrada: esc.abertura,
          saida: esc.fechamento,
          intervalo_inicio: esc.intervalo_inicio,
          intervalo_fim: esc.intervalo_fim
        };
      }).filter(p => p._id);
      
      setBarbeiros(profissionaisNoDia);
    }
  }, [form.data, gradeMensal, listaCompletaProfissionais]);

  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const parts = timeStr.split(':');
    if (parts.length < 2) return null;
    const [h, m] = parts.map(Number);
    return h * 60 + m;
  };

  const getIniciais = (nome) => {
    if (!nome || typeof nome !== 'string') return "??";
    return nome.trim().substring(0, 2).toUpperCase();
  };

  const getCorBarbeiro = (id) => {
    const cores = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600', 'bg-rose-600', 'bg-cyan-600'];
    const index = id ? id.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0) % cores.length : 0;
    return cores[index];
  };

  const gerarHorariosDisponiveis = () => {
    if (!form.data || !form.fk_barbeiro || !form.tempo) return [];
    
    const escalaDoc = gradeMensal.find(g => {
        const idB = (g.fk_barbeiro?._id || g.fk_barbeiro).toString();
        return g.data?.startsWith(form.data) && idB === form.fk_barbeiro;
    });

    if (!escalaDoc) return [];

    const inicioTurno = timeToMinutes(escalaDoc.abertura);
    const fimTurno = timeToMinutes(escalaDoc.fechamento);
    const intIni = timeToMinutes(escalaDoc.intervalo_inicio);
    const intFim = timeToMinutes(escalaDoc.intervalo_fim);
    const duracaoServico = form.tempo;

    if (inicioTurno === null || fimTurno === null) return [];

    const agendamentosDoDia = todosAgendamentos.filter(a => 
      (a.fk_barbeiro?._id || a.fk_barbeiro).toString() === form.fk_barbeiro && a.datahora.startsWith(form.data)
    ).map(a => {
      const horaStr = a.datahora.split('T')[1].substring(0, 5);
      const inicio = timeToMinutes(horaStr);
      return { inicio, fim: inicio + (a.tempo_estimado || 30) };
    });

    const slots = [];
    const agora = new Date();
    const hojeStr = agora.toLocaleDateString('en-CA');
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    for (let current = inicioTurno; current + duracaoServico <= fimTurno; current += 15) {
      const slotFim = current + duracaoServico;

      if (form.data === hojeStr && current <= minutosAgora + 15) continue;

      if (intIni !== null && intFim !== null) {
        if (current < intFim && slotFim > intIni) continue;
      }

      const colideAgendamento = agendamentosDoDia.some(ag => current < ag.fim && slotFim > ag.inicio);
      if (colideAgendamento) continue;

      const h = Math.floor(current / 60).toString().padStart(2, '0');
      const m = (current % 60).toString().padStart(2, '0');
      slots.push(`${h}:${m}`);
    }
    return slots;
  };

  const getStatusDia = (diaDate) => {
    if (!gradeMensal.length) return 'I';
    const dStr = diaDate.toLocaleDateString('en-CA');
    return gradeMensal.some(g => g.data?.startsWith(dStr)) ? 'A' : 'I';
  };

  const mudarMes = (dir) => {
    const n = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + dir, 1);
    setCurrentMonth(n);
    setForm(f => ({ ...f, data: '', fk_barbeiro: '', fk_barbeiroNome: '', hora: '' }));
  };

  const getDiasCalendario = () => {
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();
    const dias = [];
    for (let i = 0; i < primeiroDiaSemana; i++) dias.push(null);
    for (let i = 1; i <= ultimoDiaMes; i++) dias.push(new Date(ano, mes, i));
    return dias;
  };

  const handleFinalizar = async () => {
    try {
      setLoading(true);
      const dataInicio = new Date(`${form.data}T${form.hora}:00`);
      const dataFim = new Date(dataInicio.getTime() + (form.tempo * 60000));

      const payload = {
        tipoCorte: form.tipoCorte,
        fk_barbeiro: form.fk_barbeiro,
        fk_barbearia: form.fk_barbearia,
        datahora: dataInicio.toISOString(),
        datahora_fim: dataFim.toISOString(),
        fk_cliente: id, 
        valor: Number(form.valor),
        tempo_estimado: Number(form.tempo),
        status: 'A'
      };

      const response = await api.post('/agendamentos', payload);
      if (response.status === 201 || response.status === 200) {
        // EM VEZ DE DAR NAVIGATE DIRETO, MOSTRA A TELA DE SUCESSO
        setShowSuccessScreen(true);
      }
    } catch (err) {
      const backendMsg = err.response?.data?.message || err.response?.data?.error || 'Erro interno no servidor.';
      setAlertConfig({ show: true, title: 'Erro', message: backendMsg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const stepConfig = {
    1: { label: "Próximo: Data", disabled: !form.tipoCorte, action: () => setStep(2) },
    2: { label: "Próximo: Profissional", disabled: !form.data, action: () => setStep(3) },
    3: { label: "Próximo: Horário", disabled: !form.fk_barbeiro, action: () => setStep(4) },
    4: { label: "Finalizar Reserva", disabled: !form.hora, action: handleFinalizar }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#070707] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 pb-32`}>
      
      {/* TELA DE SUCESSO (OVERLAY) */}
      {showSuccessScreen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl animate-in fade-in duration-500">
          <div className={`max-w-md w-full p-10 rounded-[3rem] border text-center space-y-6 shadow-2xl ${isDarkMode ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-slate-100'}`}>
            <div className="relative mx-auto w-24 h-24 bg-[#e6b32a]/10 rounded-full flex items-center justify-center text-[#e6b32a] animate-bounce">
                <IoCheckmarkDoneOutline size={50} />
            </div>
            
            <div className="space-y-2">
              <h2 className="text-2xl font-black italic lowercase tracking-tighter">reserva.<span className="text-[#e6b32a]">confirmada</span></h2>
              <p className="text-sm opacity-60 font-medium">Seu horário foi agendado com sucesso. Te esperamos lá!</p>
            </div>

            <div className={`p-6 rounded-[2rem] text-left space-y-3 ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
               <div className="flex justify-between items-center text-xs">
                  <span className="opacity-50 uppercase font-bold tracking-widest">Serviço</span>
                  <span className="font-black lowercase">{form.tipoCorte}</span>
               </div>
               <div className="flex justify-between items-center text-xs">
                  <span className="opacity-50 uppercase font-bold tracking-widest">Data e Hora</span>
                  <span className="font-black lowercase">{new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR')} às {form.hora}</span>
               </div>
            </div>

            <button 
              onClick={() => navigate(`/cliente/${id}`)}
              className="w-full py-5 bg-[#e6b32a] text-black rounded-2xl font-black uppercase text-[10px] tracking-[2px] shadow-lg shadow-[#e6b32a]/20 hover:scale-[1.02] transition-all"
            >
              Ir para o meu Painel
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/20">
          <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {alertConfig.show && <CustomAlert {...alertConfig} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />}
      
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'} hover:border-[#e6b32a]`}>
              <IoArrowBackOutline size={22} />
            </button>
            <div>
              <h1 className="text-2xl font-black italic lowercase tracking-tighter">novo.<span className="text-[#e6b32a]">agendamento</span></h1>
              <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[3px]">etapa {step} de 4</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-64">
            {[1, 2, 3, 4].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#e6b32a]' : 'bg-white/5'}`} />)}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className={`lg:col-span-8 p-6 md:p-10 rounded-[2.5rem] border shadow-2xl min-h-[550px] transition-all ${isDarkMode ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-100'}`}>
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-[#e6b32a]"><IoPricetagOutline size={24} /><h2 className="text-lg font-black uppercase tracking-widest">escolha o serviço</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiposCorte.map((t, idx) => (
                    <div key={idx} onClick={() => setForm({...form, tipoCorte: t.nome, valor: t.valor, tempo: t.tempo})} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex justify-between items-center ${form.tipoCorte === t.nome ? 'border-[#e6b32a] bg-[#e6b32a]/5 shadow-sm' : isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="space-y-1">
                        <p className={`text-xl font-black lowercase ${form.tipoCorte === t.nome ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-gray-400'}`}>{t.nome}</p>
                        <span className="text-[10px] font-bold opacity-50 uppercase tracking-tighter">{t.tempo} min</span>
                      </div>
                      <div className={`px-4 py-2 rounded-xl font-black ${form.tipoCorte === t.nome ? 'bg-[#e6b32a] text-black' : 'text-[#e6b32a] bg-[#e6b32a]/10'}`}>r${t.valor.toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-[#e6b32a]"><IoCalendarOutline size={24} /><h2 className="text-lg font-black uppercase tracking-widest">quando?</h2></div>
                <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white shadow-sm'}`}>
                  <div className="flex justify-between items-center mb-8">
                    <button onClick={() => mudarMes(-1)} className="p-2 hover:text-[#e6b32a]"><IoChevronBack size={24}/></button>
                    <span className="font-black uppercase tracking-widest text-sm">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => mudarMes(1)} className="p-2 hover:text-[#e6b32a]"><IoChevronForward size={24}/></button>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {['dom','seg','ter','qua','qui','sex','sab'].map(d => <div key={d} className="text-center text-[8px] font-black uppercase text-gray-500 mb-2">{d}</div>)}
                    {getDiasCalendario().map((dia, i) => {
                      if (!dia) return <div key={`empty-${i}`} />;
                      const dStr = dia.toLocaleDateString('en-CA');
                      const status = getStatusDia(dia);
                      const hojeStr = new Date().toLocaleDateString('en-CA');
                      const podeSelecionar = status === 'A' && dStr >= hojeStr;
                      return (
                        <button 
                          key={i} 
                          disabled={!podeSelecionar}
                          onClick={() => setForm({...form, data: dStr, fk_barbeiro: '', fk_barbeiroNome: '', hora: ''})}
                          className={`aspect-square rounded-2xl text-xs font-black transition-all relative flex items-center justify-center ${
                            form.data === dStr ? 'bg-[#e6b32a] text-black scale-105 shadow-lg shadow-[#e6b32a]/30' :
                            podeSelecionar ? (isDarkMode ? 'bg-white/5 hover:bg-[#e6b32a]/20' : 'bg-slate-100 hover:border-[#e6b32a]') : 'opacity-20 cursor-not-allowed'
                          }`}
                        >
                          {dia.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-[#e6b32a]"><IoPersonOutline size={24} /><h2 className="text-lg font-black uppercase tracking-widest">com quem?</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {barbeiros.map(b => (
                    <div key={b._id} onClick={() => setForm({...form, fk_barbeiro: b._id, fk_barbeiroNome: b.nome, hora: ''})} className={`p-6 rounded-[2.5rem] border-2 transition-all cursor-pointer flex items-center gap-4 ${form.fk_barbeiro === b._id ? 'border-[#e6b32a] bg-[#e6b32a]/10' : isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-100 bg-slate-50'}`}>
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xs font-black text-white ${getCorBarbeiro(b._id)}`}>
                        {getIniciais(b.nome)}
                      </div>
                      <div className="flex-1">
                        <span className="text-lg font-black lowercase block">{b.nome}</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Turno: {b.entrada} - {b.saida}</span>
                        </div>
                      </div>
                      {form.fk_barbeiro === b._id && <IoCheckmarkCircle size={24} className="text-[#e6b32a]" />}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-[#e6b32a]"><IoTimeOutline size={24} /><h2 className="text-lg font-black uppercase tracking-widest">horários livres</h2></div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {gerarHorariosDisponiveis().map(h => (
                    <button key={h} onClick={() => setForm({...form, hora: h})} className={`p-4 rounded-2xl border-2 font-black transition-all ${form.hora === h ? 'border-[#e6b32a] bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : isDarkMode ? 'border-white/5 bg-black hover:border-[#e6b32a]/40' : 'border-slate-100 bg-white hover:border-[#e6b32a]'}`}>{h}</button>
                  ))}
                </div>
              </div>
            )}
          </main>

          <aside className="hidden lg:block lg:col-span-4 sticky top-8">
            <div className={`p-8 rounded-[2.5rem] border shadow-2xl space-y-8 ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-[4px] text-[#e6b32a]">resumo</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500">serviço</span>
                  <span className="font-black lowercase text-sm">{form.tipoCorte || '—'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500">data</span>
                  <span className="font-bold text-sm">{form.data ? new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500">barbeiro</span>
                  <span className="font-black lowercase text-sm">{form.fk_barbeiroNome || '—'}</span>
                </div>
                {form.hora && (
                  <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500">horário</span>
                    <span className="font-black text-sm">{form.hora}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4">
                  <span className="text-[10px] uppercase font-bold text-gray-500">total</span>
                  <span className="text-2xl font-black text-[#e6b32a]">r$ {form.valor.toFixed(2)}</span>
                </div>
              </div>
              <button 
                disabled={stepConfig[step].disabled || loading} 
                onClick={stepConfig[step].action} 
                className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${stepConfig[step].disabled ? 'bg-white/5 text-gray-700' : 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20 hover:scale-[1.02]'}`}
              >
                {loading ? 'Processando...' : stepConfig[step].label}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}