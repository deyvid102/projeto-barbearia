import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { useTheme } from '../../components/ThemeContext';
import { FaWhatsapp, FaTrashAlt, FaCheck } from 'react-icons/fa';

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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-[#e6b32a] font-black uppercase tracking-[5px] animate-pulse">sincronizando agenda...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 pb-20">
        
        <header className="flex items-center gap-6 border-b border-slate-100 dark:border-white/5 pb-8 mb-12">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-black dark:hover:border-[#e6b32a] shadow-sm transition-all"
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-black lowercase tracking-tighter">minha.agenda</h1>
            <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[4px] mt-2">próximos dias</p>
          </div>
        </header>

        {Object.keys(agenda).length === 0 ? (
          <div className="text-center py-32 bg-slate-50 dark:bg-[#111] rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
            <p className="text-slate-400 uppercase font-black text-[10px] tracking-widest">sem agendamentos pendentes</p>
          </div>
        ) : (
          <div className="space-y-16">
            {Object.entries(agenda).map(([mes, dias]) => (
              <section key={mes} className="space-y-8">
                <h2 className="text-[#e6b32a] font-black uppercase text-xs tracking-[8px] border-l-4 border-[#e6b32a] pl-4">{mes}</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {Object.entries(dias).map(([dia, lista]) => (
                    <div key={dia} className="space-y-4">
                      <p className="text-[11px] text-slate-400 font-black uppercase tracking-[4px]">{dia}</p>
                      <div className="grid gap-3">
                        {lista.map((item) => {
                          const isSelected = agendamentoSelecionado?._id === item._id;
                          return (
                            <div 
                              key={item._id}
                              onClick={() => setAgendamentoSelecionado(isSelected ? null : item)}
                              className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer shadow-sm ${
                                isSelected 
                                  ? 'bg-slate-900 dark:bg-[#e6b32a] text-white dark:text-black scale-[1.02] border-transparent' 
                                  : 'bg-white dark:bg-[#111] border-slate-200 dark:border-white/5 hover:border-[#e6b32a]'
                              }`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-black text-xl">{item.horaFormatada}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.tipoCorte}</span>
                              </div>
                              {isSelected && (
                                <div className="mt-6 pt-6 border-t border-white/10 dark:border-black/10 animate-in fade-in slide-in-from-top-4">
                                  <p className="text-[10px] uppercase font-black mb-1 opacity-50">cliente</p>
                                  <p className="font-black text-2xl lowercase tracking-tighter mb-6">{item.fk_cliente?.nome || 'não identificado'}</p>
                                  
                                  <div className="flex flex-wrap gap-3">
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setAcaoTarget({ id_ag: item._id, status: 'F', mensagem: 'confirmar finalização do atendimento?' }); 
                                        setShowModal(true); 
                                      }} 
                                      className={`flex-1 min-w-[140px] py-4 text-[10px] font-black uppercase rounded-2xl active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2 ${
                                        isDarkMode ? 'bg-black text-white' : 'bg-white text-black'
                                      }`}
                                    >
                                      <FaCheck size={12} /> finalizar
                                    </button>
                                    
                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        setAcaoTarget({ id_ag: item._id, status: 'C', mensagem: 'deseja cancelar este agendamento?' }); 
                                        setShowModal(true); 
                                      }} 
                                      className="px-6 py-4 border border-red-500/30 text-red-500 text-[10px] font-black uppercase rounded-2xl hover:bg-red-500/10 transition-all flex items-center justify-center"
                                    >
                                      <FaTrashAlt size={12} />
                                    </button>

                                    <button 
                                      onClick={(e) => { 
                                        e.stopPropagation(); 
                                        const fone = item.fk_cliente?.telefone?.replace(/\D/g, '');
                                        window.open(`https://wa.me/55${fone}`, '_blank'); 
                                      }} 
                                      className={`px-6 py-4 text-[10px] font-black uppercase rounded-2xl flex items-center justify-center ${
                                        isDarkMode ? 'bg-black/20 text-white' : 'bg-slate-100 text-slate-600'
                                      }`}
                                    >
                                      <FaWhatsapp size={14} />
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
      />
    </div>
  );
}