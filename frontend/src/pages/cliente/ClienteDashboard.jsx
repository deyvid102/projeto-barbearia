import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';

export default function ClienteDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [form, setForm] = useState({ tipoCorte: 'C', datahora: '', fk_barbeiro: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  const precos = { 'C': 30, 'B': 20, 'CB': 40 };

  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate('/cliente/login');
      return;
    }
    fetchData();
  }, [id, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const resAgendados = await api.get(`/agendamentos?fk_cliente=${id}`);
      const resBarbeiros = await api.get('/barbeiros');

      // Se resBarbeiros.data for undefined, tentamos resBarbeiros diretamente
      const dadosBarbeiros = resBarbeiros.data || resBarbeiros;
      const dadosAgendados = resAgendados.data || resAgendados;

      setBarbeiros(Array.isArray(dadosBarbeiros) ? dadosBarbeiros : []);
      setAgendamentos(Array.isArray(dadosAgendados) ? dadosAgendados : []);

      console.log("Barbeiros processados:", dadosBarbeiros);
    } catch (error) {
      console.error("erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNomeBarbeiro = (fk) => {
    const bId = fk && typeof fk === 'object' ? fk._id : fk;
    const encontrado = barbeiros.find(b => String(b._id) === String(bId));
    return encontrado ? encontrado.nome : 'carregando...';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...form, fk_cliente: id, valor: precos[form.tipoCorte] };
      if (editId) {
        await api.put(`/agendamentos/${editId}`, payload);
        setEditId(null);
      } else {
        await api.post('/agendamentos', payload);
      }
      setForm({ tipoCorte: 'C', datahora: '', fk_barbeiro: '' });
      fetchData();
    } catch (err) {
      alert("erro ao processar");
    }
  };

  const handleCancel = async (aid) => {
    if (!window.confirm("cancelar?")) return;
    await api.put(`/agendamentos/${aid}`, { status: 'C' });
    fetchData();
  };

  const startEdit = (a) => {
    setEditId(a._id);
    setForm({ 
      tipoCorte: a.tipoCorte, 
      datahora: new Date(a.datahora).toISOString().slice(0, 16), 
      fk_barbeiro: a.fk_barbeiro?._id || a.fk_barbeiro 
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 pb-24 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-white/5 pb-6">
          <h1 className="text-xl font-black italic lowercase tracking-tighter">meus.cortes</h1>
          <button onClick={() => { localStorage.clear(); navigate('/cliente/login'); }} className="text-xs font-bold text-red-500 uppercase">sair</button>
        </header>

        <form onSubmit={handleSubmit} className="bg-[#111] p-6 rounded-[2rem] border border-white/5 space-y-4">
          <h2 className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{editId ? 'editar' : 'novo agendamento'}</h2>
          <div className="space-y-3">
            <select 
              required 
              className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none"
              value={form.fk_barbeiro} 
              onChange={e => setForm({...form, fk_barbeiro: e.target.value})}
            >
              <option value="">selecione o barbeiro</option>
              {barbeiros.map(b => (
                <option key={b._id} value={b._id}>{b.nome}</option>
              ))}
            </select>
            <select 
              className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none"
              value={form.tipoCorte} 
              onChange={e => setForm({...form, tipoCorte: e.target.value})}
            >
              <option value="C">cabelo - r$ 30</option>
              <option value="B">barba - r$ 20</option>
              <option value="CB">cabelo + barba - r$ 40</option>
            </select>
            <input 
              required type="datetime-local" 
              className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none"
              value={form.datahora} 
              onChange={e => setForm({...form, datahora: e.target.value})} 
            />
          </div>
          <button type="submit" className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl">
            {editId ? 'confirmar alteração' : 'agendar agora'}
          </button>
        </form>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[3px] text-gray-500 pl-2">seus horários</h3>
          {loading ? <p className="text-center text-xs text-gray-500">carregando...</p> : 
            agendamentos.map(a => (
              <div key={a._id} className={`p-5 rounded-[2rem] border ${a.status === 'C' ? 'opacity-30 border-white/5' : 'bg-[#111] border-white/5'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] text-[#e6b32a] font-bold">{new Date(a.datahora).toLocaleString()}</p>
                    <h3 className="font-bold text-white lowercase">{getNomeBarbeiro(a.fk_barbeiro)}</h3>
                    <p className="text-[10px] text-gray-500 uppercase">{a.tipoCorte} • r$ {a.valor?.toFixed(2)}</p>
                  </div>
                  {a.status !== 'C' && (
                    <div className="flex gap-4">
                      <button onClick={() => startEdit(a)} className="text-[10px] font-bold uppercase text-gray-400">edit</button>
                      <button onClick={() => handleCancel(a._id)} className="text-[10px] font-bold uppercase text-red-500">x</button>
                    </div>
                  )}
                </div>
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}