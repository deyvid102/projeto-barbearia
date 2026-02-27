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
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-3 md:p-6 pb-24 font-sans transition-colors duration-300`}>
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* HEADER PADRONIZADO - Título no canto superior esquerdo */}
        <header className="flex items-center gap-4 md:gap-6 border-b border-black/5 dark:border-white/5 pb-6">
          <button 
            onClick={() => navigate(-1)} 
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
              isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:bg-gray-50'
            }`}
          >
            <IoChevronBackOutline size={20} />
          </button>
          
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter">
              histórico.<span className="text-[#e6b32a]">atendimentos</span>
            </h1>
            <p className="text-[8px] md:text-[9px] text-[#e6b32a] uppercase font-black tracking-[4px] mt-1">registros passados</p>
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center flex flex-col items-center justify-center gap-4">
            <div className="w-8 h-8 border-2 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
            <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">carregando registros...</p>
          </div>
        ) : historicoTotal.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-3">
              {currentItems.map(a => (
                <div 
                  key={a._id} 
                  className={`p-5 rounded-[2rem] border transition-all shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                    isDarkMode ? 'bg-[#111] border-white/5 hover:border-[#e6b32a]/20' : 'bg-white border-slate-200 hover:border-[#e6b32a]/50'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      a.status === 'F' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {a.status === 'F' ? <IoReceiptOutline size={24} /> : <IoTimeOutline size={24} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">
                          {new Date(a.datahora).toLocaleDateString('pt-BR')} • {new Date(a.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                        </span>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-lg ${
                          a.status === 'F' ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {a.status === 'F' ? 'finalizado' : 'cancelado'}
                        </span>
                      </div>
                      <h3 className="font-black text-xl lowercase tracking-tighter italic">
                        {getNomeCliente(a.fk_cliente)}
                      </h3>
                      <p className="text-[10px] text-[#e6b32a] font-black uppercase tracking-wider">
                        {a.tipoCorte || 'serviço padrão'}
                      </p>
                    </div>
                  </div>

                  <div className={`px-6 py-4 rounded-2xl flex flex-col items-center md:items-end justify-center min-w-[140px] border ${
                    isDarkMode ? 'bg-black/40 border-white/5' : 'bg-gray-50 border-slate-100'
                  }`}>
                    <span className="text-[9px] text-[#e6b32a] font-black uppercase tracking-widest mb-1">valor</span>
                    <span className="text-xl font-black font-mono tracking-tighter">
                      R$ {(parseFloat(a.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-6 pt-6 pb-12">
                <button 
                  onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0,0); }}
                  disabled={currentPage === 1}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                    currentPage === 1 
                      ? 'opacity-20 cursor-not-allowed border-slate-300' 
                      : 'bg-[#e6b32a] border-transparent text-black shadow-lg shadow-[#e6b32a]/20'
                  }`}
                >
                  <IoChevronBackOutline size={20} />
                </button>
                
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-500">página</span>
                  <span className="text-lg font-black text-[#e6b32a]">{currentPage} <span className="text-slate-400 text-sm">/ {totalPages}</span></span>
                </div>

                <button 
                  onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo(0,0); }}
                  disabled={currentPage === totalPages}
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                    currentPage === totalPages 
                      ? 'opacity-20 cursor-not-allowed border-slate-300' 
                      : 'bg-[#e6b32a] border-transparent text-black shadow-lg shadow-[#e6b32a]/20'
                  }`}
                >
                  <IoChevronForwardOutline size={20} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-32 bg-black/5 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-black/10 dark:border-white/10">
            <p className="text-slate-400 text-[11px] uppercase font-black tracking-[5px]">sem registros no histórico</p>
          </div>
        )}
      </div>
    </div>
  );
}