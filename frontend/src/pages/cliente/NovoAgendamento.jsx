import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert';

import { 
  IoPricetagOutline, IoCalendarOutline, IoChevronForward, 
  IoChevronBack, IoArrowBackOutline, IoLogoWhatsapp,
  IoPersonOutline, IoCheckmarkCircleOutline, IoTimeOutline
} from 'react-icons/io5';

export default function NovoAgendamento() {
  const { nomeBarbearia } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(true);
  const [tiposCorte, setTiposCorte] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [listaCompletaProfissionais, setListaCompletaProfissionais] = useState([]); 
  const [gradeMensal, setGradeMensal] = useState([]); 
  const [todosAgendamentos, setTodosAgendamentos] = useState([]); 
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', type: 'error' });
  
  const [form, setForm] = useState({ 
    tipoCorte: '', 
    fk_barbeiro: '', 
    fk_barbeiroNome: '',
    fk_barbearia: '', 
    data: '', 
    hora: '', 
    valor: 0, 
    tempo: 0, 
    cliente: { nome: '', numero: '' }
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    if (nomeBarbearia) carregarDadosIniciais();
  }, [nomeBarbearia]);

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      const dadosB = await api.get(`/barbearias/perfil/${nomeBarbearia}`);
      const idReal = dadosB?._id || dadosB?.id;
      setTiposCorte(dadosB?.servicos || []);
      setForm(prev => ({ ...prev, fk_barbearia: idReal }));

      const [resB, resA, resG] = await Promise.all([
        api.get('/barbeiros'), 
        api.get('/agendamentos'), 
        api.get('/agendas')
      ]);

      setListaCompletaProfissionais((resB || []).filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === String(idReal)));
      setGradeMensal(resG || []);
      setTodosAgendamentos((resA || []).filter(a => a.status === 'A'));
    } catch (err) {
      setAlertConfig({ show: true, title: 'Erro', message: 'Falha ao carregar dados.', type: 'error' });
    } finally { setLoading(false); }
  };

  const getDiasCalendario = () => {
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const dias = [];
    for (let i = 0; i < new Date(ano, mes, 1).getDay(); i++) dias.push(null);
    for (let i = 1; i <= new Date(ano, mes + 1, 0).getDate(); i++) dias.push(new Date(ano, mes, i));
    return dias;
  };

  useEffect(() => {
    if (form.data) {
      const escalasDoDia = gradeMensal.filter(item => item.data?.startsWith(form.data));
      const disponiveis = escalasDoDia.map(esc => {
        const idB = (esc.fk_barbeiro?._id || esc.fk_barbeiro).toString();
        const p = listaCompletaProfissionais.find(lp => lp._id.toString() === idB);
        return p ? { _id: idB, nome: p.nome, foto: p.foto } : null;
      }).filter(p => p !== null);
      setBarbeiros(Array.from(new Map(disponiveis.map(item => [item._id, item])).values()));
    }
  }, [form.data, gradeMensal, listaCompletaProfissionais]);

  const gerarHorariosDisponiveis = () => {
    if (!form.data || !form.fk_barbeiro || !form.tempo) return [];
    
    const escala = gradeMensal.find(g => (g.fk_barbeiro?._id || g.fk_barbeiro).toString() === form.fk_barbeiro && g.data?.startsWith(form.data));
    if (!escala) return [];

    const agora = new Date();
    const hojeStr = agora.toLocaleDateString('en-CA'); // yyyy-mm-dd
    const minutosAgora = (agora.getHours() * 60) + agora.getMinutes();

    const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
    const inicio = toMin(escala.abertura);
    const fim = toMin(escala.fechamento);
    
    const ocupados = todosAgendamentos
      .filter(a => (a.fk_barbeiro?._id || a.fk_barbeiro).toString() === form.fk_barbeiro && a.datahora.startsWith(form.data))
      .map(a => {
        const hStr = a.datahora.split('T')[1].substring(0, 5);
        const start = toMin(hStr);
        return { start, end: start + (a.tempo_estimado || 30) };
      });

    const slots = [];
    for (let c = inicio; c + form.tempo <= fim; c += 20) {
      // VALIDAÇÃO 1: O horário já passou (apenas para o dia de hoje)
      if (form.data === hojeStr && c <= minutosAgora + 10) continue; // +10min de margem

      // VALIDAÇÃO 2: O horário está ocupado
      if (!ocupados.some(o => c < o.end && (c + form.tempo) > o.start)) {
        slots.push(`${Math.floor(c/60).toString().padStart(2,'0')}:${(c%60).toString().padStart(2,'0')}`);
      }
    }
    return slots;
  };

  const handleFinalizar = async () => {
    try {
      setLoading(true);
      const start = new Date(`${form.data}T${form.hora}:00`);
      
      // Validação extra de segurança no clique
      if (start < new Date()) {
        setAlertConfig({ show: true, title: 'Horário Inválido', message: 'Este horário acabou de expirar. Escolha outro.', type: 'error' });
        return;
      }

      const end = new Date(start.getTime() + (form.tempo * 60000));

      const payload = {
        tipoCorte: form.tipoCorte,
        cliente: { nome: form.cliente.nome, numero: form.cliente.numero },
        datahora: start.toISOString(),
        datahora_fim: end.toISOString(),
        tempo_estimado: form.tempo,
        valor: form.valor,
        status: 'A',
        fk_barbeiro: form.fk_barbeiro,
        fk_barbearia: form.fk_barbearia
      };

      await api.post('/agendamentos', payload);
      setAlertConfig({ show: true, title: 'Sucesso!', message: 'Horário agendado com sucesso!', type: 'success' });
      setTimeout(() => navigate(`/${nomeBarbearia}`), 2000);
    } catch (e) {
      setAlertConfig({ show: true, title: 'Erro', message: 'Erro ao processar agendamento.', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-gray-900'} pb-10`}>
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <header className="p-4 md:p-8 max-w-6xl mx-auto flex items-center justify-between">
        <button 
          onClick={() => step === 1 ? navigate(`/${nomeBarbearia}`) : setStep(step - 1)} 
          className={`group flex items-center gap-2 px-5 py-3 rounded-2xl border-2 transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-[#e6b32a]' : 'bg-gray-50 border-gray-100 hover:border-[#e6b32a]'}`}
        >
          <IoArrowBackOutline size={22} className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-black text-xs uppercase tracking-widest">{step === 1 ? 'Sair' : 'Voltar'}</span>
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#e6b32a]' : 'bg-gray-700'}`} />
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4">
        {step === 1 && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
            <h2 className="text-3xl font-black lowercase text-center py-6">Qual o serviço de hoje?</h2>
            <div className="grid grid-cols-1 gap-4">
              {tiposCorte.map((t, idx) => (
                <button 
                  key={idx}
                  onClick={() => { setForm({...form, tipoCorte: t.nome, valor: t.valor, tempo: t.tempo}); setStep(2); }}
                  className={`p-6 rounded-[2rem] border-2 flex justify-between items-center transition-all hover:border-[#e6b32a] ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-gray-50 border-gray-100 shadow-sm'}`}
                >
                  <div className="text-left">
                    <p className="font-black text-xl lowercase">{t.nome}</p>
                    <p className="text-[10px] uppercase opacity-50 font-bold">{t.tempo} min</p>
                  </div>
                  <p className="text-[#e6b32a] font-black text-2xl">R$ {t.valor?.toFixed(2)}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-right-4">
            <div className={`p-8 rounded-[2.5rem] border-2 ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-gray-100 shadow-xl'}`}>
              <div className="flex items-center justify-between mb-8">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#e6b32a]">Selecione o dia</span>
                <div className="flex items-center gap-4 bg-black/10 p-2 rounded-xl">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><IoChevronBack /></button>
                  <span className="text-[10px] font-black uppercase w-20 text-center">{currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><IoChevronForward /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {['D','S','T','Q','Q','S','S'].map((d, index) => (
                   <div key={`header-day-${index}`} className="text-center text-[9px] font-black opacity-30 py-2">{d}</div>
                ))}
                {getDiasCalendario().map((dia, i) => {
                  if (!dia) return <div key={`empty-${i}`} />;
                  const dStr = dia.toLocaleDateString('en-CA');
                  const hojeStr = new Date().toLocaleDateString('en-CA');
                  
                  // VALIDAÇÃO: Se o dia for antes de hoje OU não tiver escala, desativa
                  const isPassado = dStr < hojeStr;
                  const temEscala = gradeMensal.some(g => g.data?.startsWith(dStr));
                  const disp = temEscala && !isPassado;

                  return (
                    <button 
                      key={`day-${dStr}`} disabled={!disp}
                      onClick={() => setForm({...form, data: dStr, fk_barbeiro: '', hora: ''})}
                      className={`aspect-square rounded-2xl flex items-center justify-center text-xs font-black transition-all ${
                        form.data === dStr ? 'bg-[#e6b32a] text-black scale-110' : disp ? 'bg-white/5 hover:bg-white/10' : 'opacity-10'
                      }`}
                    >
                      {dia.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-6">
              {!form.data ? (
                <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-[2.5rem] opacity-30 text-[10px] font-black uppercase">
                  Selecione um dia no calendário
                </div>
              ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                    {barbeiros.map(b => (
                      <button 
                        key={b._id} 
                        onClick={() => setForm({...form, fk_barbeiro: b._id, fk_barbeiroNome: b.nome, hora: ''})}
                        className={`flex-shrink-0 p-4 rounded-3xl border-2 flex flex-col items-center gap-2 min-w-[120px] transition-all ${form.fk_barbeiro === b._id ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-transparent bg-white/5'}`}
                      >
                        <img src={b.foto || `https://ui-avatars.com/api/?name=${b.nome}&background=e6b32a&color=000`} className="w-14 h-14 rounded-2xl object-cover shadow-md" />
                        <p className="font-black text-[10px] lowercase truncate w-full text-center">{b.nome}</p>
                      </button>
                    ))}
                  </div>
                  {form.fk_barbeiro && (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                      {gerarHorariosDisponiveis().map(h => (
                        <button 
                          key={`hour-${h}`} onClick={() => setForm({...form, hora: h})}
                          className={`py-4 rounded-2xl text-[10px] font-black border-2 transition-all ${form.hora === h ? 'bg-[#e6b32a] border-[#e6b32a] text-black' : 'bg-transparent border-white/5 hover:border-[#e6b32a]'}`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
                  <button 
                    disabled={!form.hora}
                    onClick={() => setStep(3)}
                    className="w-full py-6 rounded-[2rem] bg-[#e6b32a] text-black font-black uppercase text-xs tracking-[4px] shadow-xl shadow-[#e6b32a]/20 disabled:opacity-20"
                  >
                    Próximo Passo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-3xl font-black lowercase text-center">Tudo certo? 🏁</h2>
            <div className={`p-8 rounded-[3rem] border-2 space-y-6 ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-gray-100 shadow-2xl'}`}>
              <div className="space-y-4">
                <div className="relative">
                  <IoPersonOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-[#e6b32a]" />
                  <input 
                    type="text" placeholder="Seu nome"
                    className={`w-full p-5 pl-14 rounded-2xl border-2 outline-none text-sm transition-all ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-100'} focus:border-[#e6b32a]`}
                    value={form.cliente.nome}
                    onChange={e => setForm({...form, cliente: {...form.cliente, nome: e.target.value}})}
                  />
                </div>
                <div className="relative">
                  <IoLogoWhatsapp className="absolute left-5 top-1/2 -translate-y-1/2 text-green-500" />
                  <input 
                    type="tel" placeholder="WhatsApp (Opcional)"
                    className={`w-full p-5 pl-14 rounded-2xl border-2 outline-none text-sm transition-all ${isDarkMode ? 'bg-black/20 border-white/10' : 'bg-gray-50 border-gray-100'} focus:border-[#e6b32a]`}
                    value={form.cliente.numero}
                    onChange={e => setForm({...form, cliente: {...form.cliente, numero: e.target.value}})}
                  />
                </div>
              </div>
              <div className="p-6 rounded-3xl bg-white/5 space-y-2 text-xs font-bold uppercase tracking-widest opacity-70">
                <p>{form.tipoCorte} — R$ {form.valor?.toFixed(2)}</p>
                <p className="text-[#e6b32a]">{new Date(form.data + 'T00:00:00').toLocaleDateString()} às {form.hora} com {form.fk_barbeiroNome}</p>
              </div>
            </div>
            <button 
              disabled={!form.cliente.nome || loading}
              onClick={handleFinalizar}
              className="w-full py-8 rounded-[2.5rem] bg-green-600 text-white font-black uppercase text-xs tracking-[5px] shadow-2xl shadow-green-900/40"
            >
              {loading ? 'Agendando...' : 'Finalizar Agendamento'}
            </button>
          </div>
        )}
      </main>
      
      {alertConfig.show && <CustomAlert {...alertConfig} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />}
    </div>
  );
}