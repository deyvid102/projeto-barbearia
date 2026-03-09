import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { 
  IoChevronBackOutline, IoChevronForwardOutline, 
  IoTimeOutline, IoReceiptOutline, IoPersonOutline,
  IoCalendarOutline, IoCloseCircleOutline, IoCheckmarkCircleOutline
} from 'react-icons/io5';

export default function BarbeiroHistorico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    const barbeiroId = id || localStorage.getItem('barbeiroId');
    if (!barbeiroId) return navigate('/barbeiro/login');
    fetchData(barbeiroId);
  }, [id, navigate]);

  const fetchData = async (currentId) => {
    try {
      setLoading(true);
      // Ajuste: Buscamos diretamente dos logs para ter precisão de quem cancelou/finalizou
      // Se sua rota de logs ainda não estiver pronta, mantemos agendamentos, mas priorizamos os nomes internos
      const res = await api.get(`/agendamentos?fk_barbeiro=${currentId}`);
      const dados = res.data || res || [];
      
      // Filtramos apenas o que já passou (Finalizado ou Cancelado)
      const filtrados = dados
        .filter(a => a.status === 'F' || a.status === 'C')
        .sort((a, b) => new Date(b.datahora) - new Date(a.datahora));
        
      setHistorico(filtrados);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de exibição de nome baseada no ModelLogs/Novo Agendamento
  const getDisplayNome = (a) => {
    // 1. Tenta pegar o nome direto do objeto cliente (se populado)
    // 2. Tenta pegar do campo cliente_nome (conforme seu ModelLogs)
    // 3. Tenta pegar do campo nomeCliente (comum em agendamentos avulsos)
    return a.cliente?.nome || a.cliente_nome || a.nomeCliente || 'Cliente Avulso';
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = historico.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(historico.length / itemsPerPage);

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 pb-24 transition-colors duration-300`}>
      <div className="max-w-[1000px] mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <button 
              onClick={() => navigate(-1)} 
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${
                isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:shadow-md'
              }`}
            >
              <IoChevronBackOutline size={22} />
            </button>
            <div>
              <h1 className="text-3xl font-black italic lowercase tracking-tighter leading-none">
                histórico.<span className="text-[#e6b32a]">atendimentos</span>
              </h1>
              <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[4px] mt-2">timeline de registros</p>
            </div>
          </div>

          <div className={`px-4 py-2 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
            <span className="text-[10px] font-black uppercase tracking-widest opacity-50">Total: </span>
            <span className="text-sm font-black text-[#e6b32a]">{historico.length} registros</span>
          </div>
        </header>

        {loading ? (
          <div className="py-24 text-center">
            <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] uppercase font-black tracking-widest opacity-40">Sincronizando banco de dados...</p>
          </div>
        ) : historico.length > 0 ? (
          <div className="space-y-4">
            {currentItems.map(a => (
              <div 
                key={a._id} 
                className={`group p-1 rounded-[2.2rem] border transition-all ${
                  isDarkMode ? 'bg-[#111] border-white/5 hover:border-[#e6b32a]/30' : 'bg-white border-slate-200 hover:shadow-xl'
                }`}
              >
                <div className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    {/* Indicador de Status Dinâmico */}
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center relative overflow-hidden ${
                      a.status === 'F' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                    }`}>
                      {a.status === 'F' ? <IoCheckmarkCircleOutline size={32} /> : <IoCloseCircleOutline size={32} />}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-black text-xl lowercase tracking-tighter italic group-hover:text-[#e6b32a] transition-colors">
                          {getDisplayNome(a)}
                        </h3>
                        <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-md ${
                          a.status === 'F' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                        }`}>
                          {a.status === 'F' ? 'Finalizado' : 'Cancelado'}
                        </span>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-y-1 gap-x-4">
                        <div className="flex items-center gap-1.5 opacity-50">
                          <IoCalendarOutline size={12} />
                          <span className="text-[10px] font-bold uppercase">{new Date(a.datahora).toLocaleDateString('pt-BR')}</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-50">
                          <IoTimeOutline size={12} />
                          <span className="text-[10px] font-bold uppercase">{new Date(a.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h</span>
                        </div>
                        <div className="flex items-center gap-1.5 opacity-50">
                          <IoPersonOutline size={12} />
                          <span className="text-[10px] font-bold uppercase">Por: {a.status === 'C' ? (a.canceladoPor || 'Sistema') : (a.finalizadoPor || 'Barbeiro')}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex md:flex-col items-center md:items-end justify-between md:justify-center border-t md:border-t-0 md:border-l border-black/5 dark:border-white/5 pt-4 md:pt-0 md:pl-8">
                    <p className="text-[9px] text-[#e6b32a] font-black uppercase tracking-[3px] mb-1">valor pago</p>
                    <span className="text-2xl font-black font-mono tracking-tighter">
                      R$ {(parseFloat(a.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* Paginação Estilizada */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-8 pt-10">
                <button 
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    currentPage === 1 ? 'opacity-20 grayscale' : 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20 active:scale-90'
                  }`}
                >
                  <IoChevronBackOutline size={24} />
                </button>
                
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 mb-1">Página</p>
                  <p className="text-xl font-black">{currentPage} <span className="text-[#e6b32a]/40 text-sm">/ {totalPages}</span></p>
                </div>

                <button 
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${
                    currentPage === totalPages ? 'opacity-20 grayscale' : 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20 active:scale-90'
                  }`}
                >
                  <IoChevronForwardOutline size={24} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-40 bg-black/5 dark:bg-white/5 rounded-[3rem] border-2 border-dashed border-black/10 dark:border-white/10">
            <IoReceiptOutline className="mx-auto mb-4 opacity-10" size={60} />
            <p className="text-slate-400 text-[11px] uppercase font-black tracking-[5px]">Nenhum registro encontrado</p>
          </div>
        )}
      </div>
    </div>
  );
}