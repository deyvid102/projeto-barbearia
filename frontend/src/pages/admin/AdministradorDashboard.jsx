import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
// Importação conforme orientações [2026-02-22] e [2026-02-25]
import CustomAlert from '../../components/CustomAlert'; 
import SelectPersonalizado from '../../components/SelectPersonalizado';
import AdminLayout from '../../layout/layout';

import { 
  IoSaveOutline, IoCreateOutline, IoCloseOutline, 
  IoWallet, IoSyncOutline 
} from 'react-icons/io5';

export default function AdministradorDashboard() {
  const { id } = useParams(); 
  const { isDarkMode } = useTheme(); 
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [configLimites, setConfigLimites] = useState({ inicio: 8, fim: 18 });
  const [loading, setLoading] = useState(true);
  
  const [editingAg, setEditingAg] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'success' });
  
  const [currentTime, setCurrentTime] = useState(new Date());

  const ALTURA_LINHA = 110; 
  const ALTURA_CABECALHO = 56;

  const hoje = new Date();
  const diaDoMes = hoje.getDate();
  const hojeStr = hoje.toISOString().split('T')[0];

  const fetchGlobalData = useCallback(async (isAutoRefresh = false) => {
    try {
      if (!isAutoRefresh) setLoading(true);
      
      const resBeb = await api.get('/barbearias');
      const barbearias = resBeb.data || resBeb || [];
      
      const minhaBarbearia = barbearias.find(b => 
        String(b._id) === String(id) || 
        (b.fk_admin && String(b.fk_admin?._id || b.fk_admin) === String(id)) ||
        (b.agenda_detalhada?.grade?.some(g => g.escalas.some(e => String(e.barbeiroId) === String(id))))
      );

      if (minhaBarbearia) {
        const gradeDia = minhaBarbearia.agenda_detalhada?.grade?.find(g => g.dia === diaDoMes);
        if (gradeDia?.escalas?.length > 0) {
          const todasEntradas = gradeDia.escalas.map(e => parseInt(e.entrada.split(':')[0]));
          const todasSaidas = gradeDia.escalas.map(e => parseInt(e.saida.split(':')[0]));
          setConfigLimites({
            inicio: Math.min(...todasEntradas),
            fim: Math.max(...todasSaidas)
          });
        }
      }

      const [resB, resA, resC] = await Promise.all([
        api.get('/barbeiros'),
        api.get('/agendamentos'),
        api.get('/clientes')
      ]);
      
      const barbeariaId = minhaBarbearia?._id;
      const dataClientes = resC.data || resC || [];
      
      setBarbeiros((resB.data || resB).filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === String(barbeariaId)));
      setAgendamentos((resA.data || resA).filter(a => String(a.fk_barbearia?._id || a.fk_barbearia) === String(barbeariaId)));
      setClientes(dataClientes);

    } catch (error) {
      console.error("Erro fetch:", error);
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  }, [id, diaDoMes]);

  useEffect(() => {
    fetchGlobalData();
    const intervalData = setInterval(() => fetchGlobalData(true), 15000); 
    const intervalTime = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => { clearInterval(intervalData); clearInterval(intervalTime); };
  }, [fetchGlobalData]);

  const getNomeExibicao = (ag) => {
    if (ag.nomeCliente) return ag.nomeCliente;
    const idCliente = ag.fk_cliente?._id || ag.fk_cliente;
    const clienteEncontrado = clientes.find(c => String(c._id) === String(idCliente));
    return clienteEncontrado ? clienteEncontrado.nome : 'Cliente';
  };

  const agendamentosHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr));

  const getEscopoHorarios = () => {
    const escopo = [];
    for (let i = configLimites.inicio; i <= configLimites.fim; i++) {
      escopo.push(`${i < 10 ? '0' + i : i}:00`);
    }
    return escopo;
  };

  const calculateTimelinePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    if (hours < configLimites.inicio || hours > configLimites.fim) return null;
    const horasDesdeInicio = hours - configLimites.inicio;
    const percentualMinutos = minutes / 60;
    return ALTURA_CABECALHO + (horasDesdeInicio * ALTURA_LINHA) + (percentualMinutos * ALTURA_LINHA);
  };

  const handleSaveEdit = async () => {
    try {
      await api.put(`/agendamentos/${editingAg._id}`, { status: editForm.status, valor: editForm.valor });
      setEditingAg(null);
      setAlertConfig({ show: true, titulo: 'Sucesso', mensagem: 'Agenda atualizada.', tipo: 'success' });
      fetchGlobalData(true);
    } catch (err) {
      setAlertConfig({ show: true, titulo: 'Erro', mensagem: 'Falha na operação.', tipo: 'error' });
    }
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 flex flex-col h-full">
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black italic lowercase tracking-tighter">admin.<span className="text-[#e6b32a]">escala</span></h1>
            <p className="text-[10px] font-bold text-[#e6b32a] uppercase tracking-[2px]">Gestão Profissional</p>
          </div>
          <div className={`px-5 py-3 rounded-2xl border flex items-center gap-3 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
            <IoSyncOutline className="animate-spin text-[#e6b32a]" />
            <p className="text-sm font-black">{agendamentosHoje.length} Atendimentos</p>
          </div>
        </header>

        <div className={`relative flex-1 rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
          
          {calculateTimelinePosition() && (
            <div 
              className="absolute left-0 right-0 z-[60] group pointer-events-auto flex items-center cursor-help" 
              style={{ top: `${calculateTimelinePosition()}px`, transition: 'top 0.5s linear' }}
            >
              <div className="w-14 h-[3px] bg-red-600 shadow-[0_0_15px_rgba(220,38,38,0.8)] rounded-full"></div>
              <div className="flex-1 h-[1px] bg-red-600/40"></div>
              
              <div className="absolute left-16 px-2 py-1 bg-red-600 text-white text-[9px] font-black rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          )}

          <div className="overflow-x-auto h-full custom-scrollbar">
            <table className="w-full border-collapse min-w-[1200px] table-fixed">
              <thead>
                <tr style={{ height: `${ALTURA_CABECALHO}px` }}>
                  <th className={`sticky left-0 z-40 w-24 p-2 border-b border-r text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>Horário</th>
                  {barbeiros.map(b => (
                    <th key={b._id} className={`p-2 border-b border-r text-xs font-black uppercase tracking-wider ${isDarkMode ? 'border-white/5 text-white/80' : 'border-slate-100 text-slate-700'}`}>
                      {b.nome.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {getEscopoHorarios().map(hora => {
                  const hInt = parseInt(hora.split(':')[0]);
                  return (
                    <tr key={hora} style={{ height: `${ALTURA_LINHA}px` }}>
                      <td className={`sticky left-0 z-20 p-2 border-b border-r text-center font-mono text-[11px] font-black ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {hora}
                      </td>
                      {barbeiros.map(b => {
                        const ags = agendamentosHoje.filter(a => {
                          const hAg = new Date(a.datahora).getHours();
                          return String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(b._id) && hAg === hInt;
                        });

                        return (
                          <td key={b._id} className={`p-1.5 border-b border-r align-top relative ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className={`grid gap-2 h-full overflow-y-auto custom-scrollbar pr-1 ${ags.length > 1 ? 'grid-cols-2' : 'grid-cols-1'}`}>
                              {ags.map(ag => (
                                <button 
                                  key={ag._id} 
                                  onClick={() => { setEditingAg(ag); setEditForm({...ag}); }}
                                  className={`group w-full p-2.5 rounded-xl text-left border shadow-sm transition-all h-fit hover:scale-[1.02] active:scale-95 
                                    ${ag.status === 'F' 
                                      ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' 
                                      : ag.status === 'C'
                                        ? 'bg-red-500/10 border-red-500/20 text-red-500' // Card vermelho para cancelado
                                        : 'bg-[#e6b32a] text-black border-[#e6b32a]'}`}
                                >
                                  <div className="flex justify-between items-start gap-1">
                                    <p className="text-[9px] font-black uppercase truncate leading-tight">{getNomeExibicao(ag)}</p>
                                    <span className="text-[8px] font-black bg-black/10 px-1 rounded whitespace-nowrap">
                                      {new Date(ag.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                  </div>
                                  <p className="text-[8px] font-bold opacity-80 italic lowercase truncate mt-0.5">{ag.tipoCorte || 'serviço'}</p>
                                  
                                  <div className="flex justify-between items-center mt-1.5 border-t border-black/5 pt-1">
                                    <span className="text-[9px] font-black">R$ {Number(ag.valor || 0).toFixed(2)}</span>
                                    <IoCreateOutline size={12} className="opacity-60" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editingAg && (
        <div className="fixed inset-0 z-[120] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md transition-all">
          <div className={`w-full max-w-md rounded-t-[2.5rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'} animate-in slide-in-from-bottom md:zoom-in duration-300`}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic">ajustar.<span className="text-[#e6b32a]">registro</span></h3>
                <button onClick={() => setEditingAg(null)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><IoCloseOutline size={28}/></button>
              </div>
              <div className="space-y-6">
                <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                   <p className="text-[10px] font-black uppercase text-gray-500 mb-1 tracking-wider">Cliente / Serviço</p>
                   <p className="text-sm font-black uppercase text-[#e6b32a]">{getNomeExibicao(editingAg)}</p>
                   <p className="text-xs font-bold opacity-70 italic">{editingAg.tipoCorte || 'Não especificado'}</p>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-[#e6b32a] tracking-widest ml-1">Status do Atendimento</label>
                  <SelectPersonalizado 
                    options={[{ value: 'A', label: 'Agendado' }, { value: 'F', label: 'Finalizado', color: '#10b981' }, { value: 'C', label: 'Cancelado', color: '#ef4444' }]}
                    value={editForm.status}
                    onChange={(val) => setEditForm({...editForm, status: val})}
                  />
                </div>

                <div className={`p-5 rounded-[2rem] border transition-colors ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-[#e6b32a]/50' : 'bg-slate-50 border-slate-200 focus-within:border-black/30'}`}>
                  <label className="text-[9px] font-black uppercase text-[#e6b32a] mb-2 block tracking-widest ml-1">Valor Cobrado</label>
                  <div className="flex items-center relative">
                      <span className="absolute left-0 font-black text-gray-500 text-xl">R$</span>
                      <input type="number" value={editForm.valor} onChange={(e) => setEditForm({...editForm, valor: e.target.value})} className="w-full bg-transparent border-none focus:ring-0 pl-7 font-black text-3xl py-1 outline-none" />
                  </div>
                </div>

                <button onClick={handleSaveEdit} className="w-full py-5 rounded-[2rem] bg-[#e6b32a] text-black font-black uppercase text-[11px] tracking-[2px] shadow-lg shadow-[#e6b32a]/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3">
                  <IoSaveOutline size={20}/> Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {alertConfig.show && (
        <CustomAlert titulo={alertConfig.titulo} message={alertConfig.mensagem} type={alertConfig.tipo} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />
      )}
    </AdminLayout>
  );
}