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
  IoLockClosedOutline
} from 'react-icons/io5';

export default function NovoAgendamento() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [step, setStep] = useState(1);
  const [barbeiros, setBarbeiros] = useState([]);
  const [listaCompletaProfissionais, setListaCompletaProfissionais] = useState([]); 
  const [tiposCorte, setTiposCorte] = useState([]);
  const [agendaMensal, setAgendaMensal] = useState(null);
  const [todosAgendamentos, setTodosAgendamentos] = useState([]); 
  const [loading, setLoading] = useState(true);
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
      const lista = resB.data || resB;
      setListaCompletaProfissionais(lista);
      
      if (lista.length > 0) {
        // Busca a barbearia do profissional
        const bId = (lista[0].fk_barbearia?._id || lista[0].fk_barbearia).toString();
        const mes = currentMonth.getMonth();
        const ano = currentMonth.getFullYear();

        const [resBarbearia, resAgendamentos] = await Promise.all([
          api.get(`/barbearias/${bId}`),
          api.get(`/agendamentos`)
        ]);

        const dadosB = resBarbearia.data || resBarbearia;
        setTiposCorte(dadosB.servicos || []);
        
        // Verifica se a agenda detalhada retornada coincide com o mês/ano atual
        if (dadosB.agenda_detalhada && 
            Number(dadosB.agenda_detalhada.mes) === mes && 
            Number(dadosB.agenda_detalhada.ano) === ano) {
          setAgendaMensal(dadosB.agenda_detalhada);
        } else {
          setAgendaMensal(null);
        }

        setForm(prev => ({ ...prev, fk_barbearia: bId }));
        const ags = resAgendamentos.data || resAgendamentos;
        setTodosAgendamentos(Array.isArray(ags) ? ags.filter(a => a.status === 'A') : []);
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (agendaMensal && form.data) {
      const diaNum = parseInt(form.data.split('-')[2]);
      const configDia = agendaMensal.grade.find(g => g.dia === diaNum);
      
      // Ajuste: Só carrega profissionais se o status for 'A' (Publicado)
      if (configDia && configDia.status === 'A' && Array.isArray(configDia.escalas)) {
        const profissionaisNoDia = configDia.escalas.map(esc => {
          const idB = (esc.barbeiroId?._id || esc.barbeiroId).toString();
          const dadosProfissional = listaCompletaProfissionais.find(p => p._id.toString() === idB);
          
          return {
            _id: idB,
            nome: dadosProfissional?.nome || "Profissional",
            entrada: esc.entrada,
            saida: esc.saida
          };
        }).filter(p => p._id); // Garante que não venha null

        setBarbeiros(profissionaisNoDia);
      } else {
        setBarbeiros([]);
      }
    }
  }, [form.data, agendaMensal, listaCompletaProfissionais]);

  const getStatusDia = (diaDate) => {
    if (!agendaMensal || !agendaMensal.grade) return 'I';
    const diaNum = diaDate.getDate();
    const configDia = agendaMensal.grade.find(g => g.dia === diaNum);
    return configDia ? configDia.status : 'I';
  };

  const timeToMinutes = (timeStr) => {
    if (!timeStr) return 0;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
  };

  const gerarHorariosDisponiveis = () => {
    if (!agendaMensal || !form.data || !form.fk_barbeiro || !form.tempo) return [];
    
    const diaNum = parseInt(form.data.split('-')[2]);
    const configDia = agendaMensal.grade.find(g => g.dia === diaNum);
    if (!configDia || configDia.status !== 'A') return [];

    const escala = configDia.escalas.find(e => (e.barbeiroId?._id || e.barbeiroId).toString() === form.fk_barbeiro);
    if (!escala) return [];

    const inicioTurno = timeToMinutes(escala.entrada);
    const fimTurno = timeToMinutes(escala.saida);
    const duracaoServico = form.tempo;

    const agendamentosDoDia = todosAgendamentos.filter(a => 
      (a.fk_barbeiro?._id || a.fk_barbeiro).toString() === form.fk_barbeiro && 
      a.datahora.startsWith(form.data)
    ).map(a => {
      const horaStr = a.datahora.split('T')[1].substring(0, 5);
      const inicio = timeToMinutes(horaStr);
      const duracao = a.tempo_estimado || 30; 
      return { inicio, fim: inicio + duracao };
    });

    const slots = [];
    const agora = new Date();
    const hojeStr = agora.toLocaleDateString('en-CA');
    const minutosAgora = agora.getHours() * 60 + agora.getMinutes();

    // Intervalos de 10 em 10 minutos
    for (let current = inicioTurno; current + duracaoServico <= fimTurno; current += 10) {
      const slotFim = current + duracaoServico;
      if (form.data === hojeStr && current <= minutosAgora + 15) continue;

      const conflito = agendamentosDoDia.some(ag => {
        return (current < ag.fim && slotFim > ag.inicio);
      });

      if (!conflito) {
        const h = Math.floor(current / 60).toString().padStart(2, '0');
        const m = (current % 60).toString().padStart(2, '0');
        slots.push(`${h}:${m}`);
      }
    }
    return slots;
  };

  const mudarMes = (dir) => {
    const n = new Date(currentMonth);
    n.setMonth(currentMonth.getMonth() + dir);
    setCurrentMonth(n);
    setForm({ ...form, data: '', fk_barbeiro: '', fk_barbeiroNome: '', hora: '' });
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
      const payload = {
        tipoCorte: form.tipoCorte,
        fk_barbeiro: form.fk_barbeiro,
        fk_barbearia: form.fk_barbearia,
        datahora: `${form.data}T${form.hora}:00`,
        fk_cliente: id,
        valor: Number(form.valor),
        tempo_estimado: form.tempo,
        status: 'A'
      };
      await api.post('/agendamentos', payload);
      navigate(`/cliente/${id}`);
    } catch (err) {
      setAlertConfig({ show: true, title: 'Erro', message: 'Não foi possível concluir o agendamento.', type: 'error' });
    }
  };

  const stepConfig = {
    1: { label: "Próximo: Data", disabled: !form.tipoCorte, action: () => setStep(2) },
    2: { label: "Próximo: Profissional", disabled: !form.data, action: () => setStep(3) },
    3: { label: "Próximo: Horário", disabled: !form.fk_barbeiro, action: () => setStep(4) },
    4: { label: "Finalizar Reserva", disabled: !form.hora, action: handleFinalizar }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#070707] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 pb-32`}>
      
      {loading && (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md transition-all ${isDarkMode ? 'bg-black/70' : 'bg-white/70'}`}>
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#e6b32a]">carregando</span>
          </div>
        </div>
      )}

      {alertConfig.show && (
        <CustomAlert 
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
        />
      )}
      
      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm hover:border-[#e6b32a]/30'}`}>
              <IoArrowBackOutline size={22} />
            </button>
            <div>
              <h1 className="text-2xl font-black italic lowercase tracking-tighter">novo.<span className="text-[#e6b32a]">agendamento</span></h1>
              <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[3px]">etapa {step} de 4</p>
            </div>
          </div>
          <div className="flex gap-2 w-full md:w-64">
            {[1, 2, 3, 4].map(s => <div key={s} className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#e6b32a]' : isDarkMode ? 'bg-white/5' : 'bg-black/10'}`} />)}
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <main className={`lg:col-span-8 p-6 md:p-10 rounded-[2.5rem] border shadow-2xl min-h-[550px] ${isDarkMode ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-100'}`}>
            
            {step === 1 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-[#e6b32a]"><IoPricetagOutline size={24} /><h2 className="text-lg font-black uppercase tracking-widest">escolha o serviço</h2></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tiposCorte.map((t, idx) => (
                    <div key={idx} onClick={() => setForm({...form, tipoCorte: t.nome, valor: t.valor, tempo: t.tempo})} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex justify-between items-center ${form.tipoCorte === t.nome ? 'border-[#e6b32a] bg-[#e6b32a]/5 shadow-sm' : isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-[#e6b32a]/30'}`}>
                      <div className="space-y-1">
                        <p className={`text-xl font-black lowercase ${form.tipoCorte === t.nome ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-gray-400'}`}>{t.nome}</p>
                        <div className="flex items-center gap-1 opacity-50">
                            <IoTimeOutline size={12}/>
                            <span className="text-[10px] font-bold uppercase tracking-tighter">{t.tempo} min</span>
                        </div>
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
                <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-black/40 border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
                  <div className="flex justify-between items-center mb-8">
                    <button onClick={() => mudarMes(-1)} className="p-2 hover:text-[#e6b32a] transition-colors"><IoChevronBack size={24}/></button>
                    <span className="font-black uppercase tracking-widest text-sm">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => mudarMes(1)} className="p-2 hover:text-[#e6b32a] transition-colors"><IoChevronForward size={24}/></button>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {['dom','seg','ter','qua','qui','sex','sab'].map(d => <div key={d} className="text-center text-[8px] font-black uppercase text-gray-500 mb-2">{d}</div>)}
                    {getDiasCalendario().map((dia, i) => {
                      if (!dia) return <div key={`empty-${i}`} />;
                      const dStr = dia.toLocaleDateString('en-CA');
                      const status = getStatusDia(dia);
                      const podeSelecionar = status === 'A' && dStr >= new Date().toLocaleDateString('en-CA');

                      return (
                        <button 
                          key={i} 
                          disabled={!podeSelecionar}
                          onClick={() => setForm({...form, data: dStr, fk_barbeiro: '', fk_barbeiroNome: '', hora: ''})}
                          className={`aspect-square rounded-2xl text-xs font-black transition-all relative flex flex-col items-center justify-center ${
                            form.data === dStr ? 'bg-[#e6b32a] text-black scale-105 shadow-lg shadow-[#e6b32a]/30' :
                            podeSelecionar ? (isDarkMode ? 'bg-white/5 hover:bg-[#e6b32a]/20' : 'bg-slate-50 border border-slate-200 hover:border-[#e6b32a]/50') :
                            'opacity-20 cursor-not-allowed grayscale'
                          }`}
                        >
                          {dia.getDate()}
                          {status !== 'A' && <IoLockClosedOutline size={8} className="absolute top-1 right-1 opacity-40" />}
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
                  {barbeiros.length > 0 ? barbeiros.map(b => (
                    <div key={b._id} onClick={() => setForm({...form, fk_barbeiro: b._id, fk_barbeiroNome: b.nome, hora: ''})} className={`p-6 rounded-[2rem] border-2 transition-all cursor-pointer flex justify-between items-center ${form.fk_barbeiro === b._id ? 'border-[#e6b32a] bg-[#e6b32a]/10 shadow-sm' : isDarkMode ? 'border-white/5 bg-black/40' : 'border-slate-100 bg-slate-50 hover:bg-white hover:border-[#e6b32a]/30'}`}>
                      <div>
                        <span className={`text-xl font-black lowercase block ${form.fk_barbeiro === b._id ? (isDarkMode ? 'text-white' : 'text-slate-900') : 'text-gray-400'}`}>{b.nome}</span>
                        <span className="text-[10px] text-gray-500 uppercase font-bold tracking-tighter">Turno: {b.entrada} às {b.saida}</span>
                      </div>
                      {form.fk_barbeiro === b._id && <IoCheckmarkCircle size={24} className="text-[#e6b32a] animate-in zoom-in" />}
                    </div>
                  )) : (
                    <div className="col-span-full py-16 flex flex-col items-center opacity-40 border-2 border-dashed border-gray-300 dark:border-white/10 rounded-[2.5rem]">
                      <IoPersonOutline size={40} className="mb-2"/>
                      <p className="text-sm font-black italic uppercase tracking-widest">Nenhum profissional disponível neste dia.</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                <div className="flex items-center gap-3 text-[#e6b32a]"><IoTimeOutline size={24} /><h2 className="text-lg font-black uppercase tracking-widest">horários livres para {form.tempo} min</h2></div>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
                  {gerarHorariosDisponiveis().map(h => (
                    <button key={h} onClick={() => setForm({...form, hora: h})} className={`p-4 rounded-2xl border-2 font-black transition-all ${form.hora === h ? 'border-[#e6b32a] bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : isDarkMode ? 'border-white/5 bg-black hover:border-[#e6b32a]/40' : 'border-slate-100 bg-white hover:border-[#e6b32a]/50 shadow-sm'}`}>{h}</button>
                  ))}
                  {gerarHorariosDisponiveis().length === 0 && (
                    <p className="col-span-full text-center text-gray-500 italic py-10">Agenda lotada ou sem espaço para a duração deste serviço hoje.</p>
                  )}
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
                  <div className="text-right">
                    <span className="font-black lowercase text-sm block">{form.tipoCorte || '—'}</span>
                    {form.tempo > 0 && <span className="text-[9px] text-gray-400 font-bold uppercase">{form.tempo} minutos</span>}
                  </div>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500">data</span>
                  <span className="font-bold text-sm">{form.data ? new Date(form.data + 'T00:00:00').toLocaleDateString('pt-BR') : '—'}</span>
                </div>
                <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                  <span className="text-[10px] uppercase font-bold text-gray-500">barbeiro</span>
                  <span className="font-black lowercase text-sm">{form.fk_barbeiroNome || '—'}</span>
                </div>
                {form.hora && (
                  <div className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-2">
                    <span className="text-[10px] uppercase font-bold text-gray-500">horário</span>
                    <span className="font-black text-sm text-[#e6b32a]">{form.hora}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-4">
                  <span className="text-[10px] uppercase font-bold text-gray-500">total</span>
                  <span className="text-2xl font-black text-[#e6b32a]">r$ {form.valor.toFixed(2)}</span>
                </div>
              </div>
              <button 
                disabled={stepConfig[step].disabled} 
                onClick={stepConfig[step].action} 
                className={`w-full py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all ${stepConfig[step].disabled ? (isDarkMode ? 'bg-white/5 text-gray-700' : 'bg-slate-100 text-slate-300') : 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20 hover:scale-[1.02] active:scale-95'}`}
              >
                {stepConfig[step].label}
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}