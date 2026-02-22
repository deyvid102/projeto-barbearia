import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';

import imgCabelo from '../../assets/corte_cabelo.jpg';
import imgBarba from '../../assets/corte_barba.jpg';
import imgCombo from '../../assets/combo_barbearia.jpg';

export default function NovoAgendamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentosOcupados, setAgendamentosOcupados] = useState([]);
  const [loadingHorarios, setLoadingHorarios] = useState(false);
  const [form, setForm] = useState({ tipoCorte: '', fk_barbeiro: '', data: '', hora: '' });

  const tiposCorte = [
    { id: 'C', nome: 'cabelo', preco: 30, img: imgCabelo },
    { id: 'B', nome: 'barba', preco: 20, img: imgBarba },
    { id: 'CB', nome: 'cabelo + barba', preco: 40, img: imgCombo },
  ];

  const horariosBase = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30', '18:00', '18:30'
  ];

  useEffect(() => {
    const fetchBarbeiros = async () => {
      try {
        const res = await api.get('/barbeiros');
        const dados = res.data || res;
        setBarbeiros(Array.isArray(dados) ? dados : []);
      } catch (err) {
        console.error("erro ao carregar barbeiros");
      }
    };
    fetchBarbeiros();
  }, []);

  // Busca agendamentos do barbeiro quando um for selecionado
  useEffect(() => {
    if (form.fk_barbeiro) {
      const fetchOcupados = async () => {
        setLoadingHorarios(true);
        try {
          const res = await api.get(`/agendamentos?fk_barbeiro=${form.fk_barbeiro}`);
          const dados = res.data || res;
          // Filtramos apenas os agendamentos ativos (A)
          setAgendamentosOcupados(Array.isArray(dados) ? dados.filter(a => a.status === 'A') : []);
        } catch (err) {
          console.error("erro ao buscar horários ocupados");
        } finally {
          setLoadingHorarios(false);
        }
      };
      fetchOcupados();
    }
  }, [form.fk_barbeiro]);

  const getDatasSemana = () => {
    const datas = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      datas.push(d.toISOString().split('T')[0]);
    }
    return datas;
  };

  const datasSemana = getDatasSemana();

  // Verifica se o horário específico está ocupado no dia selecionado
  const isHorarioOcupado = (data, hora) => {
    const dataHoraBusca = `${data}T${hora}:00`;
    return agendamentosOcupados.some(a => a.datahora.startsWith(dataHoraBusca));
  };

  // Verifica se o dia inteiro está lotado para este barbeiro
  const isDiaLotado = (data) => {
    const ocupadosNoDia = agendamentosOcupados.filter(a => a.datahora.startsWith(data));
    return ocupadosNoDia.length >= horariosBase.length;
  };

  const handleFinalizar = async () => {
    try {
      const preco = tiposCorte.find(t => t.id === form.tipoCorte)?.preco;
      const payload = { 
        tipoCorte: form.tipoCorte,
        fk_barbeiro: form.fk_barbeiro,
        datahora: `${form.data}T${form.hora}:00`,
        fk_cliente: id, 
        valor: preco,
        status: 'A'
      };

      await api.post('/agendamentos', payload);
      navigate(`/cliente/${id}`);
    } catch (err) {
      alert("erro ao salvar agendamento");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <button onClick={() => navigate(-1)} className="text-xs text-gray-500 uppercase font-black mb-4 tracking-widest hover:text-white transition-colors">← voltar</button>
          <h1 className="text-2xl font-black italic lowercase tracking-tighter">novo.agendamento</h1>
          <div className="flex gap-1.5 mt-6">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full transition-all duration-500 ${step >= s ? 'bg-[#e6b32a] shadow-[0_0_8px_#e6b32a]' : 'bg-white/5'}`} />
            ))}
          </div>
        </header>

        <main className="bg-[#111] p-1 rounded-[3rem] border border-white/5 shadow-2xl overflow-hidden">
          <div className="p-6">
            
            {step === 1 && (
              <div className="space-y-6">
                <div className="pl-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[4px] text-[#e6b32a]">passo 01</h2>
                  <p className="text-lg font-bold lowercase">escolha o serviço</p>
                </div>

                <div className="grid gap-4">
                  {tiposCorte.map(t => (
                    <div 
                      key={t.id} 
                      onClick={() => setForm({...form, tipoCorte: t.id})}
                      className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-300 cursor-pointer ${
                        form.tipoCorte === t.id 
                        ? 'border-[#e6b32a] bg-[#e6b32a]/5 ring-1 ring-[#e6b32a]' 
                        : 'border-white/5 bg-black hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center p-3">
                        <div className="relative w-20 h-20 overflow-hidden rounded-2xl flex-shrink-0">
                          <img 
                            src={t.img} 
                            alt={t.nome} 
                            className={`w-full h-full object-cover transition-transform duration-700 ${form.tipoCorte === t.id ? 'scale-110' : 'opacity-40 grayscale group-hover:grayscale-0'}`} 
                          />
                        </div>
                        <div className="flex flex-col flex-1 px-4">
                          <span className={`text-lg font-black lowercase leading-tight ${form.tipoCorte === t.id ? 'text-white' : 'text-gray-400'}`}>
                            {t.nome}
                          </span>
                          <span className="text-[9px] text-gray-500 uppercase font-bold tracking-widest mt-1">pro experience</span>
                        </div>
                        <div className={`px-4 py-2 rounded-2xl font-black text-sm transition-all ${
                          form.tipoCorte === t.id ? 'bg-[#e6b32a] text-black scale-110' : 'bg-white/5 text-[#e6b32a]'
                        }`}>
                          R${t.preco}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button 
                  disabled={!form.tipoCorte} 
                  onClick={() => setStep(2)}
                  className="w-full py-5 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-[2rem] disabled:opacity-20 mt-4 active:scale-95 transition-all"
                >próximo passo</button>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <div className="pl-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[4px] text-[#e6b32a]">passo 02</h2>
                  <p className="text-lg font-bold lowercase">quem vai atender?</p>
                </div>
                <div className="grid gap-3">
                  {barbeiros.map(b => (
                    <div 
                      key={b._id} 
                      onClick={() => setForm({...form, fk_barbeiro: b._id, data: '', hora: ''})}
                      className={`p-6 rounded-[2rem] border transition-all cursor-pointer flex justify-between items-center ${
                        form.fk_barbeiro === b._id ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-white/5 bg-black'
                      }`}
                    >
                      <span className={`font-black lowercase ${form.fk_barbeiro === b._id ? 'text-[#e6b32a]' : 'text-white'}`}>{b.nome}</span>
                      {form.fk_barbeiro === b._id && <div className="w-2 h-2 rounded-full bg-[#e6b32a] animate-pulse" />}
                    </div>
                  ))}
                </div>
                <button 
                  disabled={!form.fk_barbeiro} 
                  onClick={() => setStep(3)}
                  className="w-full py-5 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-[2rem] disabled:opacity-20 mt-4 active:scale-95 transition-all"
                >confirmar barbeiro</button>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <div className="pl-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[4px] text-[#e6b32a]">passo 03</h2>
                  <p className="text-lg font-bold lowercase">escolha o dia</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {datasSemana.map(d => {
                    const lotado = isDiaLotado(d);
                    return (
                      <button 
                        key={d} 
                        disabled={lotado}
                        onClick={() => setForm({...form, data: d, hora: ''})}
                        className={`p-5 rounded-[2rem] border flex flex-col items-center gap-2 transition-all ${
                          form.data === d 
                            ? 'border-[#e6b32a] bg-[#e6b32a]/10 ring-1 ring-[#e6b32a]' 
                            : lotado 
                              ? 'border-transparent bg-white/5 opacity-20 cursor-not-allowed' 
                              : 'border-white/5 bg-black'
                        }`}
                      >
                        <span className={`text-[10px] uppercase font-black tracking-tighter ${form.data === d ? 'text-[#e6b32a]' : 'text-gray-500'}`}>
                          {new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'long' })}
                        </span>
                        <span className="text-lg font-black">
                          {new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                        </span>
                        {lotado && <span className="text-[8px] font-black uppercase text-red-500">lotado</span>}
                      </button>
                    );
                  })}
                </div>
                <button 
                  disabled={!form.data} 
                  onClick={() => setStep(4)}
                  className="w-full py-5 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-[2rem] disabled:opacity-20 mt-4 active:scale-95 transition-all"
                >ver horários</button>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <div className="pl-2">
                  <h2 className="text-[10px] font-black uppercase tracking-[4px] text-[#e6b32a]">passo 04</h2>
                  <p className="text-lg font-bold lowercase">horários disponíveis</p>
                </div>
                <div className="grid grid-cols-3 gap-3 h-80 overflow-y-auto pr-2 custom-scrollbar">
                  {loadingHorarios ? (
                     <div className="col-span-3 py-10 text-center text-[10px] font-black uppercase animate-pulse">checando agenda...</div>
                  ) : (
                    horariosBase.map(h => {
                      const ocupado = isHorarioOcupado(form.data, h);
                      return (
                        <button 
                          key={h} 
                          disabled={ocupado}
                          onClick={() => setForm({...form, hora: h})}
                          className={`p-4 rounded-2xl border text-center transition-all duration-300 ${
                            form.hora === h 
                              ? 'border-[#e6b32a] bg-[#e6b32a] text-black font-black scale-95' 
                              : ocupado 
                                ? 'border-transparent bg-red-500/10 text-red-500/20 cursor-not-allowed' 
                                : 'border-white/5 bg-black text-gray-500 hover:border-white/20'
                          }`}
                        >
                          <span className="text-xs font-bold">{h}</span>
                          {ocupado && <span className="block text-[7px] uppercase font-black">indisp.</span>}
                        </button>
                      );
                    })
                  )}
                </div>
                <button 
                  disabled={!form.hora} 
                  onClick={handleFinalizar}
                  className="w-full py-5 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-[2rem] disabled:opacity-20 mt-4 shadow-2xl active:scale-95 transition-all"
                >finalizar agendamento</button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}