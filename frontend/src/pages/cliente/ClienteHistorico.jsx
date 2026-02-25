import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { 
  IoChevronBackOutline, 
  IoChevronForwardOutline, 
  IoTimeOutline, 
  IoReceiptOutline,
  IoArrowBackOutline 
} from 'react-icons/io5';

export default function ClienteHistorico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

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

  const historicoTotal = agendamentos
    .filter(a => a.status === 'F' || a.status === 'C')
    .sort((a, b) => new Date(b.datahora) - new Date(a.datahora));

  // Lógica de Paginação
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historicoTotal.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historicoTotal.length / itemsPerPage);

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-white text-slate-900'}`}>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
        
        {/* Header no padrão Barbeiro */}
        <header className="flex items-center gap-4 pt-4">
          <button 
            onClick={() => navigate(-1)}
            className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
              isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#e6b32a]' : 'bg-slate-50 border-slate-200 hover:border-black'
            }`}
          >
            <IoArrowBackOutline size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-black italic lowercase tracking-tighter leading-none">meus.cortes</h1>
            <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[3px] mt-1">registros passados</p>
          </div>
        </header>

        {loading ? (
          <div className="py-20 text-center animate-pulse text-[10px] uppercase font-black tracking-widest text-slate-400">
            carregando registros...
          </div>
        ) : historicoTotal.length > 0 ? (
          <>
            {/* Lista Vertical (Um abaixo do outro) */}
            <div className="flex flex-col gap-3">
              {currentItems.map(a => (
                <div 
                  key={a._id} 
                  className={`p-4 rounded-[1.5rem] border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all hover:scale-[1.01] group ${
                    isDarkMode ? 'bg-[#111] border-white/5 hover:border-[#e6b32a]/30' : 'bg-slate-50 border-slate-100 hover:border-black/10'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-transform group-hover:rotate-12 ${
                      a.status === 'F' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {a.status === 'F' ? <IoReceiptOutline size={20} /> : <IoTimeOutline size={20} />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
                          {new Date(a.datahora).toLocaleDateString('pt-BR')} • {new Date(a.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                        </span>
                        <span className={`text-[7px] font-black uppercase px-2 py-0.5 rounded-md ${
                          a.status === 'F' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {a.status === 'F' ? 'finalizado' : 'cancelado'}
                        </span>
                      </div>
                      <h3 className="font-black text-lg lowercase tracking-tight leading-none">
                        {getNomeBarbeiro(a.fk_barbeiro)}
                      </h3>
                      <p className="text-[9px] text-slate-500 font-bold uppercase mt-1">
                        {a.tipoCorte === 'C' ? 'cabelo' : a.tipoCorte === 'B' ? 'barba' : 'cabelo+barba'}
                      </p>
                    </div>
                  </div>

                  <div className={`px-5 py-3 rounded-xl flex justify-between md:flex-col md:items-end items-center md:justify-center min-w-[120px] border ${
                    isDarkMode ? 'bg-black/20 border-white/5' : 'bg-white border-slate-200'
                  }`}>
                    <span className="text-[8px] text-slate-400 dark:text-[#e6b32a] font-black uppercase">valor</span>
                    <span className="text-lg font-black font-mono tracking-tighter">
                      r$ {a.valor?.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-4 pt-6 pb-10">
                <button 
                  onClick={() => { setCurrentPage(prev => Math.max(prev - 1, 1)); window.scrollTo(0,0); }}
                  disabled={currentPage === 1}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                    currentPage === 1 
                      ? 'opacity-20 cursor-not-allowed border-slate-200' 
                      : 'dark:border-white/10 hover:border-[#e6b32a] text-[#e6b32a]'
                  }`}
                >
                  <IoChevronBackOutline size={18} />
                </button>
                
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                  página <span className="text-[#e6b32a]">{currentPage}</span> de {totalPages}
                </span>

                <button 
                  onClick={() => { setCurrentPage(prev => Math.min(prev + 1, totalPages)); window.scrollTo(0,0); }}
                  disabled={currentPage === totalPages}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
                    currentPage === totalPages 
                      ? 'opacity-20 cursor-not-allowed border-slate-200' 
                      : 'dark:border-white/10 hover:border-[#e6b32a] text-[#e6b32a]'
                  }`}
                >
                  <IoChevronForwardOutline size={18} />
                </button>
              </div>
            )}
          </>
        ) : (
          <div className={`text-center py-24 border-2 border-dashed rounded-[2rem] ${
            isDarkMode ? 'border-white/5' : 'border-slate-100'
          }`}>
            <p className="text-slate-300 text-[9px] uppercase font-black tracking-widest">sem registros no histórico</p>
          </div>
        )}
      </div>
    </div>
  );
}