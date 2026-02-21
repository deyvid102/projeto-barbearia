import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';

export default function ClienteDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);

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

      setBarbeiros(resBarbeiros.data || resBarbeiros || []);
      setAgendamentos(resAgendados.data || resAgendados || []);
    } catch (error) {
      console.error("erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (aid) => {
    if (!window.confirm("deseja cancelar este agendamento?")) return;
    try {
      await api.put(`/agendamentos/${aid}`, { status: 'C' });
      fetchData();
    } catch (err) {
      alert("erro ao cancelar");
    }
  };

  const getNomeBarbeiro = (fk) => {
    const bId = fk && typeof fk === 'object' ? fk._id : fk;
    const encontrado = barbeiros.find(b => String(b._id) === String(bId));
    return encontrado ? encontrado.nome : 'barbeiro';
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 pb-24 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-white/5 pb-6">
          <h1 className="text-xl font-black italic lowercase tracking-tighter">meus.cortes</h1>
          <button onClick={() => { localStorage.clear(); navigate('/cliente/login'); }} className="text-xs font-bold text-red-500 uppercase">sair</button>
        </header>

        {/* botão para abrir a nova tela de agendamento */}
        <button 
          onClick={() => navigate(`/cliente/novo-agendamento/${id}`)}
          className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl shadow-lg shadow-[#e6b32a]/10"
        >
          + novo agendamento
        </button>

        <div className="space-y-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[3px] text-gray-500 pl-2">seus horários</h3>
          
          {loading ? (
            <p className="text-center text-xs text-gray-500">carregando...</p>
          ) : agendamentos.length === 0 ? (
            <p className="text-center text-xs text-gray-600 py-10">nenhum agendamento encontrado.</p>
          ) : (
            agendamentos.map(a => {
              const isFinalizado = a.status === 'F' || String(a.status).toLowerCase() === 'finalizado';
              const isCancelado = a.status === 'C';

              return (
                <div key={a._id} className={`p-5 rounded-[2rem] border ${isCancelado ? 'opacity-30 border-white/5' : 'bg-[#111] border-white/5'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-[10px] text-[#e6b32a] font-bold">
                        {new Date(a.datahora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      <h3 className="font-bold text-white lowercase">{getNomeBarbeiro(a.fk_barbeiro)}</h3>
                      <p className="text-[10px] text-gray-500 uppercase">{a.tipoCorte} • r$ {a.valor?.toFixed(2)}</p>
                      {isFinalizado && <p className="text-[10px] text-green-500 font-bold mt-1 uppercase">finalizado</p>}
                    </div>
                    
                    {!isCancelado && !isFinalizado && (
                      <button onClick={() => handleCancel(a._id)} className="text-[10px] font-bold uppercase text-red-500">cancelar</button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}