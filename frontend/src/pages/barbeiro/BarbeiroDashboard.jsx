import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';

export default function BarbeiroDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAgendamento, setSelectedAgendamento] = useState(null);
  const [editValor, setEditValor] = useState('');
  const [editTipo, setEditTipo] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [statusTarget, setStatusTarget] = useState({ agendamento: null, novoStatus: '' });

  const menuRef = useRef();
  const prevAgendamentosCount = useRef(0);

  const getSafeId = () => id || localStorage.getItem('barbeiroId');

  const fetchData = async (currentId, isAutoRefresh = false) => {
    if (!currentId || currentId === 'undefined') return;
    try {
      if (!isAutoRefresh) setLoading(true);
      const [resAgendados, resClientes] = await Promise.all([
        api.get(`/agendamentos?fk_barbeiro=${currentId}`),
        api.get('/clientes')
      ]);
      const agendados = resAgendados.data || resAgendados || [];
      const clis = resClientes.data || resClientes || [];
      setAgendamentos(Array.isArray(agendados) ? agendados : []);
      setClientes(Array.isArray(clis) ? clis : []);
      prevAgendamentosCount.current = agendados.length;
    } catch (error) {
      console.error("erro ao buscar dados:", error);
    } finally {
      if (!isAutoRefresh) setLoading(false);
    }
  };

  useEffect(() => {
    const barbeiroId = getSafeId();
    if (!barbeiroId || barbeiroId === 'undefined') {
      navigate('/barbeiro/login');
      return;
    }
    if (!id) {
      navigate(`/barbeiro/${barbeiroId}`, { replace: true });
      return;
    }
    fetchData(barbeiroId);

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    
    const interval = setInterval(() => fetchData(barbeiroId, true), 10000);
    return () => {
      clearInterval(interval);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [id, navigate]);

  const getNomeCliente = (fk) => {
    const clienteId = fk?._id || fk;
    return clientes.find(c => String(c._id) === String(clienteId))?.nome || 'cliente desconhecido';
  };

  const confirmUpdateStatus = (agendamento, novoStatus) => {
    setStatusTarget({ agendamento, novoStatus });
    setIsConfirmModalOpen(true);
  };

  const handleUpdateStatus = async () => {
    const { agendamento, novoStatus } = statusTarget;
    try {
      await api.put(`/agendamentos/${agendamento._id}`, { ...agendamento, status: novoStatus });
      setIsConfirmModalOpen(false);
      fetchData(getSafeId(), true);
    } catch (error) {
      alert("erro ao atualizar status");
    }
  };

  const openEditModal = (a) => {
    setSelectedAgendamento(a);
    setEditValor(a.valor);
    setEditTipo(a.tipoCorte);
    setIsEditModalOpen(true);
  };

  const saveEdits = async () => {
    try {
      await api.put(`/agendamentos/${selectedAgendamento._id}`, {
        ...selectedAgendamento,
        valor: Number(editValor),
        tipoCorte: editTipo
      });
      setIsEditModalOpen(false);
      fetchData(getSafeId(), true);
    } catch (error) {
      alert("erro ao salvar alterações");
    }
  };

  const hojeStr = new Date().toISOString().split('T')[0];
  const agendamentosHoje = agendamentos.filter(a => a.datahora.startsWith(hojeStr));
  const pendentesHoje = agendamentosHoje.filter(a => a.status === 'A');
  const finalizadosHoje = agendamentosHoje.filter(a => a.status === 'F');
  const lucroHoje = finalizadosHoje.reduce((acc, curr) => acc + (curr.valor || 0), 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 pb-24 font-sans selection:bg-[#e6b32a] selection:text-black">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-white/5 pb-6 pt-4 relative">
          <div>
            <h1 className="text-xl font-black italic lowercase tracking-tighter leading-none text-white">
              barber.flow
            </h1>
            <p className="text-[9px] text-[#e6b32a] uppercase font-bold tracking-[3px] mt-1">barbeiro</p>
          </div>

          <div className="flex gap-4 items-center">
            <button 
              onClick={() => navigate(`/barbeiro/historico/${getSafeId()}`)} 
              className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] hover:text-[#e6b32a] transition-colors bg-white/5 px-3 py-2 rounded-lg"
            >
              histórico
            </button>

            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-10 h-10 rounded-full border flex items-center justify-center transition-all ${isProfileOpen ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-white/10 bg-white/5'}`}
              >
                <svg className={`w-5 h-5 transition-colors ${isProfileOpen ? 'text-[#e6b32a]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-3 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                  <button 
                    onClick={() => { 
                      setIsProfileOpen(false); 
                      navigate(`/barbeiro/configuracoes/${getSafeId()}`);
                    }}
                    className="w-full px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#e6b32a] hover:bg-white/5 transition-all"
                  >
                    ⚙ configurações
                  </button>
                  <div className="h-[1px] bg-white/5 mx-2 my-1" />
                  <button 
                    onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }}
                    className="w-full px-4 py-4 text-left text-[10px] font-black uppercase tracking-widest text-red-500/80 hover:bg-red-500/5 transition-all"
                  >
                    ✕ sair da conta
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => navigate(`/barbeiro/estatisticas/${getSafeId()}`)}
            className="bg-[#111] p-5 rounded-[2rem] border border-white/10 text-left hover:border-[#e6b32a]/40 transition-all active:scale-95 group"
          >
            <div className="flex justify-between items-center mb-1">
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest group-hover:text-[#e6b32a]">ganho hoje</p>
              <span className="text-[#e6b32a] text-[10px] opacity-0 group-hover:opacity-100 transition-opacity">→</span>
            </div>
            <h2 className="text-xl font-black text-green-500 font-mono">r$ {lucroHoje.toFixed(2)}</h2>
          </button>
          <div className="bg-[#111] p-5 rounded-[2rem] border border-white/10">
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">cortes</p>
            <h2 className="text-xl font-black text-white font-mono">{finalizadosHoje.length}</h2>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[0.3em]">próximos</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[8px] text-gray-600 uppercase font-bold">ao vivo</span>
            </div>
          </div>
          
          {loading ? (
            <p className="text-center text-[10px] text-gray-600 uppercase font-black animate-pulse py-10">sincronizando agenda...</p>
          ) : pendentesHoje.length > 0 ? (
            pendentesHoje.map(a => (
              <div key={a._id} className="p-6 rounded-[2.5rem] bg-[#111] border border-white/5 shadow-2xl space-y-6">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-[11px] text-[#e6b32a] font-black uppercase tracking-[3px] mb-1">
                      {new Date(a.datahora).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                    <h3 className="text-2xl font-black text-white lowercase tracking-tighter">
                      {getNomeCliente(a.fk_cliente)}
                    </h3>
                    {/* Botão de Editar mais robusto para Mobile */}
                    <button 
                      onClick={() => openEditModal(a)}
                      className="mt-4 flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2.5 rounded-2xl text-[10px] text-[#e6b32a] font-black uppercase tracking-widest active:scale-95 active:bg-white/10 transition-all"
                    >
                      <span>✎ {a.tipoCorte === 'C' ? 'cabelo' : a.tipoCorte === 'B' ? 'barba' : 'cabelo+barba'}</span>
                    </button>
                  </div>
                  <div className="bg-black border border-white/10 px-4 py-3 rounded-2xl min-w-[100px] text-center ml-4">
                    <span className="text-[10px] text-[#e6b32a] font-black block leading-none mb-1 uppercase">r$</span>
                    <span className="text-xl font-black text-white tracking-tighter font-mono">
                      {a.valor?.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <button 
                    onClick={() => confirmUpdateStatus(a, 'F')} 
                    className="group relative overflow-hidden py-5 bg-[#e6b32a] text-black font-black uppercase text-[11px] rounded-[1.5rem] shadow-xl active:scale-95 transition-all"
                  >
                    <span className="relative z-10">finalizar atendimento</span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                  <div className="pt-2 border-t border-white/5">
                    <button 
                      onClick={() => confirmUpdateStatus(a, 'C')} 
                      className="w-full py-4 flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 text-red-500/40 hover:text-red-500 rounded-xl text-[9px] font-black uppercase tracking-[2px] transition-all"
                    >
                      ✕ cancelar horário
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
              <p className="text-gray-600 text-[10px] uppercase font-black tracking-widest">nenhum cliente pendente</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE EDIÇÃO */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#111] border-t md:border border-white/10 w-full max-w-sm rounded-t-[2.5rem] md:rounded-[2.5rem] p-8 space-y-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-white lowercase tracking-tight">ajustar corte</h2>
                <p className="text-[10px] text-gray-500 uppercase font-bold tracking-widest mt-1">altere os detalhes abaixo</p>
              </div>
              {/* X de fechamento maior e com área de clique expandida */}
              <button 
                onClick={() => setIsEditModalOpen(false)} 
                className="w-12 h-12 -mt-4 -mr-4 flex items-center justify-center text-gray-500 hover:text-white transition-colors"
                aria-label="Fechar"
              >
                <span className="text-3xl font-light">×</span>
              </button>
            </div>
            
            <div className="space-y-6">
              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest pl-1">serviço</label>
                <div className="grid grid-cols-3 gap-2">
                  {['C', 'B', 'CB'].map((tipo) => (
                    <button
                      key={tipo}
                      onClick={() => setEditTipo(tipo)}
                      className={`py-4 rounded-xl text-[10px] font-black uppercase transition-all border ${
                        editTipo === tipo 
                        ? 'bg-[#e6b32a] text-black border-[#e6b32a]' 
                        : 'bg-black text-gray-500 border-white/10'
                      }`}
                    >
                      {tipo === 'C' ? 'Cabelo' : tipo === 'B' ? 'Barba' : 'Combo'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] text-gray-400 uppercase font-black tracking-widest pl-1">valor final (r$)</label>
                <input 
                  type="number"
                  min="1"
                  inputMode="decimal"
                  className="w-full bg-black border border-white/10 rounded-2xl p-5 text-3xl font-mono text-white outline-none focus:border-[#e6b32a] transition-colors"
                  value={editValor}
                  onChange={(e) => setEditValor(e.target.value)}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 pb-8 md:pb-0">
              <button 
                onClick={saveEdits} 
                className="w-full py-5 bg-[#e6b32a] text-black rounded-2xl text-[11px] font-black uppercase shadow-lg active:scale-95 transition-all"
              >
                salvar alterações
              </button>
            </div>
          </div>
        </div>
      )}

      <ModalConfirmacao 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleUpdateStatus}
        tipo={statusTarget.novoStatus === 'C' ? 'cancelar' : 'sucesso'}
        mensagem={statusTarget.novoStatus === 'F' 
          ? "deseja finalizar este atendimento e contabilizar o lucro?" 
          : "tem certeza que deseja cancelar este horário?"}
      />
    </div>
  );
}