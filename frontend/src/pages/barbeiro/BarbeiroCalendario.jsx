import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { useTheme } from '../../components/ThemeContext';
import { FaWhatsapp, FaTrashAlt, FaCheck } from 'react-icons/fa';
import { IoChevronBackOutline } from 'react-icons/io5';

export default function BarbeiroCalendario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [agenda, setAgenda] = useState({});
  const [loading, setLoading] = useState(true);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [acaoTarget, setAcaoTarget] = useState({ id_ag: null, status: '', mensagem: '' });

  useEffect(() => { 
    if (id) fetchAgendamentos(); 
  }, [id]);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/agendamentos?fk_barbeiro=${id}&status=A`);
      const dados = res.data || res;
      
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0); 
      
      const agrupado = {};

      const agendamentosFiltrados = (Array.isArray(dados) ? dados : []).filter(ag => {
        const dataAg = new Date(ag.datahora);
        return ag.status === 'A' && dataAg >= hoje;
      });

      agendamentosFiltrados.forEach(ag => {
        const dataAg = new Date(ag.datahora);
        const mes = dataAg.toLocaleDateString('pt-BR', { month: 'long' });
        const dia = dataAg.toLocaleDateString('pt-BR', { day: '2-digit', weekday: 'short' });
        
        if (!agrupado[mes]) agrupado[mes] = {};
        if (!agrupado[mes][dia]) agrupado[mes][dia] = [];
        
        agrupado[mes][dia].push({ 
          ...ag, 
          horaFormatada: dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) 
        });
      });
      
      setAgenda(agrupado);
    } catch (error) { 
      console.error("erro ao carregar agenda:", error); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleProcessarStatus = async () => {
    if (!acaoTarget.id_ag) return;
    try {
      await api.put(`/agendamentos/${acaoTarget.id_ag}`, { status: acaoTarget.status });
      setShowModal(false);
      setAgendamentoSelecionado(null);
      setAcaoTarget({ id_ag: null, status: '', mensagem: '' });
      await fetchAgendamentos();
    } catch (error) { 
      console.error("erro ao atualizar:", error);
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-3 md:p-6 pb-24 font-sans transition-colors duration-300`}>
      <div className="max-w-[1400px] mx-auto space-y-8">
        
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
              minha.<span className="text-[#e6b32a]">agenda</span>
            </h1>
            <p className="text-[8px] md:text-[9px] text-[#e6b32a] uppercase font-black tracking-[4px] mt-1">próximos compromissos</p>
          </div>
        </header>

        {Object.keys(agenda).length === 0 ? (
          <div className="text-center py-24 bg-black/5 dark:bg-white/5 rounded-[2.5rem] border border-dashed border-black/10 dark:border-white/10">
            <p className="text-slate-400 uppercase font-black text-[10px] tracking-widest">nenhum agendamento futuro</p>
          </div>
        ) : (
          <div className="space-y-12">
            {Object.entries(agenda).map(([mes, dias]) => (
              <section key={mes} className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="h-[2px] w-8 bg-[#e6b32a]"></div>
                   <h2 className="text-[#e6b32a] font-black uppercase text-[11px] tracking-[6px]">{mes}</h2>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {Object.entries(dias).map(([dia, lista]) => (
                    <div key={dia} className="space-y-4">
                      <p className="text-[10px] text-slate-400 font-black uppercase tracking-[3px] ml-2">{dia}</p>
                      <div className="grid gap-3">
                        {lista.map((item) => {
                          const isSelected = agendamentoSelecionado?._id === item._id;
                          return (
                            <div 
                              key={item._id}
                              onClick={() => setAgendamentoSelecionado(isSelected ? null : item)}
                              className={`p-5 rounded-[2rem] border transition-all cursor-pointer shadow-sm ${
                                isSelected 
                                  ? 'bg-slate-900 dark:bg-[#e6b32a] text-white dark:text-black scale-[1.01] border-transparent' 
                                  : isDarkMode 
                                    ? 'bg-[#111] border-white/5 hover:border-[#e6b32a]/50' 
                                    : 'bg-white border-slate-200 hover:border-[#e6b32a]'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                   <span className="font-mono font-black text-xl">{item.horaFormatada}</span>
                                   <div className={`w-[1px] h-4 ${isSelected ? 'bg-white/20 dark:bg-black/20' : 'bg-black/10 dark:white/10'}`}></div>
                                   <span className="text-[11px] font-black lowercase tracking-tighter opacity-80">
                                      {/* Correção aqui: exibe a string do serviço diretamente */}
                                      {item.tipoCorte || 'serviço'}
                                   </span>
                                </div>
                                <span className="text-[10px] font-black opacity-60">R$ {(parseFloat(item.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                              </div>

                              {isSelected && (
                                <div className="mt-6 pt-6 border-t border-white/10 dark:border-black/10 animate-in fade-in slide-in-from-top-2">
                                  <div className="mb-6">
                                    <p className="text-[9px] uppercase font-black mb-1 opacity-50 tracking-widest">cliente</p>
                                    <p className="font-black text-2xl lowercase tracking-tighter italic">
                                      {item.fk_cliente?.nome || item.nomeCliente || 'cliente externo'}
                                    </p>
                                  </div>
                                  
                                  <div className="grid grid-cols-3 gap-3">
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setAcaoTarget({ id_ag: item._id, status: 'F', mensagem: 'finalizar este atendimento?' }); 
                                        setShowModal(true); 
                                      }} 
                                      className={`py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 ${
                                        isDarkMode ? 'bg-black/40 text-white' : 'bg-white/20 text-black'
                                      }`}
                                    >
                                      <FaCheck size={14} className="text-emerald-500" />
                                      <span className="text-[8px] font-black uppercase">concluir</span>
                                    </button>
                                    
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setAcaoTarget({ id_ag: item._id, status: 'C', mensagem: 'cancelar este agendamento?' }); 
                                        setShowModal(true); 
                                      }} 
                                      className={`py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 ${
                                        isDarkMode ? 'bg-black/40 text-white' : 'bg-white/20 text-black'
                                      }`}
                                    >
                                      <FaTrashAlt size={14} className="text-red-500" />
                                      <span className="text-[8px] font-black uppercase">cancelar</span>
                                    </button>

                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const fone = item.fk_cliente?.telefone?.replace(/\D/g, '');
                                        window.open(`https://wa.me/55${fone}`, '_blank'); 
                                      }} 
                                      className={`py-4 rounded-2xl flex flex-col items-center gap-2 transition-all active:scale-95 ${
                                        isDarkMode ? 'bg-black/40 text-white' : 'bg-white/20 text-black'
                                      }`}
                                    >
                                      <FaWhatsapp size={14} className="text-emerald-400" />
                                      <span className="text-[8px] font-black uppercase">whatsapp</span>
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      <ModalConfirmacao 
        isOpen={showModal} 
        onClose={() => setShowModal(false)} 
        onConfirm={handleProcessarStatus} 
        mensagem={acaoTarget.mensagem} 
        tipo={acaoTarget.status === 'C' ? 'remover' : 'confirmar'}
      />
    </div>
  );
}