import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert';

import { 
  IoPricetagOutline, 
  IoTimeOutline, 
  IoCalendarOutline, 
  IoChevronForward, 
  IoChevronBack,
  IoArrowBackOutline,
  IoCheckmarkCircle
} from 'react-icons/io5';

export default function NovoAgendamento() {
  // Pegamos o id da barbearia pela URL
  const { idBarbearia } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [listaCompletaProfissionais, setListaCompletaProfissionais] = useState([]); 
  const [tiposCorte, setTiposCorte] = useState([]);
  const [gradeMensal, setGradeMensal] = useState([]); 
  const [todosAgendamentos, setTodosAgendamentos] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', type: 'error' });
  
  const [form, setForm] = useState({ 
    tipoCorte: '', 
    fk_barbeiro: '', 
    fk_barbeiroNome: '',
    fk_barbearia: idBarbearia || '', 
    data: '', 
    hora: '', 
    valor: 0,
    tempo: 0 
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (idBarbearia) {
        carregarDadosIniciais();
    }
  }, [currentMonth, idBarbearia]);

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      
      const resBarbearia = await api.get(`/barbearias/${idBarbearia}`);
      const dadosB = resBarbearia.data || resBarbearia;
      setTiposCorte(dadosB.servicos || []);

      const resB = await api.get('/barbeiros');
      const profissionais = resB.data || resB;
      const filtrados = (Array.isArray(profissionais) ? profissionais : []).filter(b => {
        const fk = b.fk_barbearia?._id || b.fk_barbearia;
        return String(fk) === String(idBarbearia);
      });
      setListaCompletaProfissionais(filtrados);
      
      const [resAgendamentos, resAgendas] = await Promise.all([
        api.get(`/agendamentos`),
        api.get(`/agendas`) 
      ]);

      const agendasDB = resAgendas.data || resAgendas;
      setGradeMensal(Array.isArray(agendasDB) ? agendasDB : []);
      
      const ags = resAgendamentos.data || resAgendamentos;
      setTodosAgendamentos(Array.isArray(ags) ? ags.filter(a => a.status === 'A') : []);

    } catch (err) {
      console.error("Erro ao carregar dados do agendamento:", err);
      setAlertConfig({ show: true, title: 'Erro', message: 'Não foi possível carregar os dados da barbearia.', type: 'error' });
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
        if(!dadosProf) return null;
        return {
          _id: idB,
          nome: dadosProf.nome,
          foto: dadosProf.foto
        };
      }).filter(p => p !== null);
      setBarbeiros(profissionaisNoDia);
    }
  }, [form.data, gradeMensal, listaCompletaProfissionais]);

  const timeToMinutes = (timeStr) => {
    if (!timeStr || typeof timeStr !== 'string') return null;
    const parts = timeStr.split(':');
    return Number(parts[0]) * 60 + Number(parts[1]);
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

    for (let current = inicioTurno; current + duracaoServico <= fimTurno; current += 20) {
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
    const dataInicio = new Date(`${form.data}T${form.hora}:00`);
    const dataFim = new Date(dataInicio.getTime() + (form.tempo * 60000));

    const agendamentoTemporario = {
      ...form,
      datahora: dataInicio.toISOString(),
      datahora_fim: dataFim.toISOString(),
    };

    // Salva no storage para recuperar após o cadastro
    localStorage.setItem('pending_appointment', JSON.stringify(agendamentoTemporario));

    // REDIRECIONAMENTO MODIFICADO PARA O LINK DO BARBEIRO
    // Usamos o idBarbearia que veio da URL para garantir o vínculo correto
    navigate(`/cliente/register?barbearia=${idBarbearia}`);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#070707] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8`}>
      
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-md bg-black/20">
          <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-8 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl border flex items-center justify-center border-white/10 hover:bg-white/5 transition-colors">
            <IoArrowBackOutline />
          </button>
          <h1 className="text-xl font-black italic lowercase">agendar.<span className="text-[#e6b32a]">experiência</span></h1>
        </header>

        {!form.tipoCorte ? (
          <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex items-center gap-2 text-[#e6b32a]">
               <IoPricetagOutline /> 
               <span className="text-xs font-black uppercase tracking-widest">O que vamos fazer hoje?</span>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {tiposCorte.map((t, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => setForm({...form, tipoCorte: t.nome, valor: t.valor, tempo: t.tempo})} 
                      className={`p-6 rounded-[2rem] border-2 cursor-pointer transition-all hover:scale-[1.02] active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-[#e6b32a]' : 'bg-white border-slate-100 hover:border-[#e6b32a]'}`}
                    >
                        <p className="text-lg font-black lowercase">{t.nome}</p>
                        <p className="text-[#e6b32a] font-bold">R$ {t.valor.toFixed(2)}</p>
                        <span className="text-[10px] opacity-50">{t.tempo} min</span>
                    </div>
                ))}
             </div>
          </div>
        ) : (
          <div className={`rounded-[2.5rem] border shadow-2xl overflow-hidden flex flex-col md:flex-row transition-all duration-500 ${isDarkMode ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-100'}`}>
            
            <div className="md:w-1/2 p-8 border-r border-white/5">
              <div className="flex justify-between items-center mb-6">
                <button onClick={() => setForm({...form, tipoCorte: ''})} className="text-[10px] font-black uppercase text-[#e6b32a] hover:underline">Alterar Serviço</button>
                <div className="flex items-center gap-4">
                    <button onClick={() => mudarMes(-1)} className="p-1 hover:text-[#e6b32a]"><IoChevronBack /></button>
                    <span className="text-xs font-black uppercase tracking-widest">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => mudarMes(1)} className="p-1 hover:text-[#e6b32a]"><IoChevronForward /></button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['dom','seg','ter','qua','qui','sex','sab'].map(d => <div key={d} className="text-center text-[8px] font-black uppercase text-gray-500">{d}</div>)}
                {getDiasCalendario().map((dia, i) => {
                    if (!dia) return <div key={i} />;
                    const dStr = dia.toLocaleDateString('en-CA');
                    const status = getStatusDia(dia);
                    const podeSelecionar = status === 'A' && dStr >= new Date().toLocaleDateString('en-CA');
                    return (
                        <button 
                            key={i} 
                            disabled={!podeSelecionar}
                            onClick={() => setForm({...form, data: dStr, fk_barbeiro: '', hora: ''})}
                            className={`aspect-square rounded-2xl text-xs font-black transition-all ${
                                form.data === dStr ? 'bg-[#e6b32a] text-black scale-105 shadow-lg shadow-[#e6b32a]/30' :
                                podeSelecionar ? 'bg-white/5 hover:bg-white/10' : 'opacity-10 cursor-not-allowed line-through'
                            }`}
                        >
                            {dia.getDate()}
                        </button>
                    );
                })}
              </div>
            </div>

            <div className={`md:w-1/2 p-8 flex flex-col ${isDarkMode ? 'bg-white/5' : 'bg-slate-50/50'}`}>
              <div className="mb-8">
                 <p className="text-[10px] font-black uppercase tracking-widest text-[#e6b32a] mb-2">Resumo da Escolha</p>
                 <div className="flex justify-between items-center">
                    <h2 className="text-2xl font-black lowercase">{form.tipoCorte}</h2>
                    <span className="text-xl font-black text-[#e6b32a]">R$ {form.valor.toFixed(2)}</span>
                 </div>
              </div>

              {!form.data ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center opacity-30 py-12">
                    <IoCalendarOutline size={48} className="mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-[3px]">Selecione uma data no calendário</p>
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4">
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest opacity-50 block mb-4">Com quem você quer cortar?</span>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {barbeiros.map(b => (
                                <button 
                                    key={b._id} 
                                    onClick={() => setForm({...form, fk_barbeiro: b._id, fk_barbeiroNome: b.nome, hora: ''})}
                                    className={`relative p-5 rounded-[2rem] border-2 flex items-center gap-4 transition-all text-left ${form.fk_barbeiro === b._id ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-white/5 bg-white/5 hover:border-white/20'}`}
                                >
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-white/10 flex-shrink-0 border border-white/10">
                                        <img 
                                          src={b.foto || `https://i.pravatar.cc/150?u=${b._id}`} 
                                          alt={b.nome} 
                                          className="w-full h-full object-cover" 
                                        />
                                    </div>
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-black text-sm lowercase truncate">{b.nome}</p>
                                        <p className="text-[9px] font-bold uppercase tracking-tighter opacity-50">Disponível</p>
                                    </div>
                                    {form.fk_barbeiro === b._id && (
                                        <div className="absolute top-3 right-3 text-[#e6b32a]">
                                            <IoCheckmarkCircle size={20} />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {form.fk_barbeiro && (
                        <div className="animate-in slide-in-from-bottom-4">
                             <div className="flex items-center gap-2 mb-4">
                                <IoTimeOutline className="text-[#e6b32a]" />
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Horários disponíveis</span>
                             </div>
                             <div className="grid grid-cols-4 gap-2">
                                {gerarHorariosDisponiveis().length > 0 ? (
                                    gerarHorariosDisponiveis().map(h => (
                                        <button 
                                            key={h} 
                                            onClick={() => setForm({...form, hora: h})}
                                            className={`py-3 rounded-xl text-xs font-black transition-all border-2 ${form.hora === h ? 'bg-[#e6b32a] border-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : 'bg-transparent border-white/5 hover:border-[#e6b32a]/50'}`}
                                        >
                                            {h}
                                        </button>
                                    ))
                                ) : (
                                    <p className="col-span-4 text-[10px] font-bold uppercase opacity-40 py-4">Nenhum horário disponível para hoje.</p>
                                )}
                             </div>
                        </div>
                    )}

                    <button 
                        disabled={!form.hora || loading}
                        onClick={handleFinalizar}
                        className={`w-full py-5 rounded-[1.5rem] font-black uppercase text-[10px] tracking-[3px] mt-4 transition-all ${!form.hora ? 'bg-white/5 text-gray-600' : 'bg-[#e6b32a] text-black shadow-2xl shadow-[#e6b32a]/30 hover:scale-[1.02]'}`}
                    >
                        {loading ? 'Processando...' : 'Identificar-se e Reservar'}
                    </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {alertConfig.show && <CustomAlert {...alertConfig} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />}
    </div>
  );
}