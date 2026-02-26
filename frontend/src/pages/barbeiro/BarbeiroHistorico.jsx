import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { IoChevronBackOutline, IoChevronForwardOutline, IoTimeOutline, IoReceiptOutline } from 'react-icons/io5';

export default function BarbeiroHistorico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  const historicoTotal = agendamentos
    .filter(a => a.status === 'F' || a.status === 'C')
    .sort((a, b) => new Date(b.datahora) - new Date(a.datahora));

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historicoTotal.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historicoTotal.length / itemsPerPage);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-6">
        
        <header className="flex items-center gap-4 pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-[#e6b32a] shadow-sm transition-all active:scale-90"
          >
            ←
          </button>
          <div>
            <h1 className="text-2xl font-black italic lowercase tracking-tighter leading-none">historico.atendimentos</h1>
            <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[3px] mt-1">registros passados</p>
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-[10px] uppercase font-black tracking-widest text-slate-400">
            carregando registros...
          </div>
        ) : historicoTotal.length > 0 ? (
          <>
            <div className="flex flex-col gap-3">
              {currentItems.map(a => (
                <div 
                  key={a._id} 
                  className="p-4 rounded-[1.5rem] bg-white dark:bg-[#111] border border-slate-200 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:border-[#e6b32a]/30 shadow-sm group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${a.status === 'F' ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-600'}`}>
                      {a.status === 'F' ? <IoReceiptOutline size={20} /> : <IoTimeOutline size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {new Date(a.datahora).toLocaleDateString('pt-BR')} • {new Date(a.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                        </span>
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-md ${a.status === 'F' ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-500' : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-500'}`}>
                          {a.status === 'F' ? 'finalizado' : 'cancelado'}
                        </span>
                      </div>
                      <h3 className="font-black text-lg lowercase tracking-tight leading-none text-slate-900 dark:text-white">
                        {getNomeCliente(a.fk_cliente)}
                      </h3>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                        {a.tipoCorte === 'C' ? 'cabelo' : a.tipoCorte === 'B' ? 'barba' : 'cabelo+barba'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-slate-50 dark:bg-black/20 border border-slate-100 dark:border-white/5 px-5 py-3 rounded-xl flex justify-between md:flex-col md:items-end items-center md:justify-center min-w-[120px] shadow-inner">
                    <span className="text-[8px] text-[#e6b32a] font-black uppercase">valor</span>
                    <span className="text-lg font-black font-mono tracking-tighter text-slate-900 dark:text-white">
                      r$ {a.valor?.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6 pb-10">
                <button 
                  onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0,0); }}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 transition-all active:scale-90 ${currentPage === 1 ? 'opacity-20 cursor-not-allowed' : 'bg-white dark:bg-transparent hover:border-[#e6b32a] text-[#e6b32a]'}`}
                >
                  <IoChevronBackOutline size={18} />
                </button>
                
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  página <span className="text-[#e6b32a]">{currentPage}</span> de {totalPages}
                </span>

                <button 
                  onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo(0,0); }}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border border-slate-200 dark:border-white/10 transition-all active:scale-90 ${currentPage === totalPages ? 'opacity-20 cursor-not-allowed' : 'bg-white dark:bg-transparent hover:border-[#e6b32a] text-[#e6b32a]'}`}
                >
                  <IoChevronForwardOutline size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-24 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-[2rem]">
            <p className="text-slate-300 text-[9px] uppercase font-black tracking-widest">sem registros no histórico</p>
          </div>
        )}
      </div>
    </div>
  );
}