import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { FaEdit, FaCalendarAlt } from 'react-icons/fa';
import { useTheme } from '../../components/ThemeContext';

export default function BarbeiroDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [barbeiroData, setBarbeiroData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState({ agendamento: null, novoStatus: '' });

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

  const getNomeCliente = (fk) => {
    const clienteId = fk?._id || fk;
    return clientes.find(c => String(c._id) === String(clienteId))?.nome || 'cliente desconhecido';
  };

  const handleUpdateStatus = async () => {
    const { agendamento, novoStatus } = statusTarget;
    try {
      await api.patch(`/agendamentos/${agendamento._id}`, { status: novoStatus });
      setIsConfirmModalOpen(false);
      fetchData(getSafeId(), true);
    } catch (error) {
      alert("erro ao atualizar status");
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];
  const pendentesHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr) && a.status === 'A');
  const lucroHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr) && a.status === 'F').reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const totalFuturo = agendamentos.filter(a => a.status === 'A').length;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      {/* Container Principal Adaptável */}
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 pb-24">
        
        {/* Header Responsivo */}
        <header className="flex justify-between items-center border-b border-slate-100 dark:border-white/5 pb-8 pt-4">
          <div className="animate-in slide-in-from-left duration-500">
            <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter leading-none">
              {barbeiroData?.nome || 'barbeiro'}
            </h1>
            <p className="text-[10px] text-slate-400 dark:text-[#e6b32a] uppercase font-bold tracking-[4px] mt-2">painel profissional</p>
          </div>

          <div className="flex gap-2 md:gap-4 items-center">
            <button 
              onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} 
              className="hidden sm:block text-[10px] font-bold text-slate-500 dark:text-gray-400 uppercase tracking-[2px] bg-slate-100 dark:bg-white/5 px-4 py-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-white/10 transition-all"
            >
              histórico
            </button>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all ${isProfileOpen ? 'border-slate-900 dark:border-[#e6b32a] bg-slate-900/5 dark:bg-[#e6b32a]/10' : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5'}`}
              >
                <div className="w-2 h-2 rounded-full bg-green-500 absolute top-2 right-2 border-2 border-white dark:border-[#0a0a0a]" />
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#111] border border-slate-100 dark:border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95">
                  <button onClick={() => navigate(`/barbeiro/configuracoes/${getSafeId()}`)} className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5">⚙ configurações</button>
                  {barbeiroData?.admin && <button onClick={() => navigate(`/admin/dashboard/${getSafeId()}`)} className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-[#e6b32a] border-t border-slate-100 dark:border-white/5">⚡ painel admin</button>}
                  <button onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }} className="w-full px-5 py-4 text-left text-[10px] font-black uppercase tracking-widest text-red-500 border-t border-slate-100 dark:border-white/5">✕ sair</button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Layout Grid: 1 coluna no mobile, 3 colunas no PC */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          
          {/* Coluna de Status (Cards) */}
          <div className="lg:col-span-1 space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
              <button onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)} className="bg-slate-50 dark:bg-[#111] p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/10 text-left hover:scale-[1.02] transition-all shadow-sm">
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-2">ganho hoje</p>
                <h2 className="text-2xl md:text-3xl font-black text-green-600 dark:text-green-500 font-mono">r$ {lucroHoje.toFixed(2)}</h2>
              </button>
              
              <button onClick={() => navigate(`/barbeiro/calendario/${getSafeId()}`)} className="bg-slate-50 dark:bg-[#111] p-6 rounded-[2.5rem] border border-slate-100 dark:border-white/10 text-left hover:scale-[1.02] transition-all shadow-sm">
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-2">agenda total</p>
                <h2 className="text-2xl md:text-3xl font-black font-mono">{totalFuturo} <span className="text-[10px] text-slate-400 uppercase ml-1">cortes</span></h2>
              </button>
            </div>
          </div>

          {/* Coluna da Lista de Hoje (Mais larga no PC) */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex justify-between items-center px-4">
              <h2 className="text-[11px] text-slate-400 dark:text-[#e6b32a] font-black uppercase tracking-[0.4em]">próximos hoje</h2>
              <span className="text-[9px] bg-slate-900 dark:bg-[#e6b32a] text-white dark:text-black px-2 py-1 rounded-md font-black">{pendentesHoje.length}</span>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-4">
              {loading ? (
                <div className="col-span-full py-20 text-center text-[10px] uppercase font-black animate-pulse">sincronizando...</div>
              ) : pendentesHoje.length > 0 ? (
                pendentesHoje.map(a => (
                  <div key={a._id} className="p-6 rounded-[2.5rem] bg-slate-50 dark:bg-[#111] border border-slate-100 dark:border-white/5 hover:border-slate-300 dark:hover:border-[#e6b32a]/40 transition-all flex flex-col justify-between h-full">
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 rounded-2xl bg-white dark:bg-black border border-slate-200 dark:border-white/10 flex items-center justify-center text-slate-400 dark:text-[#e6b32a]">
                        <FaCalendarAlt size={20} />
                      </div>
                      <div className="bg-white dark:bg-black px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-right">
                        <p className="text-[8px] text-slate-400 font-black uppercase">valor</p>
                        <p className="font-mono font-black text-sm">r$ {a.valor?.toFixed(2)}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-[11px] text-[#e6b32a] font-black uppercase tracking-widest mb-1">
                        {new Date(a.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <h3 className="text-xl font-black lowercase tracking-tighter mb-4">{getNomeCliente(a.fk_cliente)}</h3>
                    </div>

                    <button 
                      onClick={() => { setStatusTarget({ agendamento: a, novoStatus: 'F' }); setIsConfirmModalOpen(true); }}
                      className="w-full py-4 bg-slate-900 dark:bg-[#e6b32a] text-white dark:text-black font-black uppercase text-[10px] rounded-2xl hover:opacity-90 active:scale-95 transition-all shadow-lg"
                    >
                      finalizar atendimento
                    </button>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-20 border-2 border-dashed border-slate-100 dark:border-white/5 rounded-[3rem]">
                  <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">sem clientes para hoje</p>
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
        mensagem="confirmar finalização do corte?"
      />
    </div>
  );
}