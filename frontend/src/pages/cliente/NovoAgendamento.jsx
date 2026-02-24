import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { 
  IoPricetagOutline, 
  IoTimeOutline, 
  IoPersonOutline, 
  IoCalendarOutline, 
  IoChevronForward, 
  IoChevronBack,
  IoCalendarNumberOutline // Novo ícone para o botão
} from 'react-icons/io5';

export default function NovoAgendamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [barbeiros, setBarbeiros] = useState([]);
  const [tiposCorte, setTiposCorte] = useState([]);
  const [agendamentosOcupados, setAgendamentosOcupados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  
  const [form, setForm] = useState({ 
    tipoCorte: '', 
    fk_barbeiro: '', 
    fk_barbearia: '', 
    data: '', 
    hora: '', 
    valor: 0 
  });

  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const horariosBase = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  useEffect(() => {
    const carregarDadosIniciais = async () => {
      try {
        setLoading(true);
        const resBarbeiros = await api.get('/barbeiros');
        const listaBarbeiros = resBarbeiros.data || resBarbeiros;
        setBarbeiros(listaBarbeiros);

        if (listaBarbeiros.length > 0) {
          const bId = listaBarbeiros[0].fk_barbearia?._id || listaBarbeiros[0].fk_barbearia;
          setForm(prev => ({ ...prev, fk_barbearia: bId }));
          const resBarbearia = await api.get(`/barbearias/${bId}`);
          const dadosBarbearia = resBarbearia.data || resBarbearia;
          setTiposCorte(dadosBarbearia.servicos || []);
        }
      } catch (err) {
        console.error("erro ao carregar dados iniciais");
      } finally {
        setLoading(false);
      }
    };
    carregarDadosIniciais();
  }, []);

  useEffect(() => {
    if (form.fk_barbeiro && form.data) {
      const fetchOcupados = async () => {
        setLoadingHorarios(true);
        try {
          const res = await api.get(`/agendamentos?fk_barbeiro=${form.fk_barbeiro}`);
          const dados = res.data || res;
          setAgendamentosOcupados(Array.isArray(dados) ? dados.filter(a => a.status === 'A') : []);
        } catch (err) {
          console.error("erro ao buscar horários ocupados");
        } finally {
          setLoadingHorarios(false);
        }
      };
      fetchOcupados();
    }
  }, [form.fk_barbeiro, form.data]);

  const getDatasSemana = () => {
    const datas = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      datas.push(d.toISOString().split('T')[0]);
    }
    return datas;
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

  const mudarMes = (direcao) => {
    const novoMes = new Date(currentMonth);
    novoMes.setMonth(currentMonth.getMonth() + direcao);
    const limite = new Date();
    limite.setMonth(limite.getMonth() + 3);
    if (novoMes >= new Date(new Date().getFullYear(), new Date().getMonth(), 1) && novoMes <= limite) {
      setCurrentMonth(novoMes);
    }
  };

  const isHorarioOcupado = (data, hora) => {
    const dataHoraBusca = `${data}T${hora}:00`;
    return agendamentosOcupados.some(a => a.datahora.startsWith(dataHoraBusca));
  };

  const isHorarioPassado = (data, hora) => {
    const agora = new Date();
    const horarioComparacao = new Date(`${data}T${hora}:00`);
    return horarioComparacao < agora;
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
    } catch (err) {
      console.error("Erro detalhado:", err.response?.data);
      alert("erro ao salvar agendamento.");
    }
  };

  const renderFloatingButton = () => {
    let label = "";
    let action = null;
    let disabled = false;

    if (step === 1) { label = "escolher barbeiro"; action = () => setStep(2); disabled = !form.tipoCorte; }
    else if (step === 2) { label = "escolher data"; action = () => setStep(3); disabled = !form.fk_barbeiro; }
    else if (step === 3) { label = "ver horários"; action = () => setStep(4); disabled = !form.data; }
    else if (step === 4) { label = "finalizar reserva"; action = handleFinalizar; disabled = !form.hora; }

    return (
      <div className="fixed bottom-8 left-0 right-0 px-6 z-[9999] pointer-events-none">
        <div className="max-w-md mx-auto pointer-events-auto">
          <button 
            disabled={disabled} 
            onClick={action}
            className={`w-full py-5 font-black uppercase text-[11px] tracking-widest rounded-3xl shadow-2xl transition-all duration-300 ${
              disabled ? 'bg-[#181818] text-gray-700 border border-white/5' : 'bg-[#e6b32a] text-black active:scale-95'
            }`}
          >
            {label}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#070707] text-gray-100 p-6 font-sans pb-40">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => step > 1 ? setStep(step - 1) : navigate(-1)} className="w-10 h-10 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 text-gray-400">←</button>
            <div>
              <h1 className="text-2xl font-black italic lowercase tracking-tighter">novo.agendamento</h1>
              <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[3px]">etapa {step} de 4</p>
            </div>
          </div>
          <div className="flex gap-1.5">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-[#e6b32a]' : 'bg-white/5'}`} />
            ))}
          </div>
        </header>

        <main className="bg-[#0d0d0d] rounded-[2.5rem] border border-white/5 shadow-2xl p-6 min-h-[400px]">
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#e6b32a]">
                <IoPricetagOutline size={18} />
                <h2 className="text-sm font-black uppercase tracking-widest">o que vamos fazer?</h2>
              </div>
              <div className="grid gap-3">
                {tiposCorte.map((t, index) => (
                  <div key={index} onClick={() => setForm({...form, tipoCorte: t.nome, valor: t.valor})} className={`p-5 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${form.tipoCorte === t.nome ? 'border-[#e6b32a] bg-[#e6b32a]/5' : 'border-white/5 bg-black'}`}>
                    <p className={`text-lg font-black lowercase ${form.tipoCorte === t.nome ? 'text-white' : 'text-gray-400'}`}>{t.nome}</p>
                    <div className={`px-4 py-2 rounded-xl font-mono font-black ${form.tipoCorte === t.nome ? 'bg-[#e6b32a] text-black' : 'text-[#e6b32a] bg-white/5'}`}>R${t.valor.toFixed(2)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#e6b32a]">
                <IoPersonOutline size={18} />
                <h2 className="text-sm font-black uppercase tracking-widest">com quem?</h2>
              </div>
              <div className="grid gap-3">
                {barbeiros.map(b => (
                  <div key={b._id} onClick={() => setForm({...form, fk_barbeiro: b._id, data: '', hora: ''})} className={`p-6 rounded-2xl border transition-all cursor-pointer flex justify-between items-center ${form.fk_barbeiro === b._id ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-white/5 bg-black'}`}>
                    <span className={`font-black lowercase ${form.fk_barbeiro === b._id ? 'text-[#e6b32a]' : 'text-white'}`}>{b.nome}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-[#e6b32a]">
                  <IoCalendarOutline size={18} />
                  <h2 className="text-sm font-black uppercase tracking-widest">para quando?</h2>
                </div>
                
                {/* BOTÃO MELHORADO PARA MOBILE */}
                <button 
                  onClick={() => setShowFullCalendar(!showFullCalendar)} 
                  className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-[#e6b32a]/10 border border-[#e6b32a]/30 active:scale-95 transition-all"
                >
                  <IoCalendarNumberOutline size={18} className="text-[#e6b32a]" />
                  <span className="text-[10px] font-black uppercase tracking-tighter text-[#e6b32a]">
                    {showFullCalendar ? 'voltar' : 'outras datas'}
                  </span>
                </button>
              </div>

              {showFullCalendar ? (
                <div className="space-y-4 animate-in fade-in zoom-in-95 duration-300">
                  <div className="flex justify-between items-center px-2">
                    <button onClick={() => mudarMes(-1)} className="w-10 h-10 flex items-center justify-center text-[#e6b32a] bg-white/5 rounded-xl"><IoChevronBack /></button>
                    <span className="font-black lowercase text-sm">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</span>
                    <button onClick={() => mudarMes(1)} className="w-10 h-10 flex items-center justify-center text-[#e6b32a] bg-white/5 rounded-xl"><IoChevronForward /></button>
                  </div>
                  <div className="grid grid-cols-7 gap-1">
                    {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map((d, idx) => (
                      <div key={idx} className="text-center text-[7px] font-black uppercase text-gray-600 mb-2">{d}</div>
                    ))}
                    {getDiasNoMes(currentMonth.getMonth(), currentMonth.getFullYear()).map((dia, i) => {
                      const dataFormatada = dia.toISOString().split('T')[0];
                      const hoje = new Date().toISOString().split('T')[0];
                      const isAntiga = dataFormatada < hoje;
                      return (
                        <button key={i} disabled={isAntiga} onClick={() => setForm({...form, data: dataFormatada, hora: ''})} className={`aspect-square rounded-xl text-[10px] font-bold flex items-center justify-center transition-all ${form.data === dataFormatada ? 'bg-[#e6b32a] text-black' : isAntiga ? 'text-gray-800' : 'bg-white/5 text-gray-400'}`}>
                          {dia.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 animate-in fade-in duration-300">
                  {getDatasSemana().map(d => {
                    const dataObj = new Date(d + 'T00:00:00');
                    return (
                      <button key={d} onClick={() => setForm({...form, data: d, hora: ''})} className={`p-5 rounded-2xl border flex flex-col items-center gap-1 transition-all ${form.data === d ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-white/5 bg-black'}`}>
                        <span className="text-[9px] uppercase font-black text-gray-500">{dataObj.toLocaleDateString('pt-BR', { weekday: 'short' })}</span>
                        <span className="text-lg font-black">{dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 text-[#e6b32a]"><IoTimeOutline size={18} /><h2 className="text-sm font-black uppercase tracking-widest">horários</h2></div>
              <div className="grid grid-cols-3 gap-2 max-h-72 overflow-y-auto pr-1">
                {loadingHorarios ? (
                   <div className="col-span-3 text-center py-10 animate-pulse text-[10px] font-black">checando agenda...</div>
                ) : (
                  horariosBase.map(h => {
                    const bloqueado = isHorarioOcupado(form.data, h) || isHorarioPassado(form.data, h);
                    return (
                      <button key={h} disabled={bloqueado} onClick={() => setForm({...form, hora: h})} className={`p-4 rounded-xl border text-xs font-bold transition-all ${form.hora === h ? 'border-[#e6b32a] bg-[#e6b32a] text-black' : bloqueado ? 'opacity-10 pointer-events-none' : 'border-white/5 bg-black text-gray-400'}`}>{h}</button>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </main>
      </div>
      {renderFloatingButton()}
    </div>
  );
}