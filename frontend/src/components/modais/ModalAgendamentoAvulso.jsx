import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/Api';
import { 
  IoCloseOutline, IoCutOutline, IoTimeOutline, 
  IoCalendarOutline, IoPersonOutline, IoChevronForward, 
  IoChevronBack, IoLogoWhatsapp, IoCheckmarkCircleOutline,
  IoArrowBackOutline
} from 'react-icons/io5';

export default function ModalAgendamentoCompleto({ isOpen, onClose, onSave, isDarkMode }) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [servicos, setServicos] = useState([]);
  const [barbeiroId, setBarbeiroId] = useState(null);
  const [barbeiroNome, setBarbeiroNome] = useState('');
  const [gradeMensal, setGradeMensal] = useState([]);
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [form, setForm] = useState({
    tipoCorte: '',
    valor: 0,
    tempo: 30,
    data: '',
    hora: '',
    cliente: { nome: '', numero: '' }
  });

  const carregarDadosIniciais = useCallback(async () => {
    try {
      setLoading(true);
      const idBarbeiroLogado = localStorage.getItem('barbeiroId');
      
      const [resB, resA, resG] = await Promise.all([
        api.get('/barbeiros'),
        api.get('/agendamentos'),
        api.get('/agendas')
      ]);

      const barbeirosData = resB.data || resB;
      const meuPerfil = barbeirosData.find(b => String(b._id) === String(idBarbeiroLogado));

      if (meuPerfil) {
        setBarbeiroId(meuPerfil._id);
        setBarbeiroNome(meuPerfil.nome);
        const idBarb = meuPerfil.fk_barbearia?._id || meuPerfil.fk_barbearia;
        
        const resBarb = await api.get(`/barbearias/${idBarb}`);
        const barbeariaData = resBarb.data || resBarb;
        setServicos(barbeariaData.servicos || []);
        
        // Filtra agendas e agendamentos apenas deste barbeiro e barbearia
        setGradeMensal((resG.data || resG || []).filter(g => String(g.fk_barbeiro?._id || g.fk_barbeiro) === String(idBarbeiroLogado)));
        setTodosAgendamentos((resA.data || resA || []).filter(a => a.status === 'A'));
      }
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      carregarDadosIniciais();
      setStep(1);
    }
  }, [isOpen, carregarDadosIniciais]);

  const getDiasCalendario = () => {
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const dias = [];
    for (let i = 0; i < new Date(ano, mes, 1).getDay(); i++) dias.push(null);
    for (let i = 1; i <= new Date(ano, mes + 1, 0).getDate(); i++) dias.push(new Date(ano, mes, i));
    return dias;
  };

  const gerarHorariosDisponiveis = () => {
    if (!form.data || !barbeiroId || !form.tempo) return [];
    
    const escala = gradeMensal.find(g => g.data?.startsWith(form.data));
    if (!escala) return [];

    const agora = new Date();
    const hojeStr = agora.toLocaleDateString('en-CA');
    const minutosAgora = (agora.getHours() * 60) + agora.getMinutes();

    const toMin = (s) => s.split(':').map(Number).reduce((h, m) => h * 60 + m);
    const inicio = toMin(escala.abertura);
    const fim = toMin(escala.fechamento);
    
    const ocupados = todosAgendamentos
      .filter(a => String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(barbeiroId) && a.datahora.startsWith(form.data))
      .map(a => {
        const start = toMin(a.datahora.split('T')[1].substring(0, 5));
        return { start, end: start + (a.tempo_estimado || 30) };
      });

    const slots = [];
    for (let c = inicio; c + form.tempo <= fim; c += 20) {
      if (form.data === hojeStr && c <= minutosAgora + 10) continue;
      if (!ocupados.some(o => c < o.end && (c + form.tempo) > o.start)) {
        slots.push(`${Math.floor(c/60).toString().padStart(2,'0')}:${(c%60).toString().padStart(2,'0')}`);
      }
    }
    return slots;
  };

  const handleFinalizar = () => {
    const start = new Date(`${form.data}T${form.hora}:00`);
    const end = new Date(start.getTime() + (form.tempo * 60000));

    const payload = {
      tipoCorte: form.tipoCorte,
      cliente: { nome: form.cliente.nome, numero: form.cliente.numero },
      datahora: start.toISOString(),
      datahora_fim: end.toISOString(),
      tempo_estimado: form.tempo,
      valor: form.valor,
      status: 'A',
      fk_barbeiro: barbeiroId,
      fk_barbearia: gradeMensal[0]?.fk_barbearia?._id || gradeMensal[0]?.fk_barbearia
    };

    onSave(payload);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className={`w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-[3rem] border shadow-2xl ${isDarkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        
        {/* HEADER MODAL */}
        <header className="p-8 flex items-center justify-between sticky top-0 z-10 bg-inherit">
          <button 
            onClick={() => step === 1 ? onClose() : setStep(step - 1)}
            className="group flex items-center gap-2 px-4 py-2 rounded-xl hover:bg-[#e6b32a]/10 transition-all"
          >
            <IoArrowBackOutline size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-black text-[10px] uppercase tracking-widest">{step === 1 ? 'Cancelar' : 'Voltar'}</span>
          </button>
          
          <div className="flex gap-2">
            {[1, 2, 3].map(s => (
              <div key={s} className={`h-1.5 w-10 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#e6b32a]' : 'bg-gray-800'}`} />
            ))}
          </div>
          
          <button onClick={onClose} className="p-2 opacity-40 hover:opacity-100 transition-opacity">
            <IoCloseOutline size={30} />
          </button>
        </header>

        <main className="p-8 pt-0">
          {/* STEP 1: SERVIÇOS */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <div className="text-center mb-10">
                <h2 className="text-3xl font-black lowercase">O que vamos fazer?</h2>
                <p className="text-[10px] uppercase tracking-[4px] opacity-40 mt-2">Selecione o serviço</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicos.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setForm({...form, tipoCorte: s.nome, valor: s.valor, tempo: s.tempo}); setStep(2); }}
                    className={`p-6 rounded-[2rem] border-2 flex justify-between items-center transition-all hover:border-[#e6b32a] ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100 shadow-sm'}`}
                  >
                    <div className="text-left">
                      <p className="font-black text-lg lowercase">{s.nome}</p>
                      <p className="text-[10px] uppercase opacity-50 font-bold">{s.tempo} min</p>
                    </div>
                    <p className="text-[#e6b32a] font-black text-xl">R$ {s.valor}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: CALENDÁRIO E HORAS */}
          {step === 2 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-in fade-in slide-in-from-right-4">
              {/* Calendário */}
              <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                <div className="flex items-center justify-between mb-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-[#e6b32a]">Calendário</span>
                  <div className="flex items-center gap-4 bg-black/20 p-2 rounded-xl">
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><IoChevronBack /></button>
                    <span className="text-[10px] font-black uppercase w-20 text-center">{currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                    <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><IoChevronForward /></button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i} className="text-center text-[9px] font-black opacity-30 py-2">{d}</div>)}
                  {getDiasCalendario().map((dia, i) => {
                    if (!dia) return <div key={i} />;
                    const dStr = dia.toLocaleDateString('en-CA');
                    const isPassado = dStr < new Date().toLocaleDateString('en-CA');
                    const temEscala = gradeMensal.some(g => g.data?.startsWith(dStr));
                    const disp = temEscala && !isPassado;
                    return (
                      <button 
                        key={i} disabled={!disp}
                        onClick={() => setForm({...form, data: dStr, hora: ''})}
                        className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-black transition-all ${
                          form.data === dStr ? 'bg-[#e6b32a] text-black scale-110' : disp ? 'bg-white/10 hover:bg-[#e6b32a]/20' : 'opacity-10'
                        }`}
                      >
                        {dia.getDate()}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Horários */}
              <div className="space-y-6">
                {!form.data ? (
                  <div className="h-full flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2.5rem] opacity-30 text-[10px] font-black uppercase p-10 text-center">
                    <IoCalendarOutline size={40} className="mb-4" />
                    Selecione um dia para ver os horários
                  </div>
                ) : (
                  <div className="space-y-8 animate-in fade-in duration-500">
                    <div>
                      <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Horários Disponíveis</h4>
                      <div className="grid grid-cols-4 gap-2">
                        {gerarHorariosDisponiveis().map(h => (
                          <button 
                            key={h} onClick={() => setForm({...form, hora: h})}
                            className={`py-4 rounded-2xl text-[10px] font-black border-2 transition-all ${form.hora === h ? 'bg-[#e6b32a] border-[#e6b32a] text-black' : 'bg-transparent border-white/5 hover:border-[#e6b32a]'}`}
                          >
                            {h}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button 
                      disabled={!form.hora}
                      onClick={() => setStep(3)}
                      className="w-full py-6 rounded-[2rem] bg-[#e6b32a] text-black font-black uppercase text-xs tracking-[4px] shadow-xl shadow-[#e6b32a]/20 disabled:opacity-20 transition-all"
                    >
                      Confirmar Horário
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: DADOS DO CLIENTE */}
          {step === 3 && (
            <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="text-center">
                <h2 className="text-3xl font-black lowercase">Quem é o cliente?</h2>
                <p className="text-[10px] uppercase tracking-[4px] opacity-40 mt-2">Identificação para o balcão</p>
              </div>

              <div className={`p-8 rounded-[3rem] border-2 space-y-6 ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
                <div className="space-y-4">
                  <div className="relative">
                    <IoPersonOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-[#e6b32a]" />
                    <input 
                      type="text" placeholder="Nome do cliente"
                      className={`w-full p-5 pl-14 rounded-2xl border-2 outline-none text-sm transition-all ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'} focus:border-[#e6b32a]`}
                      value={form.cliente.nome}
                      onChange={e => setForm({...form, cliente: {...form.cliente, nome: e.target.value}})}
                    />
                  </div>
                  <div className="relative">
                    <IoLogoWhatsapp className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" />
                    <input 
                      type="tel" placeholder="WhatsApp (Opcional)"
                      className={`w-full p-5 pl-14 rounded-2xl border-2 outline-none text-sm transition-all ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'} focus:border-[#e6b32a]`}
                      value={form.cliente.numero}
                      onChange={e => setForm({...form, cliente: {...form.cliente, numero: e.target.value}})}
                    />
                  </div>
                </div>

                <div className={`p-6 rounded-3xl space-y-3 ${isDarkMode ? 'bg-black/40' : 'bg-slate-50'}`}>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-40">Serviço:</span>
                    <span className="text-[#e6b32a]">{form.tipoCorte}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                    <span className="opacity-40">Data/Hora:</span>
                    <span>{form.data} às {form.hora}</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest border-t border-white/5 pt-3">
                    <span className="opacity-40">Profissional:</span>
                    <span>{barbeiroNome}</span>
                  </div>
                </div>
              </div>

              <button 
                disabled={!form.cliente.nome}
                onClick={handleFinalizar}
                className="w-full py-8 rounded-[2.5rem] bg-emerald-600 text-white font-black uppercase text-xs tracking-[5px] shadow-2xl shadow-emerald-900/40 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20"
              >
                Finalizar no Balcão
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}