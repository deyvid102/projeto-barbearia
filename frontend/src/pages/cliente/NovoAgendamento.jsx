import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import CustomAlert from '../../components/CustomAlert';

import { 
  IoPricetagOutline, IoCalendarOutline, IoChevronForward, 
  IoChevronBack, IoArrowBackOutline, IoPersonOutline, 
  IoCheckmarkCircleOutline, IoSearchOutline, IoGlobeOutline
} from 'react-icons/io5';

// Lista expandida com os principais países que utilizam WhatsApp
const countryCodes = [
  { name: 'Brasil', code: '+55', iso: 'BR', flag: '🇧🇷' },
  { name: 'Portugal', code: '+351', iso: 'PT', flag: '🇵🇹' },
  { name: 'Estados Unidos', code: '+1', iso: 'US', flag: '🇺🇸' },
  { name: 'Angola', code: '+244', iso: 'AO', flag: '🇦🇴' },
  { name: 'Moçambique', code: '+258', iso: 'MZ', flag: '🇲🇿' },
  { name: 'Cabo Verde', code: '+238', iso: 'CV', flag: '🇨🇻' },
  { name: 'Espanha', code: '+34', iso: 'ES', flag: '🇪🇸' },
  { name: 'Reino Unido', code: '+44', iso: 'GB', flag: '🇬🇧' },
  { name: 'França', code: '+33', iso: 'FR', flag: '🇫🇷' },
  { name: 'Itália', code: '+39', iso: 'IT', flag: '🇮🇹' },
  { name: 'Argentina', code: '+54', iso: 'AR', flag: '🇦🇷' },
  { name: 'Chile', code: '+56', iso: 'CL', flag: '🇨🇱' },
  { name: 'Colômbia', code: '+57', iso: 'CO', flag: '🇨🇴' },
  { name: 'México', code: '+52', iso: 'MX', flag: '🇲🇽' },
  { name: 'Paraguai', code: '+595', iso: 'PY', flag: '🇵🇾' },
  { name: 'Uruguai', code: '+598', iso: 'UY', flag: '🇺🇾' },
  { name: 'Alemanha', code: '+49', iso: 'DE', flag: '🇩🇪' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function NovoAgendamento() {
  const { nomeBarbearia } = useParams(); 
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(true);
  const [tiposCorte, setTiposCorte] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [listaCompletaProfissionais, setListaCompletaProfissionais] = useState([]); 
  const [gradeMensal, setGradeMensal] = useState([]); 
  const [todosAgendamentos, setTodosAgendamentos] = useState([]); 
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', type: 'error' });
  
  const [showDdiModal, setShowDdiModal] = useState(false);
  const [searchDdi, setSearchDdi] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes.find(c => c.iso === 'BR') || countryCodes[0]);

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

      const profissionais = Array.isArray(resB) ? resB : (resB.data || []);
      setListaCompletaProfissionais(profissionais.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === String(idReal)));
      setGradeMensal(Array.isArray(resG) ? resG : (resG.data || []));
      setTodosAgendamentos((Array.isArray(resA) ? resA : (resA.data || [])).filter(a => a.status === 'A'));
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
    const hojeStr = agora.toLocaleDateString('en-CA');
    const minutosAgora = (agora.getHours() * 60) + agora.getMinutes();
    const toMin = (s) => { const [h, m] = s.split(':').map(Number); return h * 60 + m; };
    const inicio = toMin(escala.abertura);
    const fim = toMin(escala.fechamento);
    const ocupados = todosAgendamentos
      .filter(a => (a.fk_barbeiro?._id || a.fk_barbeiro).toString() === form.fk_barbeiro && a.datahora.startsWith(form.data))
      .map(a => {
        const start = toMin(a.datahora.split('T')[1].substring(0, 5));
        return { start, end: start + (a.tempo_estimado || 30) };
      });

    const slots = [];
    for (let c = inicio; c + form.tempo <= fim; c += 20) {
      if (form.data === hojeStr && c <= minutosAgora + 15) continue; 
      if (!ocupados.some(o => c < o.end && (c + form.tempo) > o.start)) {
        slots.push(`${Math.floor(c/60).toString().padStart(2,'0')}:${(c%60).toString().padStart(2,'0')}`);
      }
    }
    return slots;
  };

  // Função de Máscara Baseada no input +00 (00) 0 0000-0000
  const aplicarMascaraTelefone = (valor) => {
    let v = valor.replace(/\D/g, ''); // Remove tudo que não é dígito
    if (selectedCountry.iso === 'BR') {
      if (v.length > 11) v = v.substring(0, 11);
      if (v.length > 10) {
        v = v.replace(/^(\d{2})(\d{1})(\d{4})(\d{4})$/, "($1) $2 $3-$4");
      } else if (v.length > 6) {
        v = v.replace(/^(\d{2})(\d{4})(\d{0,4})$/, "($1) $2-$3");
      } else if (v.length > 2) {
        v = v.replace(/^(\d{2})(\d{0,5})$/, "($1) $2");
      } else if (v.length > 0) {
        v = v.replace(/^(\d*)$/, "($1");
      }
    }
    return v;
  };

  const handleFinalizar = async () => {
    try {
      setLoading(true);
      
      const numeroLimpo = form.cliente.numero.replace(/\D/g, '');
      const ddiLimpo = selectedCountry.code.replace('+', '');
      const numeroFinal = `${ddiLimpo}${numeroLimpo}`;

      const start = new Date(`${form.data}T${form.hora}:00`);
      const payload = {
        tipoCorte: form.tipoCorte,
        cliente: { 
          nome: form.cliente.nome, 
          numero: numeroFinal 
        },
        datahora: start.toISOString(),
        datahora_fim: new Date(start.getTime() + (form.tempo * 60000)).toISOString(),
        tempo_estimado: form.tempo,
        valor: form.valor, status: 'A',
        fk_barbeiro: form.fk_barbeiro, fk_barbearia: form.fk_barbearia
      };

      await api.post('/agendamentos', payload);
      setAlertConfig({ show: true, title: 'Sucesso!', message: 'Horário reservado!', type: 'success' });
      setTimeout(() => navigate(`/${nomeBarbearia}`), 2000);
    } catch (e) {
      setAlertConfig({ show: true, title: 'Erro', message: 'Falha ao agendar.', type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 pb-10 font-sans">
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md p-4 md:p-8 max-w-6xl mx-auto flex items-center justify-between">
        <button 
          onClick={() => step === 1 ? navigate(`/${nomeBarbearia}`) : setStep(step - 1)} 
          className="p-3 rounded-2xl border border-gray-100 bg-gray-50 active:scale-95 transition-all"
        >
          <IoArrowBackOutline size={22} />
        </button>
        <div className="flex gap-2">
          {[1, 2, 3].map(s => (
            <div key={s} className={`h-1.5 w-8 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#e6b32a]' : 'bg-gray-200'}`} />
          ))}
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-4 md:p-6">
        
        {step === 1 && (
           <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4">
           <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter text-center py-4 uppercase">O que vamos fazer hoje?</h2>
           <div className="grid grid-cols-1 gap-3">
             {tiposCorte.map((t, idx) => (
               <button 
                 key={idx}
                 onClick={() => { setForm({...form, tipoCorte: t.nome, valor: t.valor, tempo: t.tempo}); setStep(2); }}
                 className="p-5 md:p-6 rounded-[2rem] border border-gray-100 bg-gray-50 flex justify-between items-center transition-all hover:border-[#e6b32a] hover:bg-white shadow-sm"
               >
                 <div className="text-left">
                   <p className="font-black text-lg md:text-xl lowercase">{t.nome}</p>
                   <p className="text-[10px] uppercase opacity-40 font-bold tracking-widest">{t.tempo} min</p>
                 </div>
                 <p className="text-[#e6b32a] font-black text-xl md:text-2xl">R$ {t.valor?.toFixed(2)}</p>
               </button>
             ))}
           </div>
         </div>
        )}

        {step === 2 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start animate-in fade-in slide-in-from-right-4">
             <div className="p-6 md:p-8 rounded-[2.5rem] border border-gray-100 bg-white shadow-xl">
              <div className="flex items-center justify-between mb-8 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#e6b32a]">Selecione o dia</span>
                <div className="flex items-center gap-3 bg-gray-50 p-2 rounded-xl">
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}><IoChevronBack /></button>
                  <span className="text-[10px] font-black uppercase w-20 text-center">{currentMonth.toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' })}</span>
                  <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}><IoChevronForward /></button>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-1 md:gap-2">
                {['D','S','T','Q','Q','S','S'].map((d, i) => <div key={i} className="text-center text-[9px] font-black opacity-30 py-2">{d}</div>)}
                {getDiasCalendario().map((dia, i) => {
                  if (!dia) return <div key={`empty-${i}`} />;
                  const dStr = dia.toLocaleDateString('en-CA');
                  const disp = gradeMensal.some(g => g.data?.startsWith(dStr)) && dStr >= new Date().toLocaleDateString('en-CA');
                  return (
                    <button 
                      key={dStr} disabled={!disp}
                      onClick={() => setForm({...form, data: dStr, fk_barbeiro: '', hora: ''})}
                      className={`aspect-square rounded-2xl flex items-center justify-center text-xs md:text-sm font-black transition-all ${
                        form.data === dStr ? 'bg-[#e6b32a] text-white scale-110 shadow-lg' : disp ? 'bg-gray-50 hover:bg-gray-100' : 'opacity-10'
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
                <div className="h-48 md:h-64 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 rounded-[2.5rem] opacity-40 text-[10px] font-black uppercase">
                  Escolha uma data no calendário
                </div>
              ) : (
                <div className="space-y-6 animate-in slide-in-from-bottom-4">
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1">
                    {barbeiros.map(b => (
                      <button 
                        key={b._id} 
                        onClick={() => setForm({...form, fk_barbeiro: b._id, fk_barbeiroNome: b.nome, hora: ''})}
                        className={`flex-shrink-0 p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 min-w-[110px] ${form.fk_barbeiro === b._id ? 'border-[#e6b32a] bg-[#e6b32a]/5' : 'border-transparent bg-gray-50'}`}
                      >
                        <img src={b.foto || `https://ui-avatars.com/api/?name=${b.nome}&background=e6b32a&color=fff`} className="w-12 h-12 md:w-14 md:h-14 rounded-2xl object-cover" />
                        <p className="font-black text-[9px] uppercase truncate w-full text-center">{b.nome}</p>
                      </button>
                    ))}
                  </div>
                  {form.fk_barbeiro && (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
                      {gerarHorariosDisponiveis().map(h => (
                        <button 
                          key={h} onClick={() => setForm({...form, hora: h})}
                          className={`py-4 rounded-2xl text-[10px] font-black border-2 transition-all ${form.hora === h ? 'bg-[#e6b32a] border-[#e6b32a] text-white shadow-md' : 'bg-white border-gray-100 hover:border-[#e6b32a]'}`}
                        >
                          {h}
                        </button>
                      ))}
                    </div>
                  )}
                  <button 
                    disabled={!form.hora} onClick={() => setStep(3)}
                    className="w-full py-6 rounded-[2rem] bg-[#e6b32a] text-white font-black uppercase text-xs tracking-[4px] shadow-xl shadow-[#e6b32a]/20 disabled:opacity-20"
                  >
                    Próximo Passo
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in-95 duration-500 pb-20 md:pb-0">
            <div className="text-center space-y-2">
              <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">Identificação</h2>
              <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40 text-[#e6b32a]">Preencha para confirmar o horário</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-10">
              <div className="p-8 md:p-10 rounded-[3rem] border border-gray-100 bg-gray-50 flex flex-col justify-between">
                <div className="space-y-6">
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#e6b32a]"><IoCalendarOutline size={22}/></div>
                    <div><p className="text-[9px] font-black uppercase opacity-40">Agendamento</p><p className="font-bold text-sm md:text-base">{new Date(form.data + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })} às {form.hora}</p></div>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-[#e6b32a]"><IoPersonOutline size={22}/></div>
                    <div><p className="text-[9px] font-black uppercase opacity-40">Profissional</p><p className="font-bold text-sm md:text-base">{form.fk_barbeiroNome}</p></div>
                  </div>
                </div>
                <div className="pt-8 mt-8 border-t border-gray-200 flex justify-between items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-40">Investimento</span>
                  <span className="text-3xl font-black text-[#e6b32a]">R$ {form.valor?.toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="p-8 md:p-10 rounded-[3rem] bg-white border-2 border-gray-50 shadow-2xl space-y-6">
                  <div className="relative">
                    <label className="absolute -top-2.5 left-6 bg-white px-2 text-[9px] font-black uppercase tracking-widest text-[#e6b32a] z-10">Nome Completo</label>
                    <input 
                      type="text"
                      className="w-full p-5 rounded-2xl border-2 border-gray-100 outline-none text-sm font-bold focus:border-[#e6b32a] transition-all bg-gray-50/30"
                      value={form.cliente.nome}
                      onChange={e => setForm({...form, cliente: {...form.cliente, nome: e.target.value}})}
                    />
                  </div>

                  <div className="relative">
                    <label className="absolute -top-2.5 left-6 bg-white px-2 text-[9px] font-black uppercase tracking-widest text-green-600 z-10">WhatsApp</label>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => setShowDdiModal(true)}
                        className="flex items-center gap-2 px-4 rounded-2xl border-2 border-gray-100 bg-gray-50/30 hover:border-green-500 transition-all active:scale-95"
                      >
                        <span className="text-lg">{selectedCountry.flag}</span>
                        <span className="text-xs font-black">{selectedCountry.code}</span>
                      </button>

                      <input 
                        type="tel"
                        placeholder={selectedCountry.iso === 'BR' ? "(00) 0 0000-0000" : "Número"}
                        className="flex-1 p-5 rounded-2xl border-2 border-gray-100 outline-none text-sm font-bold focus:border-green-500 transition-all bg-gray-50/30"
                        value={form.cliente.numero}
                        onChange={e => setForm({...form, cliente: {...form.cliente, numero: aplicarMascaraTelefone(e.target.value)}})}
                      />
                    </div>
                  </div>
                </div>

                <button 
                  disabled={!form.cliente.nome || !form.cliente.numero || loading}
                  onClick={handleFinalizar}
                  className="w-full py-6 md:py-8 rounded-2xl md:rounded-[3rem] bg-[#e6b32a] text-white font-black uppercase text-xs tracking-[4px] shadow-xl shadow-[#e6b32a]/30 active:scale-95 transition-all"
                >
                  {loading ? 'Reservando...' : 'Confirmar Agendamento'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {showDdiModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowDdiModal(false)} />
          <div className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 focus-within:border-[#e6b32a] transition-all">
                <IoSearchOutline className="text-gray-400" />
                <input 
                  autoFocus
                  type="text" placeholder="Buscar país ou DDI..."
                  className="bg-transparent outline-none text-xs font-bold w-full"
                  value={searchDdi}
                  onChange={e => setSearchDdi(e.target.value)}
                />
              </div>
            </div>
            <div className="max-h-[350px] overflow-y-auto p-2 scrollbar-hide">
              {countryCodes
                .filter(c => c.name.toLowerCase().includes(searchDdi.toLowerCase()) || c.code.includes(searchDdi))
                .map((c, i) => (
                  <button 
                    key={i}
                    onClick={() => { setSelectedCountry(c); setShowDdiModal(false); setForm({...form, cliente: {...form.cliente, numero: ''}})}}
                    className="w-full flex items-center justify-between p-4 rounded-2xl hover:bg-gray-50 transition-all active:bg-gray-100"
                  >
                    <div className="flex items-center gap-4">
                      <span className="text-2xl">{c.flag}</span>
                      <div className="text-left">
                        <p className="text-[10px] font-black uppercase opacity-40">{c.iso}</p>
                        <p className="font-bold text-sm">{c.name}</p>
                      </div>
                    </div>
                    <span className="text-xs font-black text-[#e6b32a]">{c.code}</span>
                  </button>
                ))}
            </div>
            <button 
              onClick={() => setShowDdiModal(false)}
              className="w-full py-5 bg-gray-50 text-[10px] font-black uppercase tracking-widest border-t border-gray-100"
            >
              Fechar
            </button>
          </div>
        </div>
      )}
      
      {alertConfig.show && <CustomAlert {...alertConfig} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />}
    </div>
  );
}