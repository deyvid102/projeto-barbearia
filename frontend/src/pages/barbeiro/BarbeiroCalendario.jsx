import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { useTheme } from '../../components/ThemeContext';

export default function BarbeiroCalendario() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [agenda, setAgenda] = useState({});
  const [loading, setLoading] = useState(true);
  const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [itemParaFinalizar, setItemParaFinalizar] = useState(null);

  useEffect(() => { fetchAgendamentos(); }, [id]);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/agendamentos?fk_barbeiro=${id}&status=A`);
      const dados = res.data || res;
      const hoje = new Date();
      const agrupado = {};

      (Array.isArray(dados) ? dados : []).forEach(ag => {
        const dataAg = new Date(ag.datahora);
        if (dataAg >= hoje) {
          const mes = dataAg.toLocaleDateString('pt-BR', { month: 'long' });
          const dia = dataAg.toLocaleDateString('pt-BR', { day: '2-digit', weekday: 'short' });
          if (!agrupado[mes]) agrupado[mes] = {};
          if (!agrupado[mes][dia]) agrupado[mes][dia] = [];
          agrupado[mes][dia].push({ ...ag, horaFormatada: dataAg.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) });
        }
      });
      setAgenda(agrupado);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const handleFinalizarAgendamento = async () => {
    try {
      await api.patch(`/agendamentos/${itemParaFinalizar._id}`, { status: 'F' });
      fetchAgendamentos();
      setShowModal(false);
      setAgendamentoSelecionado(null);
    } catch (error) { alert("erro ao finalizar"); }
  };

  if (loading) return <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center"><p className="text-[#e6b32a] font-black uppercase tracking-[5px] animate-pulse">sincronizando agenda...</p></div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto p-4 md:p-8 pb-20">
        
        <header className="flex items-center gap-6 border-b border-slate-100 dark:border-white/5 pb-8 mb-12">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-black dark:hover:border-[#e6b32a] transition-all">←</button>
          <div>
            <h1 className="text-3xl font-black lowercase tracking-tighter">minha.agenda</h1>
            <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[4px] mt-2">próximos 90 dias</p>
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
                
                {/* Grid para os dias: No PC os dias podem ficar lado a lado */}
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
                              className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer ${isSelected ? 'bg-slate-900 dark:bg-[#e6b32a] text-white dark:text-black scale-[1.02]' : 'bg-slate-50 dark:bg-[#111] border-slate-100 dark:border-white/5 hover:border-slate-300'}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className="font-mono font-black text-xl">{item.horaFormatada}</span>
                                <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{item.tipoCorte}</span>
                              </div>
                              {isSelected && (
                                <div className="mt-6 pt-6 border-t border-white/10 dark:border-black/10 animate-in fade-in slide-in-from-top-4">
                                  <p className="text-[10px] uppercase font-black mb-1 opacity-50">cliente</p>
                                  <p className="font-black text-2xl lowercase tracking-tighter mb-6">{item.fk_cliente?.nome || 'não identificado'}</p>
                                  <div className="flex gap-3">
                                    <button onClick={(e) => { e.stopPropagation(); setItemParaFinalizar(item); setShowModal(true); }} className="flex-1 py-4 bg-white dark:bg-black text-black dark:text-white text-[10px] font-black uppercase rounded-2xl active:scale-95 transition-all shadow-xl">finalizar corte</button>
                                    <button onClick={(e) => { e.stopPropagation(); window.open(`https://wa.me/${item.fk_cliente?.telefone?.replace(/\D/g, '')}`, '_blank'); }} className="px-6 py-4 bg-white/10 dark:bg-black/10 text-[10px] font-black uppercase rounded-2xl">contato</button>
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

      <ModalConfirmacao isOpen={showModal} onClose={() => setShowModal(false)} onConfirm={handleFinalizarAgendamento} mensagem={`confirmar finalização do atendimento?`} />
    </div>
  );
}