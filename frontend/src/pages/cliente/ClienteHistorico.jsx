import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';

export default function ClienteHistorico() {
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
      const [resAgendados, resBarbeiros] = await Promise.all([
        api.get(`/agendamentos?fk_cliente=${id}`),
        api.get('/barbeiros')
      ]);
      setAgendamentos(resAgendados.data || resAgendados || []);
      setBarbeiros(resBarbeiros.data || resBarbeiros || []);
    } catch (error) {
      console.error("erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNomeBarbeiro = (fk) => {
    const bId = fk?._id || fk;
    return barbeiros.find(b => String(b._id) === String(bId))?.nome || 'barbeiro';
  };

  const historico = agendamentos
    .filter(a => a.status === 'F' || a.status === 'C')
    .sort((a, b) => new Date(b.datahora) - new Date(a.datahora));

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <header className="flex justify-between items-center border-b border-white/5 pb-6">
          <button 
            onClick={() => navigate(-1)} 
            className="text-[10px] font-black text-[#e6b32a] uppercase tracking-widest"
          >
            ← voltar
          </button>
          <h1 className="text-xl font-black italic lowercase tracking-tighter text-white">
            meus.cortes <span className="text-gray-500 not-italic text-xs ml-2">histórico</span>
          </h1>
        </header>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-[10px] text-gray-600 uppercase font-black animate-pulse py-10">carregando histórico...</p>
          ) : historico.length > 0 ? (
            historico.map(a => (
              <div key={a._id} className="p-6 rounded-[2.5rem] bg-[#111] border border-white/5 flex justify-between items-center">
                <div className="space-y-1">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                    {new Date(a.datahora).toLocaleDateString('pt-BR')}
                  </p>
                  <h3 className="font-black text-white text-lg lowercase tracking-tight">
                    {getNomeBarbeiro(a.fk_barbeiro)}
                  </h3>
                  <p className="text-[9px] text-gray-400 font-bold uppercase">
                    {a.tipoCorte === 'C' ? 'cabelo' : a.tipoCorte === 'B' ? 'barba' : 'cabelo+barba'}
                  </p>
                  <span className={`text-[8px] font-black uppercase tracking-widest mt-2 inline-block ${a.status === 'F' ? 'text-green-500' : 'text-red-500/50'}`}>
                    {a.status === 'F' ? '● finalizado' : '● cancelado'}
                  </span>
                </div>

                <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl">
                  <span className="text-[10px] text-[#e6b32a] font-black block text-right leading-none mb-1">R$</span>
                  <span className="text-lg font-black text-white tracking-tighter">
                    {a.valor?.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[2.5rem]">
              <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest">nenhum registro antigo</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}