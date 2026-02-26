import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert';
import AdminLayout from '../../layout/layout';

import { 
  IoSaveOutline, IoCreateOutline, IoCloseOutline, 
  IoWallet, IoLockClosed 
} from 'react-icons/io5';

export default function AdministradorDashboard() {
  const { id } = useParams(); 
  const { isDarkMode } = useTheme(); 
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [editingAg, setEditingAg] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'success' });
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const horaInicio = 8;
  const totalHoras = 15; 
  const alturaLinhaPx = 90; 

  const horariosEscopo = Array.from({ length: totalHoras }, (_, i) => {
    const hora = i + horaInicio;
    return `${hora < 10 ? '0' + hora : hora}:00`;
  });

  useEffect(() => {
    if (id) fetchGlobalData();
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, [id]);

  const fetchGlobalData = async () => {
    try {
      const resAdmin = await api.get(`/barbeiros/${id}`);
      const adminData = resAdmin.data || resAdmin;
      const barbeariaId = (adminData.fk_barbearia?._id || adminData.fk_barbearia)?.toString();

      const [resB, resA, resC] = await Promise.all([
        api.get('/barbeiros'),
        api.get('/agendamentos'),
        api.get('/clientes')
      ]);
      
      const todosB = resB.data || resB || [];
      const todosA = resA.data || resA || [];
      const todosC = resC.data || resC || [];

      setBarbeiros(todosB.filter(b => (b.fk_barbearia?._id || b.fk_barbearia)?.toString() === barbeariaId));
      setAgendamentos(todosA.filter(a => (a.fk_barbearia?._id || a.fk_barbearia)?.toString() === barbeariaId));
      setClientes(todosC);
    } catch (error) {
      console.error("Erro fetch:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNomeExibicao = (ag) => {
    if (ag.nomeCliente) return ag.nomeCliente;
    const clienteId = ag.fk_cliente?._id || ag.fk_cliente;
    const encontrado = clientes.find(c => String(c._id) === String(clienteId));
    return encontrado ? encontrado.nome : 'Cliente';
  };

  const handleEditClick = (ag) => {
    setEditingAg(ag);
    setEditForm({ ...ag });
  };

  const handleSaveEdit = async () => {
    try {
      const payload = { status: editForm.status, valor: editForm.valor };
      await api.put(`/agendamentos/${editingAg._id}`, payload);
      setEditingAg(null);
      setAlertConfig({ show: true, titulo: 'Sucesso', mensagem: 'Registro atualizado.', tipo: 'success' });
      fetchGlobalData();
    } catch (err) {
      setAlertConfig({ show: true, titulo: 'Erro', mensagem: 'Falha ao salvar.', tipo: 'error' });
    }
  };

  const calculateTimelinePosition = () => {
    const hours = currentTime.getHours();
    const minutes = currentTime.getMinutes();
    if (hours < horaInicio || hours >= (horaInicio + totalHoras)) return null;
    const diffHours = hours - horaInicio;
    return 45 + (diffHours * alturaLinhaPx) + ((minutes / 60) * alturaLinhaPx);
  };

  const linePosition = calculateTimelinePosition();
  const hojeStr = new Date().toISOString().split('T')[0];
  const agendamentosHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr));
  const dataFormatada = new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' });

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 flex flex-col h-full">
        
        {/* HEADER RESTAURADO */}
        <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black italic lowercase tracking-tighter">admin.<span className="text-[#e6b32a]">escala</span></h1>
            <p className="text-[10px] font-bold text-[#e6b32a] uppercase tracking-[2px] mt-1">{dataFormatada}</p>
          </div>
          <div className="flex gap-4">
            <div className={`px-5 py-3 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">agendamentos hoje</p>
              <p className="text-xl font-black">{agendamentosHoje.length}</p>
            </div>
          </div>
        </header>

        {/* GRADE DE ESCALA (PLANILHA COMPLETA) */}
        <div className={`relative flex-1 rounded-[2.5rem] border overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl'}`}>
          {linePosition && (
            <div className="absolute left-0 right-0 z-30 pointer-events-none flex items-center" style={{ top: `${linePosition}px` }}>
              <div className="w-14 h-[2px] bg-red-500 shadow-[0_0_10px_red]"></div>
              <div className="flex-1 h-[0.5px] bg-red-500/30"></div>
            </div>
          )}

          <div className="overflow-x-auto h-full custom-scrollbar">
            <table className="w-full border-collapse min-w-[1000px]">
              <thead>
                <tr className="h-14">
                  <th className={`sticky left-0 z-40 p-2 border-b border-r text-[10px] font-black uppercase tracking-widest ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-slate-50 border-slate-100'}`}>Horário</th>
                  {barbeiros.map(b => (
                    <th key={b._id} className={`p-2 border-b border-r text-xs font-black uppercase ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                      {b.nome.split(' ')[0]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {horariosEscopo.map(horaFixo => {
                  const horaFixoInt = parseInt(horaFixo.split(':')[0]);
                  return (
                    <tr key={horaFixo} style={{ height: `${alturaLinhaPx}px` }}>
                      <td className={`sticky left-0 z-20 p-2 border-b border-r text-center font-mono text-[11px] font-black ${isDarkMode ? 'bg-[#111] border-white/5 text-gray-500' : 'bg-slate-50 border-slate-100 text-slate-400'}`}>
                        {horaFixo}
                      </td>
                      {barbeiros.map(b => {
                        const ags = agendamentosHoje.filter(a => {
                          const h = new Date(a.datahora).getHours();
                          return String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(b._id) && h === horaFixoInt;
                        });

                        return (
                          <td key={b._id} className={`p-2 border-b border-r align-top relative ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                            <div className="flex flex-col gap-2">
                              {ags.map(ag => (
                                <button 
                                  key={ag._id} 
                                  onClick={() => handleEditClick(ag)}
                                  className={`group w-full p-3 rounded-2xl text-left transition-all border shadow-sm ${
                                    ag.status === 'F' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 
                                    ag.status === 'C' ? 'bg-red-500/10 border-red-500/20 text-red-400' : 
                                    'bg-[#e6b32a] text-black border-[#e6b32a]'
                                  }`}
                                >
                                  <p className="text-[11px] font-black leading-none truncate uppercase tracking-tighter">
                                    {getNomeExibicao(ag)}
                                  </p>
                                  <p className="text-[9px] font-bold mt-1 opacity-80 italic">
                                    {ag.tipoCorte === 'C' ? 'Cabelo' : ag.tipoCorte === 'B' ? 'Barba' : 'Cabelo + Barba'}
                                  </p>
                                  <div className="flex justify-between items-center mt-2 border-t border-black/10 pt-1">
                                    <span className="text-[10px] font-black">R$ {Number(ag.valor).toFixed(2)}</span>
                                    <IoCreateOutline size={12} className="opacity-40" />
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

      {/* MODAL DE EDIÇÃO (RESTURADO E TRAVADO) */}
      {editingAg && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className={`w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl border ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black italic tracking-tighter">ajustar.<span className="text-[#e6b32a]">registro</span></h3>
                <button onClick={() => setEditingAg(null)} className="p-2 text-gray-500 hover:text-red-500 transition-colors"><IoCloseOutline size={28}/></button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 opacity-60">
                  <div className="col-span-2 p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-gray-500 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">cliente</p>
                      <p className="text-xs font-bold">{getNomeExibicao(editingAg)}</p>
                    </div>
                    <IoLockClosed size={14} className="text-gray-500"/>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-gray-500 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">data/hora</p>
                      <p className="text-[10px] font-bold">{new Date(editingAg.datahora).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}</p>
                    </div>
                    <IoLockClosed size={12}/>
                  </div>
                  <div className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-dashed border-gray-500 flex justify-between items-center">
                    <div>
                      <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">profissional</p>
                      <p className="text-[10px] font-bold">{barbeiros.find(b => b._id === (editingAg.fk_barbeiro?._id || editingAg.fk_barbeiro))?.nome}</p>
                    </div>
                    <IoLockClosed size={12}/>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#e6b32a] tracking-widest ml-2">status</label>
                    <select 
                      className={`w-full p-4 rounded-2xl border bg-transparent font-bold ${isDarkMode ? 'border-white/20 text-white' : 'border-slate-200'}`}
                      value={editForm.status}
                      onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    >
                      <option value="A" className="text-black">Agendado</option>
                      <option value="F" className="text-black">Finalizado</option>
                      <option value="C" className="text-black">Cancelado</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#e6b32a] tracking-widest ml-2">valor (r$)</label>
                    <div className="relative">
                      <IoWallet className="absolute left-4 top-1/2 -translate-y-1/2 text-[#e6b32a]" />
                      <input 
                        type="number"
                        className={`w-full p-4 pl-12 rounded-2xl border bg-transparent font-black text-xl ${isDarkMode ? 'border-white/20 text-white' : 'border-slate-200'}`}
                        value={editForm.valor}
                        onChange={(e) => setEditForm({...editForm, valor: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleSaveEdit}
                className="w-full mt-8 bg-[#e6b32a] text-black font-black uppercase py-5 rounded-2xl shadow-lg shadow-[#e6b32a]/20 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <IoSaveOutline size={20}/>
                confirmar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      {alertConfig.show && (
        <CustomAlert 
          titulo={alertConfig.titulo} 
          message={alertConfig.mensagem} 
          type={alertConfig.tipo} 
          onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
        />
      )}
    </AdminLayout>
  );
}