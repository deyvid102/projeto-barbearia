import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { 
  IoPricetagOutline, 
  IoTimeOutline, 
  IoPersonOutline, 
  IoCalendarOutline, 
  IoChevronForward, 
  IoChevronBack,
  IoCalendarNumberOutline 
} from 'react-icons/io5';

export default function NovoAgendamento() {
  const { id } = useParams(); // ID do cliente
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [barbeiros, setBarbeiros] = useState([]);
  const [tiposCorte, setTiposCorte] = useState([]);
  const [agendaMensal, setAgendaMensal] = useState(null);
  const [agendamentosOcupados, setAgendamentosOcupados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  
  const [form, setForm] = useState({ 
    tipoCorte: '', 
    fk_barbeiro: '', 
    fk_barbearia: '', 
    data: new Date().toISOString().split('T')[0], 
    hora: '', 
    valor: 0 
  });

  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    carregarDadosIniciais();
  }, []);

  // Sempre que mudar a data ou a barbearia for definida, atualiza a lista de barbeiros
  useEffect(() => {
    if (form.fk_barbearia && form.data) {
      buscarEscalaDoDia();
    }
  }, [form.data, form.fk_barbearia]);

  const carregarDadosIniciais = async () => {
    try {
      setLoading(true);
      // 1. Busca os barbeiros para descobrir a qual barbearia eles pertencem
      const resB = await api.get('/barbeiros');
      const lista = resB.data || resB;
      
      if (lista.length > 0) {
        // Pega a barbearia do primeiro barbeiro encontrado
        const bId = lista[0].fk_barbearia?._id || lista[0].fk_barbearia;
        setForm(prev => ({ ...prev, fk_barbearia: bId }));

        // 2. Busca os serviços dessa barbearia
        const resBarbearia = await api.get(`/barbearias/${bId}`);
        const dadosB = resBarbearia.data || resBarbearia;
        setTiposCorte(dadosB.servicos || []);
      }
    } catch (err) {
      console.error("erro ao carregar dados iniciais");
    } finally {
      setLoading(false);
    }
  };

  const buscarEscalaDoDia = async () => {
    try {
      const dataSel = new Date(form.data + 'T12:00:00');
      const mes = dataSel.getMonth();
      const ano = dataSel.getFullYear();
      const dia = dataSel.getDate();

      // Busca a agenda da barbearia para o mês/ano selecionado
      const res = await api.get(`/barbearias/${form.fk_barbearia}`);
      const dados = res.data || res;
      const agenda = dados.agenda_detalhada;

      // Só prossegue se a agenda existir e for do mês/ano correto
      if (agenda && agenda.mes === mes && agenda.ano === ano) {
        setAgendaMensal(agenda);
        const configDia = agenda.grade.find(g => g.dia === dia);

        if (configDia && configDia.ativo) {
          // IDs dos barbeiros escalados para hoje
          const idsEscalados = configDia.escalas.map(e => e.barbeiroId.toString());
          
          const resTodos = await api.get('/barbeiros');
          const todosBarbeiros = resTodos.data || resTodos;
          
          // Filtra: deve estar na escala E pertencer a esta barbearia
          const disponiveis = todosBarbeiros.filter(b => 
            idsEscalados.includes(b._id.toString()) && 
            (b.fk_barbearia?._id || b.fk_barbearia) === form.fk_barbearia
          );
          
          setBarbeiros(disponiveis);
        } else {
          setBarbeiros([]);
        }
      } else {
        setAgendaMensal(null);
        setBarbeiros([]);
      }
    } catch (error) {
      console.error("erro ao buscar escala");
    }
  };

  const gerarHorarios40Min = () => {
    if (!agendaMensal || !form.data || !form.fk_barbeiro) return [];
    
    const diaSel = new Date(form.data + 'T12:00:00').getDate();
    const configDia = agendaMensal.grade.find(g => g.dia === diaSel);
    if (!configDia) return [];

    const escalaBarbeiro = configDia.escalas.find(e => e.barbeiroId.toString() === form.fk_barbeiro.toString());
    
    // Se o barbeiro tem horário individual usa ele, senão usa o da barbearia
    const inicio = escalaBarbeiro ? escalaBarbeiro.entrada : configDia.abertura;
    const fim = escalaBarbeiro ? escalaBarbeiro.saida : configDia.fechamento;

    const horarios = [];
    let [h, m] = inicio.split(':').map(Number);
    const [hFim, mFim] = fim.split(':').map(Number);
    const totalMinutosFim = hFim * 60 + mFim;

    while ((h * 60 + m) + 40 <= totalMinutosFim) {
      horarios.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
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

  useEffect(() => {
    if (form.fk_barbeiro && form.data) {
      const fetchOcupados = async () => {
        setLoadingHorarios(true);
        try {
          const res = await api.get(`/agendamentos?fk_barbeiro=${form.fk_barbeiro}`);
          const dados = res.data || res;
          setAgendamentosOcupados(Array.isArray(dados) ? dados.filter(a => a.status === 'A') : []);
        } catch (err) { console.error(err); } 
        finally { setLoadingHorarios(false); }
      };
      fetchOcupados();
    }
  }, [form.fk_barbeiro, form.data]);

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
    } catch (err) { alert("erro ao salvar agendamento."); }
  };

  const renderFloatingButton = () => {
    let label = ""; let action = null; let disabled = false;
    if (step === 1) { label = "escolher data"; action = () => setStep(2); disabled = !form.tipoCorte; }
    else if (step === 2) { label = "escolher barbeiro"; action = () => setStep(3); disabled = !form.data; }
    else if (step === 3) { label = "ver horários"; action = () => setStep(4); disabled = !form.fk_barbeiro; }
    else if (step === 4) { label = "finalizar reserva"; action = handleFinalizar; disabled = !form.hora; }

    return (
      <div className="fixed bottom-8 left-0 right-0 px-6 z-[9999] pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button disabled={disabled} onClick={action} className={`w-full py-5 font-black uppercase text-[11px] tracking-widest rounded-3xl shadow-2xl transition-all duration-300 ${disabled ? 'bg-gray-200 dark:bg-[#181818] text-gray-400 dark:text-gray-700' : 'bg-[#e6b32a] text-black'}`}>
            {label}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-gray-100 p-6 font-sans pb-40 transition-colors">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="w-10 h-10 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/10 text-gray-400">←</button>
            <div>
              <h1 className="text-2xl font-black italic lowercase tracking-tighter">novo.agendamento</h1>
              <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[3px]">etapa {step} de 4</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-[#e6b32a]' : 'bg-black/5 dark:bg-white/5'}`} />)}
          </div>
        </header>

        <main className="bg-white dark:bg-[#0d0d0d] rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-2xl p-6 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#e6b32a]"><IoPricetagOutline size={18} /><h2 className="text-sm font-black uppercase tracking-widest">o que vamos fazer?</h2></div>
              <div className="grid gap-3">
                {tiposCorte.map((t, idx) => (
                  <div key={idx} onClick={() => setForm({...form, tipoCorte: t.nome, valor: t.valor})} className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${form.tipoCorte === t.nome ? 'border-[#e6b32a] bg-[#e6b32a]/5' : 'border-black/5 dark:bg-black'}`}>
                    <p className={`text-lg font-black lowercase ${form.tipoCorte === t.nome ? 'dark:text-white' : 'text-gray-400'}`}>{t.nome}</p>
                    <div className={`px-4 py-2 rounded-xl font-mono font-black ${form.tipoCorte === t.nome ? 'bg-[#e6b32a] text-black' : 'text-[#e6b32a] bg-black/5'}`}>R${t.valor.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-[#e6b32a]"><IoCalendarOutline size={18} /><h2 className="text-sm font-black uppercase tracking-widest">para quando?</h2></div>
                <button onClick={() => setShowFullCalendar(!showFullCalendar)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#e6b32a]/10 border border-[#e6b32a]/20 text-[#e6b32a]">
                  <IoCalendarNumberOutline size={16} /><span className="text-[9px] font-black uppercase">{showFullCalendar ? 'voltar' : 'calendário'}</span>
                </button>
              </div>

              {showFullCalendar ? (
                <div className="animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center mb-4">
                    <button onClick={() => mudarMes(-1)} className="p-2"><IoChevronBack /></button>
                    <span className="font-black text-xs uppercase">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => mudarMes(1)} className="p-2"><IoChevronForward /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {getDiasNoMes(currentMonth.getMonth(), currentMonth.getFullYear()).map((dia, i) => {
                      const dStr = dia.toISOString().split('T')[0];
                      const isPast = dStr < new Date().toISOString().split('T')[0];
                      return (
                        <button key={i} disabled={isPast} onClick={() => { setForm({...form, data: dStr, fk_barbeiro: '', hora: ''}); setShowFullCalendar(false); }} className={`aspect-square rounded-lg text-[10px] font-bold ${form.data === dStr ? 'bg-[#e6b32a] text-black' : isPast ? 'opacity-10' : 'bg-black/5 dark:bg-white/5'}`}>{dia.getDate()}</button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  {[0,1,2,3,4,5].map(i => {
                    const d = new Date(); d.setDate(d.getDate() + i);
                    const dStr = d.toISOString().split('T')[0];
                    return (
                      <button key={dStr} onClick={() => setForm({...form, data: dStr, fk_barbeiro: '', hora: ''})} className={`p-5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${form.data === dStr ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-black/5 dark:bg-black'}`}>
                        <span className="text-[9px] uppercase font-black text-gray-500">{d.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                        <span className="text-lg font-black">{d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#e6b32a]"><IoPersonOutline size={18} /><h2 className="text-sm font-black uppercase tracking-widest">com quem?</h2></div>
              <div className="grid gap-3">
                {barbeiros.length > 0 ? barbeiros.map(b => (
                  <div key={b._id} onClick={() => setForm({...form, fk_barbeiro: b._id.toString(), hora: ''})} className={`p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${form.fk_barbeiro === b._id.toString() ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-black/5 dark:bg-black'}`}>
                    <span className={`font-black lowercase ${form.fk_barbeiro === b._id.toString() ? 'text-[#e6b32a]' : 'dark:text-white'}`}>{b.nome}</span>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-50 flex flex-col items-center gap-2">
                    <span className="text-[10px] font-black uppercase italic">Nenhum barbeiro disponível.</span>
                    <p className="text-[8px] max-w-[200px]">Isso acontece se a agenda para o mês de {new Date(form.data + 'T12:00:00').toLocaleDateString('pt-BR', {month: 'long'})} não foi publicada.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#e6b32a]"><IoTimeOutline size={18} /><h2 className="text-sm font-black uppercase tracking-widest">horários</h2></div>
              <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {loadingHorarios ? <div className="col-span-3 text-center py-10 animate-pulse text-[10px] font-black italic">checando horários...</div> : 
                  gerarHorarios40Min().map(h => {
                    const ocupado = agendamentosOcupados.some(a => a.datahora.startsWith(`${form.data}T${h}:00`)) || (new Date(`${form.data}T${h}:00`) < new Date());
                    return (
                      <button key={h} disabled={ocupado} onClick={() => setForm({...form, hora: h})} className={`p-4 rounded-xl border text-xs font-bold transition-all ${form.hora === h ? 'border-[#e6b32a] bg-[#e6b32a] text-black' : ocupado ? 'opacity-10 pointer-events-none' : 'border-black/5 dark:bg-black text-gray-400'}`}>{h}</button>
                    );
                  })
                }
              </div>
            </div>
          )}
        </main>
      </div>
      {renderFloatingButton()}
    </div>
  );
}