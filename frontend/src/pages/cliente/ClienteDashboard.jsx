import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';

export default function ClienteDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados dos Modais e Menus
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  
  const menuRef = useRef();

  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate('/cliente/login');
      return;
    }
    fetchData();

    // Fecha o menu ao clicar fora dele
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [id, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resAgendados, resBarbeiros] = await Promise.all([
        api.get(`/agendamentos?fk_cliente=${id}`),
        api.get('/barbeiros')
      ]);
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
      fetchData();
    } catch (err) {
      alert("erro ao cancelar");
    }
  };

  const getNomeBarbeiro = (fk) => {
    const bId = fk?._id || fk;
    const encontrado = barbeiros.find(b => String(b._id) === String(bId));
    return encontrado ? encontrado.nome : 'barbeiro';
  };

  const ativos = agendamentos.filter(a => a.status === 'A');

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-4 pb-24 font-sans selection:bg-[#e6b32a] selection:text-black">
      <div className="max-w-md mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-white/5 pb-6 pt-4 relative">
          <div>
            <h1 className="text-xl font-black italic lowercase tracking-tighter leading-none text-white">meus.cortes</h1>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[3px] mt-1">cliente</p>
          </div>

          <div className="flex gap-4 items-center">
            <button 
              onClick={() => navigate(`/cliente/historico/${id}`)}
              className="text-[10px] font-bold text-gray-400 uppercase tracking-[2px] hover:text-[#e6b32a] transition-colors bg-white/5 px-3 py-2 rounded-lg"
            >
              histórico
            </button>

            {/* BOTÃO DE PERFIL COM DROPDOWN */}
            <div className="relative" ref={menuRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${isProfileOpen ? 'border-[#e6b32a] bg-[#e6b32a]/10' : 'border-white/10 bg-white/5'}`}
              >
                <svg className={`w-4 h-4 transition-colors ${isProfileOpen ? 'text-[#e6b32a]' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </button>

              {/* MENU SUSPENSO */}
              {isProfileOpen && (
  <div className="absolute right-0 mt-3 w-48 bg-[#111] border border-white/10 rounded-2xl shadow-2xl py-2 z-50 animate-in fade-in zoom-in-95 duration-200">
    <button 
      onClick={() => { 
        setIsProfileOpen(false); 
        navigate(`/cliente/configuracoes/${id}`); // Rota conectada
      }}
      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#e6b32a] hover:bg-white/5 transition-all"
    >
      ⚙ configurações
    </button>
    <div className="h-[1px] bg-white/5 mx-2 my-1" />
    <button 
      onClick={() => { localStorage.clear(); navigate('/cliente/login'); }}
      className="w-full px-4 py-3 text-left text-[10px] font-black uppercase tracking-widest text-red-500/80 hover:bg-red-500/5 transition-all"
    >
      ✕ sair da conta
    </button>
  </div>
)}
            </div>
          </div>
        </header>

        <button 
          onClick={() => navigate(`/cliente/novo-agendamento/${id}`)}
          className="group relative w-full py-5 bg-[#e6b32a] text-black font-black uppercase text-[11px] rounded-[1.5rem] shadow-xl shadow-[#e6b32a]/5 active:scale-95 transition-all overflow-hidden"
        >
          <span className="relative z-10">+ agendar novo serviço</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        <div className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-[#e6b32a]">próximos cortes</h3>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-[#e6b32a] rounded-full animate-pulse" />
              <span className="text-[8px] text-gray-600 uppercase font-bold">pendente</span>
            </div>
          </div>

          {loading ? (
            <p className="text-center text-[10px] text-gray-600 uppercase font-black animate-pulse py-10">carregando...</p>
          ) : ativos.length === 0 ? (
            <div className="p-10 border border-dashed border-white/5 rounded-[2.5rem] text-center">
              <p className="text-[10px] text-gray-600 font-black uppercase tracking-widest">nenhum horário pendente</p>
            </div>
          ) : (
            <div className="space-y-4">
              {ativos.map(a => (
                <div key={a._id} className="p-6 rounded-[2.5rem] bg-[#111] border border-white/5 shadow-2xl space-y-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="text-[11px] text-[#e6b32a] font-black uppercase tracking-[3px] mb-1">
                        {new Date(a.datahora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
                      </p>
                      <h3 className="text-2xl font-black text-white lowercase tracking-tighter">
                        {getNomeBarbeiro(a.fk_barbeiro)}
                      </h3>
                      <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mt-1">
                        {a.tipoCorte === 'C' ? 'cabelo' : a.tipoCorte === 'B' ? 'barba' : 'cabelo+barba'}
                      </p>
                    </div>

                    <div className="bg-black border border-white/10 px-4 py-3 rounded-2xl min-w-[100px] text-center">
                      <span className="text-[10px] text-[#e6b32a] font-black block leading-none mb-1 uppercase">r$</span>
                      <span className="text-xl font-black text-white tracking-tighter font-mono">
                        {a.valor?.toFixed(2).replace('.', ',')}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-white/5">
                    <button 
                      onClick={() => handleOpenModal(a._id)} 
                      className="w-full py-3 flex items-center justify-center gap-2 bg-red-500/5 hover:bg-red-500/10 text-red-500/60 hover:text-red-500 rounded-xl text-[9px] font-black uppercase tracking-[2px] transition-all"
                    >
                      ✕ cancelar agendamento
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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