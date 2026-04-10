import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';

// Ícones
import { 
  IoCalendarOutline, IoChevronForward, 
  IoChevronBack, IoPersonOutline, 
  IoSearchOutline, IoCheckmarkDoneOutline,
  IoTimeOutline, IoCashOutline
} from 'react-icons/io5';

import BarbeariasLayout from '../../layout/barbeariasLayout';

const countryCodes = [
  { name: 'Brasil', code: '+55', iso: 'BR', flag: '🇧🇷' },
  { name: 'Portugal', code: '+351', iso: 'PT', flag: '🇵🇹' },
  { name: 'Estados Unidos', code: '+1', iso: 'US', flag: '🇺🇸' },
  { name: 'Angola', code: '+244', iso: 'AO', flag: '🇦🇴' },
].sort((a, b) => a.name.localeCompare(b.name));

export default function NovoAgendamento() {
  const { nomeBarbearia } = useParams(); 
  const navigate = useNavigate();
  
  // Estados de Fluxo e Dados
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(true);
  const [dadosBarbearia, setDadosBarbearia] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Listas do Backend
  const [tiposCorte, setTiposCorte] = useState([]);
  const [barbeirosDaBarbearia, setBarbeirosDaBarbearia] = useState([]);
  const [agendasSemanais, setAgendasSemanais] = useState([]); 
  const [agendamentosExistentes, setAgendamentosExistentes] = useState([]); 
  
  // Estados de Interface
  const [showDdiModal, setShowDdiModal] = useState(false);
  const [searchDdi, setSearchDdi] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes.find(c => c.iso === 'BR'));
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Estado do Formulário
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

  useEffect(() => {
    if (nomeBarbearia) carregarDados();
  }, [nomeBarbearia]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // 1. Busca perfil da barbearia
      const barbearia = await api.get(`/barbearias/perfil/${nomeBarbearia}`);
      const idB = barbearia._id;
      setDadosBarbearia(barbearia);
      setTiposCorte(barbearia.servicos || []);
      setForm(prev => ({ ...prev, fk_barbearia: idB }));

      // 2. Busca Barbeiros, Agendas e Agendamentos em paralelo
      const [resBarbeiros, resAgendas, resAgendamentos] = await Promise.all([
        api.get(`/barbeiros/barbearia/${idB}`),
        api.get(`/agendas/barbearia/${idB}`),
        api.get(`/agendamentos/barbearia/${idB}`)
      ]);

      setBarbeirosDaBarbearia(resBarbeiros.data || []);
      setAgendasSemanais(resAgendas.data || []);
      setAgendamentosExistentes(resAgendamentos.data || []);
    } catch (err) {
      console.error("Erro na carga estrutural:", err);
    } finally {
      setLoading(false);
    }
  };

  // Funções de Lógica de Horários
  const toMin = (hhmm) => {
    const [h, m] = hhmm.split(':').map(Number);
    return h * 60 + m;
  };

  const formatMinToHHMM = (minutos) => {
    const h = Math.floor(minutos / 60).toString().padStart(2, '0');
    const m = (minutos % 60).toString().padStart(2, '0');
    return `${h}:${m}`;
  };

  const getHorariosDisponiveis = () => {
    if (!form.data || !form.fk_barbeiro || !form.tempo) return [];

    const dataObj = new Date(form.data + 'T12:00:00');
    const diaSemana = dataObj.getDay(); // 0-6

    const agendaDoBarbeiro = agendasSemanais.find(a => 
      String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(form.fk_barbeiro)
    );

    const configuracaoDia = agendaDoBarbeiro?.grade?.find(g => g.dia_semana === diaSemana);
    
    if (!configuracaoDia || configuracaoDia.status !== 'ativo') return [];

    const inicioExp = toMin(configuracaoDia.abertura);
    const fimExp = toMin(configuracaoDia.fechamento);
    const intervalos = configuracaoDia.intervalos || [];

    // Agendamentos ocupados no dia selecionado
    const ocupados = agendamentosExistentes
      .filter(a => {
        const mesmoBarbeiro = String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(form.fk_barbeiro);
        const mesmaData = a.datahora.split('T')[0] === form.data;
        return mesmoBarbeiro && mesmaData && (a.status === 'A' || a.status === 'P');
      })
      .map(a => {
        const d = new Date(a.datahora);
        const start = d.getUTCHours() * 60 + d.getUTCMinutes();
        return { start, end: start + (a.tempo_estimado || 30) };
      });

    const slots = [];
    const agora = new Date();
    const hojeStr = agora.toLocaleDateString('en-CA');
    const minutosAgora = (agora.getHours() * 60) + agora.getMinutes();

    // Gera slots de 20 em 20 minutos
    for (let curr = inicioExp; curr + form.tempo <= fimExp; curr += 20) {
      // Regra de segurança para agendamentos no mesmo dia
      if (form.data === hojeStr && curr <= minutosAgora + 30) continue;

      const currEnd = curr + form.tempo;

      // Verifica Intervalos (Almoço/Pausa)
      const isIntervalo = intervalos.some(i => (curr < toMin(i.fim) && currEnd > toMin(i.inicio)));
      
      // Verifica Conflitos de Agendamento
      const isOcupado = ocupados.some(o => (curr < o.end && currEnd > o.start));

      if (!isIntervalo && !isOcupado) {
        slots.push(formatMinToHHMM(curr));
      }
    }
    return slots;
  };

  const handleFinalizar = async () => {
    try {
      setLoading(true);
      const ddi = selectedCountry.code.replace('+', '');
      const numero = form.cliente.numero.replace(/\D/g, '');
      
      const [ano, mes, dia] = form.data.split('-').map(Number);
      const [hora, min] = form.hora.split(':').map(Number);
      const dataISO = new Date(ano, mes - 1, dia, hora, min).toISOString();

      await api.post('/agendamentos', {
        ...form,
        datahora: dataISO,
        cliente: { nome: form.cliente.nome, numero: `${ddi}${numero}` },
        status: 'A',
        tempo_estimado: form.tempo
      });

      setShowSuccessModal(true);
    } catch (e) {
      alert("Erro ao processar agendamento. Tente outro horário.");
    } finally {
      setLoading(false);
    }
  };

  // Renderização do Calendário
  const diasCalendario = () => {
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const totalDias = new Date(ano, mes + 1, 0).getDate();
    const primeiroDiaSemana = new Date(ano, mes, 1).getDay();
    
    const arrayDias = [];
    for (let i = 0; i < primeiroDiaSemana; i++) arrayDias.push(null);
    for (let i = 1; i <= totalDias; i++) arrayDias.push(new Date(ano, mes, i));
    return arrayDias;
  };

  if (loading && !dadosBarbearia) return <div className="h-screen flex items-center justify-center">Carregando estrutura...</div>;

  return (
    <BarbeariasLayout 
      view="agendamento" 
      barbearia={dadosBarbearia}
      handleVoltar={() => step === 1 ? navigate(-1) : setStep(step - 1)}
    >
      {/* Etapa 1: Serviços */}
      {step === 1 && (
        <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in duration-500">
          <h2 className="text-3xl font-black italic uppercase tracking-tighter text-center mb-8">O que vamos fazer hoje?</h2>
          {tiposCorte.map((servico, idx) => (
            <button 
              key={idx}
              onClick={() => {
                setForm({...form, tipoCorte: servico.nome, valor: servico.valor, tempo: servico.tempo});
                setStep(2);
              }}
              className="w-full p-6 rounded-[2rem] bg-gray-50 border border-gray-100 flex justify-between items-center hover:border-[#e6b32a] transition-all group"
            >
              <div className="text-left">
                <span className="block font-black text-xl lowercase">{servico.nome}</span>
                <span className="text-[10px] font-bold uppercase opacity-40 flex items-center gap-1">
                  <IoTimeOutline /> {servico.tempo} min
                </span>
              </div>
              <div className="text-right">
                <span className="block text-[#e6b32a] font-black text-2xl">R$ {servico.valor?.toFixed(2)}</span>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Etapa 2: Data, Barbeiro e Hora */}
      {step === 2 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-right-10 duration-500">
          {/* Calendário */}
          <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-50">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black uppercase text-[10px] tracking-[3px] text-[#e6b32a]">Selecione o Dia</h3>
              <div className="flex gap-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))}><IoChevronBack /></button>
                <span className="font-black text-[10px] uppercase">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))}><IoChevronForward /></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-2 text-center">
              {['D','S','T','Q','Q','S','S'].map(d => <div key={d} className="text-[9px] font-black opacity-20 mb-2">{d}</div>)}
              {diasCalendario().map((dia, i) => {
                if (!dia) return <div key={i} />;
                const dStr = dia.toLocaleDateString('en-CA');
                const isPast = dStr < new Date().toLocaleDateString('en-CA');
                const isSelected = form.data === dStr;
                
                return (
                  <button
                    key={i}
                    disabled={isPast}
                    onClick={() => setForm({...form, data: dStr, fk_barbeiro: '', hora: ''})}
                    className={`aspect-square rounded-2xl flex items-center justify-center text-sm font-black transition-all ${
                      isSelected ? 'bg-[#e6b32a] text-white shadow-lg scale-110' : isPast ? 'opacity-10' : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                  >
                    {dia.getDate()}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Seleção de Barbeiro e Horário */}
          <div className="space-y-6">
            {form.data && (
              <>
                <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide">
                  {barbeirosDaBarbearia.map(b => (
                    <button 
                      key={b._id}
                      onClick={() => setForm({...form, fk_barbeiro: b._id, fk_barbeiroNome: b.nome, hora: ''})}
                      className={`flex-shrink-0 p-4 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-2 min-w-[120px] ${
                        form.fk_barbeiro === b._id ? 'border-[#e6b32a] bg-[#e6b32a]/5' : 'border-transparent bg-gray-50'
                      }`}
                    >
                      <img src={b.foto || `https://ui-avatars.com/api/?name=${b.nome}&background=e6b32a&color=fff`} className="w-14 h-14 rounded-2xl object-cover" />
                      <span className="font-black text-[9px] uppercase">{b.nome}</span>
                    </button>
                  ))}
                </div>

                {form.fk_barbeiro && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {getHorariosDisponiveis().map(h => (
                      <button 
                        key={h}
                        onClick={() => setForm({...form, hora: h})}
                        className={`py-4 rounded-2xl font-black text-[10px] border-2 transition-all ${
                          form.hora === h ? 'bg-[#e6b32a] border-[#e6b32a] text-white' : 'bg-white border-gray-100 hover:border-[#e6b32a]'
                        }`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
                )}
                
                <button 
                  disabled={!form.hora}
                  onClick={() => setStep(3)}
                  className="w-full py-6 rounded-[2rem] bg-[#e6b32a] text-white font-black uppercase text-xs tracking-[4px] disabled:opacity-20 shadow-xl shadow-[#e6b32a]/20"
                >
                  Continuar
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Etapa 3: Revisão e Dados do Cliente */}
      {step === 3 && (
        <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 animate-in zoom-in-95 duration-500">
          <div className="p-10 rounded-[3rem] bg-gray-900 text-white space-y-8 relative overflow-hidden">
             <div className="relative z-10 space-y-6">
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-[2px]">Serviço Selecionado</p>
                  <p className="text-2xl font-black italic">{form.tipoCorte}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#e6b32a]"><IoCalendarOutline size={20}/></div>
                  <div>
                    <p className="text-[9px] font-black uppercase opacity-40">Data e Hora</p>
                    <p className="font-bold">{new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR')} às {form.hora}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-[#e6b32a]"><IoPersonOutline size={20}/></div>
                  <div>
                    <p className="text-[9px] font-black uppercase opacity-40">Profissional</p>
                    <p className="font-bold">{form.fk_barbeiroNome}</p>
                  </div>
                </div>
                <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                   <span className="text-3xl font-black text-[#e6b32a]">R$ {form.valor?.toFixed(2)}</span>
                </div>
             </div>
          </div>

          <div className="space-y-4">
             <div className="p-8 rounded-[3rem] bg-white border border-gray-100 shadow-2xl space-y-6">
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-[#e6b32a] mb-2 block ml-2">Seu Nome</label>
                  <input 
                    type="text" 
                    className="w-full p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-[#e6b32a] outline-none font-bold"
                    onChange={e => setForm({...form, cliente: {...form.cliente, nome: e.target.value}})}
                  />
                </div>
                <div className="relative">
                  <label className="text-[9px] font-black uppercase text-green-600 mb-2 block ml-2">WhatsApp</label>
                  <div className="flex gap-2">
                    <button onClick={() => setShowDdiModal(true)} className="px-4 bg-gray-50 rounded-2xl font-bold border-2 border-transparent">{selectedCountry.flag} {selectedCountry.code}</button>
                    <input 
                      type="tel" 
                      className="flex-1 p-5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-green-500 outline-none font-bold"
                      placeholder="(00) 0 0000-0000"
                      onChange={e => setForm({...form, cliente: {...form.cliente, numero: e.target.value}})}
                    />
                  </div>
                </div>
             </div>
             <button 
                onClick={handleFinalizar}
                disabled={!form.cliente.nome || loading}
                className="w-full py-8 rounded-[3rem] bg-[#e6b32a] text-white font-black uppercase text-xs tracking-[5px] shadow-2xl shadow-[#e6b32a]/40"
             >
               {loading ? "Processando..." : "Confirmar Agendamento"}
             </button>
          </div>
        </div>
      )}

      {/* Modal de Sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-[500] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="bg-white p-10 rounded-[3rem] max-w-sm w-full text-center space-y-6 animate-in zoom-in-90">
             <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto"><IoCheckmarkDoneOutline size={50}/></div>
             <h3 className="text-3xl font-black italic uppercase italic tracking-tighter">Reservado!</h3>
             <p className="text-xs font-bold opacity-40">Seu horário foi agendado e o profissional notificado.</p>
             <button onClick={() => navigate(`/${nomeBarbearia}`)} className="w-full py-5 rounded-2xl bg-black text-white font-black uppercase text-[10px] tracking-[2px]">Voltar ao início</button>
          </div>
        </div>
      )}
    </BarbeariasLayout>
  );
}