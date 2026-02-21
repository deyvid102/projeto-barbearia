import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';

export default function NovoAgendamento() {
  const { id } = useParams(); // id do cliente vindo da url
  const navigate = useNavigate();
  
  const [step, setStep] = useState(1);
  const [barbeiros, setBarbeiros] = useState([]);
  const [form, setForm] = useState({ tipoCorte: '', fk_barbeiro: '', data: '', hora: '' });

  const tiposCorte = [
    { id: 'C', nome: 'cabelo', preco: 30 },
    { id: 'B', nome: 'barba', preco: 20 },
    { id: 'CB', nome: 'cabelo + barba', preco: 40 },
  ];

  const horarios = [
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

  const handleFinalizar = async () => {
    try {
      const preco = tiposCorte.find(t => t.id === form.tipoCorte)?.preco;
      const payload = { 
        tipoCorte: form.tipoCorte,
        fk_barbeiro: form.fk_barbeiro,
        datahora: `${form.data}T${form.hora}:00`,
        fk_cliente: id, 
        valor: preco 
      };

      await api.post('/agendamentos', payload);
      
      // redireciona de volta para o dashboard do cliente após sucesso
      navigate(`/cliente/${id}`);
    } catch (err) {
      alert("erro ao salvar agendamento");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 font-sans">
      <div className="max-w-md mx-auto">
        <header className="mb-8">
          <button onClick={() => navigate(-1)} className="text-xs text-gray-500 uppercase font-bold mb-4">← voltar</button>
          <h1 className="text-xl font-black italic lowercase tracking-tighter">novo.agendamento</h1>
          <div className="flex gap-1 mt-4">
            {[1, 2, 3, 4].map(s => (
              <div key={s} className={`h-1 flex-1 rounded-full ${step >= s ? 'bg-[#e6b32a]' : 'bg-white/10'}`} />
            ))}
          </div>
        </header>

        <main className="bg-[#111] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          
          {/* etapa 1: corte */}
          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#e6b32a]">selecione o serviço</h2>
              <div className="grid gap-3">
                {tiposCorte.map(t => (
                  <div 
                    key={t.id} 
                    onClick={() => setForm({...form, tipoCorte: t.id})}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${form.tipoCorte === t.id ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-white/5 bg-black'}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold lowercase text-sm">{t.nome}</span>
                      <span className="text-xs text-gray-400">r$ {t.preco}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button 
                disabled={!form.tipoCorte} 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl disabled:opacity-20 mt-4"
              >próximo</button>
            </div>
          )}

          {/* etapa 2: barbeiro */}
          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#e6b32a]">quem vai atender?</h2>
              <div className="grid gap-3">
                {barbeiros.map(b => (
                  <div 
                    key={b._id} 
                    onClick={() => setForm({...form, fk_barbeiro: b._id})}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer ${form.fk_barbeiro === b._id ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-white/5 bg-black'}`}
                  >
                    <span className="font-bold lowercase text-sm">{b.nome}</span>
                  </div>
                ))}
              </div>
              <button 
                disabled={!form.fk_barbeiro} 
                onClick={() => setStep(3)}
                className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl disabled:opacity-20 mt-4"
              >próximo</button>
            </div>
          )}

          {/* etapa 3: data */}
          {step === 3 && (
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#e6b32a]">escolha o dia</h2>
              <div className="grid grid-cols-2 gap-3">
                {datasSemana.map(d => (
                  <label key={d} className={`p-4 rounded-2xl border cursor-pointer flex items-center justify-between ${form.data === d ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-white/5 bg-black'}`}>
                    <span className="text-[11px] font-bold">
                      {new Date(d + 'T00:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'short' })}
                    </span>
                    <input 
                      type="checkbox" 
                      className="accent-[#e6b32a] h-4 w-4" 
                      checked={form.data === d} 
                      onChange={() => setForm({...form, data: d})} 
                    />
                  </label>
                ))}
              </div>
              <button 
                disabled={!form.data} 
                onClick={() => setStep(4)}
                className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl disabled:opacity-20 mt-4"
              >próximo</button>
            </div>
          )}

          {/* etapa 4: horário */}
          {step === 4 && (
            <div className="space-y-4">
              <h2 className="text-[10px] font-bold uppercase tracking-widest text-[#e6b32a]">horários disponíveis</h2>
              <div className="grid grid-cols-3 gap-2 h-72 overflow-y-auto pr-2">
                {horarios.map(h => (
                  <div 
                    key={h} 
                    onClick={() => setForm({...form, hora: h})}
                    className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${form.hora === h ? 'border-[#e6b32a] bg-[#e6b32a] text-black' : 'border-white/5 bg-black text-gray-400'}`}
                  >
                    <span className="text-[10px] font-bold">{h}</span>
                  </div>
                ))}
              </div>
              <button 
                disabled={!form.hora} 
                onClick={handleFinalizar}
                className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl disabled:opacity-20 mt-4"
              >finalizar agendamento</button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}