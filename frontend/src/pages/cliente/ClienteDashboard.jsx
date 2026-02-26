import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert'; 

import { 
  IoPersonCircleOutline, 
  IoSettingsOutline, 
  IoLogOutOutline, 
  IoTimeOutline,
  IoFileTrayFullOutline,
  IoAddCircleOutline,
  IoCalendarClearOutline,
  IoChevronDownOutline,
  IoCloseOutline
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
  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'success' });
  
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
      setAlertConfig({ show: true, titulo: 'Sucesso', mensagem: 'Seu agendamento foi cancelado.', tipo: 'success' });
      fetchData(getSafeId());
    } catch (err) {
      setAlertConfig({ show: true, titulo: 'Erro', mensagem: 'Não foi possível cancelar.', tipo: 'error' });
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
    <div className={`min-h-screen p-4 md:p-6 pb-24 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'}`}>
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        {/* TOP BAR UNIFICADA */}
        <header className="flex justify-between items-center border-b border-black/5 dark:border-white/5 pb-4">
          <div>
            <h1 className="text-xl md:text-2xl font-black italic lowercase tracking-tighter">
              {cliente?.nome?.split(' ')[0] || 'cliente'}.<span className="text-[#e6b32a]">me</span>
            </h1>
            <p className="hidden md:block text-[8px] text-gray-500 uppercase font-black tracking-[3px] mt-1">meu painel pessoal</p>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="flex items-center gap-1.5 md:gap-2 border-r border-black/5 dark:border-white/5 pr-3 md:pr-4 mr-1 md:mr-2">
              <button 
                title="Histórico"
                onClick={() => navigate(`/cliente/historico/${getSafeId()}`)} 
                className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200 shadow-sm'}`}
              >
                <IoFileTrayFullOutline size={20} />
              </button>
            </div>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className={`flex items-center gap-2 p-1.5 rounded-xl border transition-all duration-300 active:scale-95 shadow-sm ${isProfileOpen ? 'bg-[#e6b32a] text-black border-[#e6b32a]' : isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}
              >
                <div className={`w-6 h-6 md:w-7 md:h-7 rounded-lg flex items-center justify-center ${isProfileOpen ? 'bg-white/20' : 'bg-[#e6b32a] text-black'}`}>
                  <IoPersonCircleOutline size={20} />
                </div>
                <IoChevronDownOutline size={12} className={`transition-transform duration-300 ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isProfileOpen && (
                <div className={`absolute right-0 mt-3 w-56 border rounded-3xl shadow-2xl z-50 overflow-hidden ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-100'}`}>
                  <div className="p-4 border-b border-black/5 dark:border-white/5">
                    <p className="text-[8px] font-black uppercase text-[#e6b32a] mb-1">perfil logado</p>
                    <p className="text-[11px] font-bold truncate opacity-80">{cliente?.email}</p>
                  </div>
                  <div className="p-2">
                    <button onClick={() => { navigate(`/cliente/configuracoes/${getSafeId()}`); setIsProfileOpen(false); }} className="w-full flex items-center gap-3 px-3 py-2.5 text-[11px] font-bold hover:opacity-70 transition-colors">
                      <IoSettingsOutline size={16} /> configurações
                    </button>
                  </div>
                  <div className="p-2 border-t border-black/5 dark:border-white/5">
                    <button onClick={() => { localStorage.clear(); navigate('/cliente/login'); }} className="w-full px-3 py-2.5 rounded-lg text-[9px] font-black uppercase text-red-500 flex items-center gap-2 hover:bg-red-500/10 transition-colors">
                      <IoLogOutOutline size={16} /> encerrar sessão
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* LAYOUT PRINCIPAL */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUNA ESQUERDA: AÇÕES E RESUMO */}
          <div className="lg:col-span-4 space-y-4">
            <button 
              onClick={() => navigate(`/cliente/novo-agendamento/${getSafeId()}`)}
              className={`w-full py-8 md:py-12 font-black uppercase text-[10px] md:text-xs tracking-[3px] rounded-[2rem] shadow-xl transition-all duration-500 flex flex-col items-center justify-center gap-4 group active:scale-95
                ${isDarkMode 
                  ? 'bg-[#e6b32a] text-black hover:bg-[#ffc832] hover:shadow-[#e6b32a]/20' 
                  : 'bg-slate-900 text-white hover:bg-black hover:shadow-slate-900/20'
                }`}
            >
              <IoAddCircleOutline size={32} className="group-hover:rotate-90 transition-transform duration-500 ease-out" />
              <span>novo agendamento</span>
            </button>

            <div className={`p-6 rounded-[2rem] border hidden md:block ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
              <div className="flex items-center gap-3 text-[#e6b32a] mb-2">
                <IoCalendarClearOutline size={18} />
                <span className="text-[9px] font-black uppercase tracking-widest">status da conta</span>
              </div>
              <p className="text-xl font-black lowercase tracking-tighter leading-tight">
                {ativos.length} {ativos.length === 1 ? 'compromisso ativo' : 'compromissos ativos'}
              </p>
            </div>
          </div>

          {/* COLUNA DIREITA: LISTAGEM */}
          <div className="lg:col-span-8 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-[10px] font-black uppercase tracking-[3px] text-gray-500 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-[#e6b32a] rounded-full" />
                próximos horários
              </h3>
            </div>

            <div className="space-y-3">
              {ativos.length > 0 ? (
                ativos.map(a => (
                  <div key={a._id} className={`p-5 md:p-6 rounded-[2rem] border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:scale-[1.01] group ${
                    isDarkMode ? 'bg-[#111] border-white/5 hover:border-[#e6b32a]/30' : 'bg-white border-slate-100 hover:border-black/10 shadow-sm'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 md:w-14 md:h-14 rounded-2xl bg-[#e6b32a]/10 text-[#e6b32a] flex items-center justify-center transition-transform group-hover:rotate-6 shrink-0">
                        <IoTimeOutline size={28} />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-black text-[#e6b32a] font-mono uppercase">
                          {new Date(a.datahora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                        </span>
                        <h3 className="text-xl md:text-2xl font-black lowercase tracking-tighter leading-none mt-1 truncate">
                          {getNomeBarbeiro(a.fk_barbeiro)}
                        </h3>
                        <p className="text-[9px] text-gray-500 font-bold uppercase mt-1.5 tracking-wider flex items-center gap-2">
                          <span className="w-1 h-1 bg-emerald-500 rounded-full" />
                          {a.tipoCorte === 'C' ? 'cabelo' : a.tipoCorte === 'B' ? 'barba' : 'completo'} • R$ {a.valor?.toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleOpenModal(a._id)}
                      className="w-full sm:w-auto px-6 py-3 rounded-xl border border-red-500/20 text-red-500 text-[9px] font-black uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all active:scale-95 flex items-center justify-center"
                    >
                      cancelar
                    </button>
                  </div>
                ))
              ) : (
                <div className={`py-20 border-2 border-dashed rounded-[2.5rem] text-center ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
                  <p className="text-gray-400 text-[10px] uppercase font-black tracking-[4px]">nenhum agendamento pendente</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO (REUTILIZANDO O ESTILO MOBILE-FIRST) */}
      <ModalConfirmacao 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        tipo="cancelar"
        mensagem="deseja mesmo cancelar seu horário reservado?"
      />

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