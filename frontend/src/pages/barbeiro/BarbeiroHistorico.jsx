import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';

export default function BarbeiroHistorico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const barbeiroId = id || localStorage.getItem('barbeiroId');
    if (!barbeiroId) return navigate('/barbeiro/login');
    fetchData(barbeiroId);
  }, [id, navigate]);

  const fetchData = async (currentId) => {
    try {
      setLoading(true);
      const [resAgendados, resClientes] = await Promise.all([
        api.get(`/agendamentos?fk_barbeiro=${currentId}`),
        api.get('/clientes')
      ]);
      setAgendamentos(resAgendados.data || resAgendados || []);
      setClientes(resClientes.data || resClientes || []);
    } catch (error) {
      console.error("erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNomeCliente = (fk) => {
    const cId = fk?._id || fk;
    return clientes.find(c => String(c._id) === String(cId))?.nome || 'cliente';
  };

  const historico = agendamentos
    .filter(a => a.status === 'F' || a.status === 'C')
    .sort((a, b) => new Date(b.datahora) - new Date(a.datahora));

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        <header className="flex items-center gap-6 pt-4 border-b border-slate-100 dark:border-white/5 pb-8">
          <button 
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-black dark:hover:border-[#e6b32a] transition-all shadow-sm"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter leading-none">meus.cortes</h1>
            <p className="text-[10px] text-slate-400 dark:text-[#e6b32a] uppercase font-black tracking-[4px] mt-2">histórico completo</p>
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-[10px] uppercase font-black tracking-widest text-slate-300">recuperando registros...</div>
        ) : historico.length > 0 ? (
          /* Grid adaptável: 1 col no mobile, 2 no tablet, 3 no PC */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {historico.map(a => (
              <div key={a._id} className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-[#111] border border-slate-100 dark:border-white/5 flex flex-col justify-between hover:scale-[1.02] transition-all shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div className="space-y-1">
                    <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">
                      {new Date(a.datahora).toLocaleDateString('pt-BR')}
                    </p>
                    <h3 className="font-black text-lg lowercase tracking-tight leading-tight">{getNomeCliente(a.fk_cliente)}</h3>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">
                      {a.tipoCorte === 'C' ? 'cabelo' : a.tipoCorte === 'B' ? 'barba' : 'cabelo+barba'}
                    </p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter ${a.status === 'F' ? 'bg-green-100 dark:bg-green-500/10 text-green-600' : 'bg-red-100 dark:bg-red-500/10 text-red-500'}`}>
                    {a.status === 'F' ? 'finalizado' : 'cancelado'}
                  </div>
                </div>

                <div className="bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 px-6 py-4 rounded-2xl flex justify-between items-center">
                  <span className="text-[10px] text-slate-400 dark:text-[#e6b32a] font-black uppercase">valor total</span>
                  <span className="text-xl font-black font-mono tracking-tighter">
                    r$ {a.valor?.toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
            <p className="text-slate-300 text-[10px] uppercase font-black tracking-widest">nenhum atendimento registrado</p>
          </div>
        )}
      </div>
    </div>
  );
}