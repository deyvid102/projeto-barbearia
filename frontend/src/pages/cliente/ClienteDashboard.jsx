import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { useTheme } from '../../components/ThemeContext';

import { 
  IoPersonCircleOutline, 
  IoSettingsOutline, 
  IoLogOutOutline, 
  IoTimeOutline,
  IoFileTrayFullOutline,
  IoAddCircleOutline,
  IoCalendarClearOutline
} from 'react-icons/io5';

export default function ClienteDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [cliente, setCliente] = useState(null);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const menuRef = useRef();

  const getSafeId = () => id || localStorage.getItem('clienteId');

  useEffect(() => {
    const clienteId = getSafeId();
    if (!clienteId || clienteId === 'undefined') {
      navigate('/cliente/login');
      return;
    }
    fetchData(clienteId);

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id, navigate]);

  const fetchData = async (currentId) => {
    try {
      setLoading(true);
      const [resAgendados, resBarbeiros, resClientes] = await Promise.all([
        api.get(`/agendamentos?fk_cliente=${currentId}`),
        api.get('/barbeiros'),
        api.get('/clientes')
      ]);

      const listaClientes = resClientes.data || resClientes || [];
      const dados = listaClientes.find(c => String(c._id) === String(currentId));
      
      setCliente(dados);
      setBarbeiros(resBarbeiros.data || resBarbeiros || []);
      setAgendamentos(resAgendados.data || resAgendados || []);
    } catch (error) {
      console.error("erro ao buscar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (aid) => {
    setSelectedId(aid);
    setIsModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      const agendamentoOriginal = agendamentos.find(a => a._id === selectedId);
      await api.put(`/agendamentos/${selectedId}`, { ...agendamentoOriginal, status: 'C' });
      setIsModalOpen(false);
      fetchData(getSafeId());
    } catch (err) {
      alert("erro ao cancelar");
    }
  };

  const getNomeBarbeiro = (fk) => {
    const bId = fk?._id || fk;
    const encontrado = barbeiros.find(b => String(b._id) === String(bId));
    return encontrado ? encontrado.nome : 'barbeiro';
  };

  const ativos = agendamentos
    .filter(a => a.status === 'A')
    .sort((a, b) => new Date(a.datahora) - new Date(b.datahora));

  if (loading && !cliente) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-8 h-8 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 lg:p-12 pb-24 font-sans transition-colors duration-300`}>
      {/* Container Máximo para não esticar demais em monitores grandes */}
      <div className="max-w-6xl mx-auto space-y-10">
        
        {/* Header Responsivo */}
        <header className="flex flex-row justify-between items-center border-b border-black/5 dark:border-white/5 pb-8 pt-4">
          <div>
            <h1 className="text-2xl md:text-4xl font-black italic lowercase tracking-tighter leading-none">
              {cliente?.nome?.split(' ')[0] || 'cliente'}.<span className="text-[#e6b32a]">me</span>
            </h1>
            <p className="text-[8px] md:text-[10px] text-gray-500 uppercase font-black tracking-[3px] md:tracking-[5px] mt-2">meu painel pessoal</p>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => navigate(`/cliente/historico/${getSafeId()}`)}
              title="Histórico"
              className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${
                isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#e6b32a]' : 'bg-white border-slate-200 hover:border-black shadow-sm'
              }`}
            >
              <IoFileTrayFullOutline className="text-lg md:text-2xl" />
            </button>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${
                  isProfileOpen ? 'bg-[#e6b32a] text-black border-[#e6b32a]' : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'
                }`}
              >
                <IoPersonCircleOutline className="text-xl md:text-3xl" />
              </button>
              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-56 bg-white dark:bg-[#111] border dark:border-white/10 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl py-3 z-50 animate-in fade-in zoom-in-95 overflow-hidden">
                  <button onClick={() => navigate(`/cliente/configuracoes/${getSafeId()}`)} className="w-full px-6 py-4 text-left text-[10px] md:text-[11px] font-black uppercase flex items-center gap-3 hover:bg-[#e6b32a]/10 transition-colors">
                    <IoSettingsOutline size={18} /> configurações
                  </button>
                  <button onClick={() => { localStorage.clear(); navigate('/cliente/login'); }} className="w-full px-6 py-4 text-left text-[10px] md:text-[11px] font-black uppercase text-red-500 flex items-center gap-3 border-t dark:border-white/5 hover:bg-red-500/5 transition-all">
                    <IoLogOutOutline size={18} /> encerrar sessão
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Seção Principal - Grid para Desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Lado Esquerdo / Topo: CTA e Status */}
          <div className="lg:col-span-4 space-y-6">
            <button 
              onClick={() => navigate(`/cliente/novo-agendamento/${getSafeId()}`)}
              className="w-full py-8 md:py-12 bg-slate-900 dark:bg-[#e6b32a] text-white dark:text-black font-black uppercase text-sm md:text-base tracking-[3px] rounded-[2.5rem] md:rounded-[3rem] shadow-2xl active:scale-95 transition-all flex flex-col items-center justify-center gap-4 group"
            >
              <IoAddCircleOutline size={32} className="group-hover:rotate-90 transition-transform duration-500" />
              <span>novo agendamento</span>
            </button>

            <div className={`hidden lg:block p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-3 text-[#e6b32a] mb-2">
                <IoCalendarClearOutline size={20} />
                <span className="text-[10px] font-black uppercase tracking-widest">resumo</span>
              </div>
              <p className="text-2xl font-black lowercase tracking-tighter">
                {ativos.length} {ativos.length === 1 ? 'corte agendado' : 'cortes agendados'}
              </p>
            </div>
          </div>

          {/* Lado Direito: Lista de Agendamentos */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex justify-between items-end px-2">
              <div>
                <h3 className="text-[10px] md:text-[11px] font-black uppercase tracking-[3px] text-gray-500">horários reservados</h3>
                <div className="h-1 w-10 bg-[#e6b32a] mt-1 rounded-full" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-4">
              {ativos.length > 0 ? (
                ativos.map(a => (
                  <div key={a._id} className={`p-6 md:p-8 rounded-[2.5rem] border flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-all hover:scale-[1.01] group ${
                    isDarkMode ? 'bg-[#111] border-white/5 hover:border-[#e6b32a]/30' : 'bg-white border-slate-100 hover:border-black/10 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl md:rounded-3xl bg-[#e6b32a]/10 text-[#e6b32a] flex items-center justify-center transition-transform group-hover:rotate-6">
                        <IoTimeOutline className="text-3xl md:text-4xl" />
                      </div>
                      <div>
                        <span className="text-[10px] md:text-[11px] font-black text-[#e6b32a] font-mono uppercase">
                          {new Date(a.datahora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <h3 className="text-2xl md:text-3xl font-black lowercase tracking-tighter leading-none mt-1">
                          {getNomeBarbeiro(a.fk_barbeiro)}
                        </h3>
                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-2 flex items-center gap-2">
                          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          {a.tipoCorte === 'C' ? 'cabelo' : a.tipoCorte === 'B' ? 'barba' : 'cabelo + barba'} • r$ {a.valor?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleOpenModal(a._id)}
                      className="w-full sm:w-auto px-8 py-4 rounded-2xl border border-red-500/20 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      cancelar
                    </button>
                  </div>
                ))
              ) : (
                <div className={`col-span-full py-24 border-2 border-dashed rounded-[3rem] text-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className="text-gray-400 text-[10px] md:text-[12px] uppercase font-black tracking-[4px]">você não tem agendamentos ativos</p>
                  <p className="text-[9px] md:text-[10px] text-gray-500 font-bold uppercase mt-2 tracking-widest">seus próximos cortes aparecerão aqui</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ModalConfirmacao 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        tipo="cancelar"
        mensagem="deseja mesmo cancelar seu horário reservado?"
      />
    </div>
  );
}