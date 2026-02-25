import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { useTheme } from '../../components/ThemeContext';

// ícones atualizados para uma estética mais moderna
import { 
  IoPersonCircleOutline, 
  IoSettingsOutline, 
  IoLogOutOutline, 
  IoShieldCheckmarkOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoStatsChartOutline,
  IoWalletOutline,
  IoCloseCircleOutline,
  IoCheckmarkDoneOutline,
  IoFileTrayFullOutline // Ícone para o Histórico
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

  const menuRef = useRef();

  const getSafeId = () => id || localStorage.getItem('barbeiroId');

  const fetchData = async (currentId, isAutoRefresh = false) => {
    if (!currentId || currentId === 'undefined') return;
    try {
      if (!isAutoRefresh) setLoading(true);
      const [resAgendados, resClientes, resBarbeirosLista] = await Promise.all([
        api.get(`/agendamentos?fk_barbeiro=${currentId}`),
        api.get('/clientes'),
        api.get('/barbeiros') 
      ]);

      const agendados = resAgendados.data || resAgendados || [];
      setAgendamentos(Array.isArray(agendados) ? agendados : []);
      setClientes(resClientes.data || resClientes || []);
      setBarbeiroData((resBarbeirosLista.data || resBarbeirosLista || []).find(b => String(b._id) === String(currentId)));
    } catch (error) {
      console.error("erro ao buscar dados:", error);
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    const barbeiroId = getSafeId();
    if (!barbeiroId) return navigate('/barbeiro/login');
    fetchData(barbeiroId);
    const interval = setInterval(() => fetchData(barbeiroId, true), 10000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getNomeCliente = (fk) => {
    const clienteId = fk?._id || fk;
    return clientes.find(c => String(c._id) === String(clienteId))?.nome || 'cliente desconhecido';
  };

  const handleUpdateStatus = async () => {
    const { agendamento, novoStatus } = statusTarget;
    if (!agendamento?._id) return;

    try {
      // Alterado para PUT conforme o sucesso observado no componente Calendário
      await api.put(`/agendamentos/${agendamento._id}`, { status: novoStatus });
      setIsConfirmModalOpen(false);
      fetchData(getSafeId(), true);
    } catch (error) {
      console.error("erro ao atualizar status:", error);
      alert("erro ao atualizar status no servidor");
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];
  const pendentesHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr) && a.status === 'A');
  const lucroHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr) && a.status === 'F').reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const totalFuturo = agendamentos.filter(a => a.status === 'A').length;

  return (
    <div className={`min-h-screen transition-colors duration-300 ${isDarkMode ? 'bg-[#070707] text-gray-100' : 'bg-gray-50 text-slate-900'}`}>
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 pb-24">
        
        <header className={`flex justify-between items-center border-b pb-8 pt-4 ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <div className="animate-in slide-in-from-left duration-500">
            <h1 className={`text-2xl md:text-4xl font-black italic lowercase tracking-tighter leading-none ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {barbeiroData?.nome || 'barbeiro'}<span className="text-[#e6b32a]">.</span>
            </h1>
            <p className={`text-[10px] uppercase font-black tracking-[4px] mt-2 ${isDarkMode ? 'text-[#e6b32a]' : 'text-slate-400'}`}>painel profissional</p>
          </div>

          <div className="flex gap-2 md:gap-3 items-center">
            {/* ÍCONE DE HISTÓRICO */}
            <button 
              onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} 
              className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 ${
                isDarkMode ? 'bg-white/5 text-gray-400 hover:text-[#e6b32a]' : 'bg-white text-slate-400 shadow-sm border border-black/5 hover:text-[#e6b32a]'
              }`}
              title="Histórico de Atendimentos"
            >
              <IoFileTrayFullOutline size={24} />
            </button>

            {/* BOTÃO USER COM HOVER REMODELADO */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-12 h-12 md:w-14 md:h-14 rounded-2xl border flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 group ${
                  isProfileOpen 
                  ? 'border-[#e6b32a] bg-[#e6b32a] text-black shadow-[0_0_20px_rgba(230,179,42,0.3)]' 
                  : (isDarkMode 
                      ? 'border-white/10 bg-white/5 text-gray-400 hover:border-[#e6b32a]/50 hover:bg-[#e6b32a]/5 hover:text-[#e6b32a]' 
                      : 'border-black/10 bg-white text-slate-400 shadow-sm hover:border-[#e6b32a] hover:text-[#e6b32a]')
                }`}
              >
                <IoPersonCircleOutline size={28} className="transition-transform group-hover:rotate-12" />
              </button>

              {isProfileOpen && (
                <div className={`absolute right-0 mt-3 w-64 border rounded-[2rem] shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 slide-in-from-top-2 ${
                  isDarkMode ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-black/5'
                }`}>
                  <button onClick={() => navigate(`/barbeiro/configuracoes/${getSafeId()}`)} className={`w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest flex items-center gap-3 hover:bg-[#e6b32a]/10 hover:text-[#e6b32a] transition-colors ${isDarkMode ? 'text-gray-300' : 'text-slate-600'}`}>
                    <IoSettingsOutline size={18} /> configurações
                  </button>
                  
                  {barbeiroData?.admin && (
                    <button onClick={() => navigate(`/admin/dashboard/${getSafeId()}`)} className="w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#e6b32a] flex items-center gap-3 border-t border-white/5 hover:bg-[#e6b32a]/5">
                      <IoShieldCheckmarkOutline size={18} /> painel admin
                    </button>
                  )}
                  
                  <button onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }} className="w-full px-6 py-4 text-left text-[10px] font-black uppercase tracking-widest text-red-500 flex items-center gap-3 border-t border-white/5 hover:bg-red-500/5">
                    <IoLogOutOutline size={18} /> sair do sistema
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-1 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
              <button onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} className={`p-8 rounded-[2.5rem] border text-left hover:scale-[1.02] transition-all group ${
                isDarkMode ? 'bg-[#0d0d0d] border-white/5 shadow-none' : 'bg-white border-black/5 shadow-xl shadow-black/5'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">faturamento hoje</p>
                  <IoWalletOutline size={20} className="text-green-500" />
                </div>
                <h2 className="text-3xl md:text-4xl font-black text-green-500 font-mono tracking-tighter">
                  R$ {lucroHoje.toFixed(2)}
                </h2>
              </button>
              
              <button onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} className={`p-8 rounded-[2.5rem] border text-left hover:scale-[1.02] transition-all group ${
                isDarkMode ? 'bg-[#0d0d0d] border-white/5 shadow-none' : 'bg-white border-black/5 shadow-xl shadow-black/5'
              }`}>
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest">agenda pendente</p>
                  <IoStatsChartOutline size={20} className="text-[#e6b32a]" />
                </div>
                <h2 className={`text-3xl md:text-4xl font-black font-mono tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {totalFuturo} <span className="text-[10px] text-slate-400 uppercase ml-1">cortes</span>
                </h2>
              </button>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-4">
              <div className="flex items-center gap-3">
                <IoCalendarOutline className="text-[#e6b32a]" size={18} />
                <h2 className={`text-[11px] font-black uppercase tracking-[0.4em] ${isDarkMode ? 'text-[#e6b32a]' : 'text-slate-500'}`}>próximos hoje</h2>
              </div>
              <span className="text-[10px] bg-[#e6b32a] text-black px-3 py-1 rounded-full font-black shadow-lg shadow-[#e6b32a]/20">
                {pendentesHoje.length}
              </span>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {loading ? (
                <div className="col-span-full py-20 text-center text-[10px] uppercase font-black animate-pulse text-gray-500">
                  sincronizando agenda...
                </div>
              ) : pendentesHoje.length > 0 ? (
                pendentesHoje.map(a => (
                  <div key={a._id} className={`p-7 rounded-[2.5rem] border transition-all flex flex-col justify-between h-full group ${
                    isDarkMode 
                    ? 'bg-[#0d0d0d] border-white/5 hover:border-[#e6b32a]/40' 
                    : 'bg-white border-black/5 shadow-lg shadow-black/5 hover:border-[#e6b32a]/30'
                  }`}>
                    <div className="flex justify-between items-start mb-8">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                        isDarkMode ? 'bg-black border border-white/10 text-[#e6b32a]' : 'bg-gray-50 border border-black/5 text-[#e6b32a]'
                      }`}>
                        <IoTimeOutline size={24} />
                      </div>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => { setStatusTarget({ agendamento: a, novoStatus: 'C', mensagem: 'remover da agenda de hoje?', tipo: 'cancelar' }); setIsConfirmModalOpen(true); }}
                          className="w-11 h-11 rounded-xl border border-red-500/20 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all shadow-sm"
                          title="cancelar"
                        >
                          <IoCloseCircleOutline size={20} />
                        </button>
                        <div className={`px-4 py-2 rounded-xl border text-right ${
                          isDarkMode ? 'bg-black border-white/10' : 'bg-gray-50 border-black/5'
                        }`}>
                          <p className="text-[8px] text-slate-400 font-black uppercase">valor</p>
                          <p className={`font-mono font-black text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>r$ {a.valor?.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="mb-8">
                      <p className="text-xs font-black text-[#e6b32a] uppercase tracking-widest mb-1">
                        {new Date(a.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}h
                      </p>
                      <h3 className={`text-2xl font-black lowercase tracking-tighter truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {getNomeCliente(a.fk_cliente)}
                      </h3>
                    </div>

                    <button 
                      onClick={() => { setStatusTarget({ agendamento: a, novoStatus: 'F', mensagem: 'confirmar finalização do corte?', tipo: 'confirmar' }); setIsConfirmModalOpen(true); }}
                      className="w-full py-5 bg-[#e6b32a] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#e6b32a]/20 flex items-center justify-center gap-2"
                    >
                      <IoCheckmarkDoneOutline size={16} strokeWidth={40} />
                      finalizar atendimento
                    </button>
                  </div>
                ))
              ) : (
                <div className={`col-span-full text-center py-20 border-2 border-dashed rounded-[3rem] ${
                  isDarkMode ? 'border-white/5' : 'border-slate-200'
                }`}>
                  <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">nenhum agendamento pendente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalConfirmacao 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleUpdateStatus}
        mensagem={statusTarget.mensagem}
        tipo={statusTarget.tipo}
      />
    </div>
  );
}