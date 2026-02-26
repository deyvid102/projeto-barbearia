import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert.jsx'; 

import { 
  IoPersonCircleOutline, 
  IoSettingsOutline, 
  IoLogOutOutline, 
  IoShieldCheckmarkOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoFileTrayFullOutline,
  IoFlashOutline,
  IoStatsChartOutline,
  IoCheckmarkDoneOutline,
  IoShareSocialOutline,
  IoSaveOutline,
  IoCloseOutline,
  IoPricetagOutline,
  IoCreateOutline
} from 'react-icons/io5';

export default function BarbeiroDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiroData, setBarbeiroData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState({ agendamento: null, novoStatus: '', mensagem: '', tipo: '' });
  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'success' });

  // Estados para edição de valor
  const [editingValorId, setEditingValorId] = useState(null);
  const [novoValor, setNovoValor] = useState("");

  const menuRef = useRef();
  const getSafeId = () => id || localStorage.getItem('barbeiroId');

  const handleCopyRegisterLink = () => {
    const barbeariaId = barbeiroData?.fk_barbearia || barbeiroData?.barbeariaId || barbeiroData?._id;
    if (!barbeariaId) {
      setAlertConfig({ show: true, titulo: 'erro', mensagem: 'id da barbearia não localizado.', tipo: 'error' });
      return;
    }
    const registerLink = `${window.location.origin}/cliente/register?barbearia=${barbeariaId}`;
    navigator.clipboard.writeText(registerLink).then(() => {
      setAlertConfig({ show: true, titulo: 'link copiado!', mensagem: 'link de cadastro copiado.', tipo: 'success' });
      setIsProfileOpen(false);
    });
  };

  const fetchData = async (currentId, isAutoRefresh = false) => {
    if (!currentId || currentId === 'undefined') return;
    try {
      if (!isAutoRefresh) setLoading(true);
      const [resAgendados, resClientes, resBarbeirosLista] = await Promise.all([
        api.get(`/agendamentos?fk_barbeiro=${currentId}`),
        api.get('/clientes'),
        api.get('/barbeiros') 
      ]);
      setAgendamentos(resAgendados.data || resAgendados || []);
      setClientes(resClientes.data || resClientes || []);
      const dadosBarbeiro = (resBarbeirosLista.data || resBarbeirosLista || []).find(b => String(b._id) === String(currentId));
      setBarbeiroData(dadosBarbeiro);
    } catch (error) { console.error(error); } finally { if (!isAutoRefresh) setLoading(false); }
  };

  useEffect(() => {
    const barbeiroId = getSafeId();
    if (!barbeiroId) return navigate('/barbeiro/login');
    fetchData(barbeiroId);
    const interval = setInterval(() => fetchData(barbeiroId, true), 10000);
    return () => clearInterval(interval);
  }, [id]);

  const getNomeCliente = (fk) => {
    const clienteId = fk?._id || fk;
    return clientes.find(c => String(c._id) === String(clienteId))?.nome || 'desconhecido';
  };

  const handleUpdateStatus = async () => {
    const { agendamento, novoStatus } = statusTarget;
    try {
      await api.put(`/agendamentos/${agendamento._id}`, { status: novoStatus });
      setIsConfirmModalOpen(false);
      fetchData(getSafeId(), true);
    } catch (error) {
      setAlertConfig({ show: true, titulo: 'erro', mensagem: 'falha ao atualizar status.', tipo: 'error' });
    }
  };

  const handleUpdateValor = async (agendamentoId) => {
    try {
      await api.put(`/agendamentos/${agendamentoId}`, { valor: Number(novoValor) });
      setEditingValorId(null);
      setAlertConfig({ show: true, titulo: 'sucesso', mensagem: 'valor atualizado!', tipo: 'success' });
      fetchData(getSafeId(), true);
    } catch (error) {
      setAlertConfig({ show: true, titulo: 'erro', mensagem: 'falha ao atualizar valor.', tipo: 'error' });
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];
  const pendentesHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr) && a.status === 'A')
    .sort((a, b) => new Date(a.datahora) - new Date(b.datahora));
  
  const lucroHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr) && a.status === 'F').reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const totalFuturo = agendamentos.filter(a => a.status === 'A').length;
  const proximoCliente = pendentesHoje[0];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 pb-20 font-sans transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter">
              {barbeiroData?.nome?.split(' ')[0] || 'barbeiro'}.<span className="text-[#e6b32a]">dash</span>
            </h1>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[4px] mt-1">painel profissional</p>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#e6b32a]' : 'bg-white border-slate-200 hover:border-black'}`}>
              <IoFileTrayFullOutline size={20} />
            </button>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-300 active:scale-90 shadow-sm
                  ${isProfileOpen 
                    ? 'bg-[#e6b32a] text-black border-[#e6b32a]' 
                    : isDarkMode 
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:border-[#e6b32a]/50' 
                      : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-400'
                  }`}
              >
                <IoPersonCircleOutline size={26} className={isProfileOpen ? 'scale-110' : 'opacity-80'} />
              </button>
              
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#111] border dark:border-white/10 rounded-[2rem] shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                  <button onClick={handleCopyRegisterLink} className="w-full px-6 py-4 text-left text-[10px] font-black uppercase flex items-center gap-3 hover:bg-[#e6b32a]/10 transition-colors text-[#e6b32a]">
                    <IoShareSocialOutline size={16} /> copiar link cadastro
                  </button>
                  <button onClick={() => navigate(`/barbeiro/configuracoes/${getSafeId()}`)} className="w-full px-6 py-4 text-left text-[10px] font-black uppercase flex items-center gap-3 hover:bg-[#e6b32a]/10 transition-colors">
                    <IoSettingsOutline size={16} /> configurações
                  </button>
                  {barbeiroData?.admin && (
                    <button onClick={() => navigate(`/admin/dashboard/${getSafeId()}`)} className="w-full px-6 py-4 text-left text-[10px] font-black uppercase text-blue-500 flex items-center gap-3 border-t dark:border-white/5 hover:bg-blue-500/5">
                      <IoShieldCheckmarkOutline size={16} /> painel admin
                    </button>
                  )}
                  <button onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }} className="w-full px-6 py-4 text-left text-[10px] font-black uppercase text-red-500 flex items-center gap-3 border-t dark:border-white/5 hover:bg-red-500/5">
                    <IoLogOutOutline size={16} /> encerrar sessão
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          <NavCard label="estatísticas" value={`r$ ${lucroHoje.toFixed(0)}`} icon={<IoStatsChartOutline />} textColor="text-emerald-500" isDarkMode={isDarkMode} onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} />
          <NavCard label="agenda total" value={totalFuturo} icon={<IoCalendarOutline />} isDarkMode={isDarkMode} onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} />
          
          <div className="col-span-2 lg:col-span-1 bg-[#e6b32a] p-6 rounded-[2.5rem] flex flex-col justify-between text-black relative overflow-hidden transition-all hover:scale-[1.03] active:scale-95 group shadow-lg shadow-[#e6b32a]/10">
            <div className="relative z-10">
              <p className="text-[10px] font-black uppercase opacity-60 mb-1">próximo cliente</p>
              <h2 className="text-2xl font-black truncate tracking-tighter lowercase">{proximoCliente ? getNomeCliente(proximoCliente.fk_cliente).split(' ')[0] : 'nenhum'}</h2>
            </div>
            <div className="mt-4 relative z-10">
               {proximoCliente && (
                 <span className="bg-black text-[#e6b32a] px-3 py-1 rounded-xl text-[11px] font-black font-mono">
                  {new Date(proximoCliente.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                 </span>
               )}
            </div>
            <IoFlashOutline size={100} className="absolute -right-6 -bottom-6 opacity-10 transition-transform group-hover:rotate-12 group-hover:scale-110" />
          </div>
        </div>

        {/* Agendamentos */}
        <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-500">agendamentos de hoje</h3>
              <div className="h-1 w-8 bg-[#e6b32a] mt-1 rounded-full" />
            </div>
            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">{pendentesHoje.length} pendentes</span>
          </div>
          
          <div className="flex flex-col gap-4">
            {pendentesHoje.length > 0 ? (
              pendentesHoje.map(a => (
                <div key={a._id} className={`p-5 rounded-[2.5rem] border flex flex-col lg:flex-row lg:items-center justify-between gap-6 transition-all group ${isDarkMode ? 'bg-[#111] border-white/5 hover:border-[#e6b32a]/20' : 'bg-white border-slate-100 hover:border-black/5 shadow-sm'}`}>
                  
                  <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-3xl bg-[#e6b32a]/10 text-[#e6b32a] flex items-center justify-center shrink-0">
                      <IoTimeOutline size={28} />
                    </div>
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <span className="text-[11px] font-black text-[#e6b32a] font-mono uppercase">{new Date(a.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h</span>
                        <span className="text-[8px] px-2 py-0.5 rounded-lg bg-black/5 dark:bg-white/5 text-gray-500 font-black uppercase tracking-widest border border-black/5 dark:border-white/5">{a.tipoCorte || 'serviço'}</span>
                      </div>
                      <h3 className="text-xl font-black lowercase tracking-tighter leading-none">{getNomeCliente(a.fk_cliente)}</h3>
                    </div>
                  </div>

                  {/* Edição de Preço Otimizada */}
                  <div className="flex items-center lg:justify-center px-2 lg:px-6 lg:border-l lg:border-r border-black/5 dark:border-white/5">
                    {editingValorId === a._id ? (
                      <div className="flex items-center gap-2 w-full lg:w-auto animate-in fade-in slide-in-from-bottom-2">
                        <div className="relative flex-1 lg:flex-none">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-[#e6b32a] font-mono">R$</span>
                          <input 
                            autoFocus
                            type="number" 
                            value={novoValor}
                            onChange={(e) => setNovoValor(e.target.value)}
                            className="w-full lg:w-28 bg-black/10 dark:bg-white/5 border border-[#e6b32a] rounded-xl pl-8 pr-3 py-2 text-sm font-black font-mono outline-none shadow-inner"
                          />
                        </div>
                        <button onClick={() => handleUpdateValor(a._id)} className="p-3 bg-emerald-500 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-emerald-500/20"><IoSaveOutline size={18}/></button>
                        <button onClick={() => setEditingValorId(null)} className="p-3 bg-rose-500 text-white rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-rose-500/20"><IoCloseOutline size={18}/></button>
                      </div>
                    ) : (
                      <button 
                        onClick={() => { setEditingValorId(a._id); setNovoValor(a.valor); }} 
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl transition-all w-full lg:w-auto border border-dashed
                          ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}
                        `}
                      >
                        <div className="text-left flex-1 lg:flex-none">
                          <p className="text-[7px] font-black uppercase tracking-[2px] text-gray-500 mb-0.5">preço atual</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-black font-mono text-[#e6b32a]">R$</span>
                            <span className="text-lg font-black font-mono">{(a.valor || 0).toFixed(2)}</span>
                          </div>
                        </div>
                        <IoCreateOutline size={18} className="text-[#e6b32a] opacity-60 group-hover:opacity-100" />
                      </button>
                    )}
                  </div>

                  {/* Ações */}
                  <div className="flex items-center gap-2 w-full lg:w-auto">
                    <button onClick={() => { setStatusTarget({ agendamento: a, novoStatus: 'C', mensagem: 'remover agendamento?', tipo: 'cancelar' }); setIsConfirmModalOpen(true); }} className="flex-1 lg:px-6 py-4 rounded-2xl border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest hover:bg-rose-500 hover:text-white transition-all active:scale-95">cancelar</button>
                    <button onClick={() => { setStatusTarget({ agendamento: a, novoStatus: 'F', mensagem: 'finalizar atendimento?', tipo: 'confirmar' }); setIsConfirmModalOpen(true); }} className="flex-[2] lg:px-8 py-4 bg-[#e6b32a] text-black text-[10px] font-black uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-95 shadow-lg shadow-[#e6b32a]/20"><IoCheckmarkDoneOutline size={18} /> concluir</button>
                  </div>
                </div>
              ))
            ) : (
              <div className={`py-24 border-2 border-dashed rounded-[3rem] text-center ${isDarkMode ? 'border-white/5 text-gray-600' : 'border-slate-100 text-gray-400'}`}>
                <IoCheckmarkDoneOutline size={40} className="mx-auto mb-4 opacity-20" />
                <p className="text-[10px] uppercase font-black tracking-[4px]">agenda de hoje concluída</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <ModalConfirmacao isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleUpdateStatus} mensagem={statusTarget.mensagem} tipo={statusTarget.tipo} />
      
      {alertConfig.show && (
        <CustomAlert 
          titulo={alertConfig.titulo} 
          message={alertConfig.mensagem} 
          type={alertConfig.tipo} 
          onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
        />
      )}
    </div>
  );
}

function NavCard({ icon, label, value, textColor = "text-[#e6b32a]", onClick, isDarkMode }) {
  return (
    <button onClick={onClick} className={`p-6 rounded-[2.5rem] border hover:scale-[1.03] active:scale-95 transition-all duration-300 text-left group flex flex-col justify-between ${isDarkMode ? 'bg-[#111] border-white/5 hover:bg-[#161616]' : 'bg-white border-slate-100 hover:border-black/10 shadow-sm'}`}>
      <div className="flex justify-between items-center mb-6 text-gray-500 group-hover:text-[#e6b32a] transition-colors">
        <div className="text-2xl">{icon}</div>
        <span className="text-[8px] font-black bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">detalhes</span>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase text-gray-400 mb-1">{label}</p>
        <h2 className={`text-2xl font-black tracking-tighter ${textColor}`}>{value}</h2>
      </div>
    </button>
  );
}