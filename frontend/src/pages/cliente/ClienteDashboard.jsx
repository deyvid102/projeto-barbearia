import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';

export default function ClienteDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  useEffect(() => {
    if (!id || id === 'undefined') {
      navigate('/cliente/login');
      return;
    }
    fetchData();
  }, [id, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const resAgendados = await api.get(`/agendamentos?fk_cliente=${id}`);
      const resBarbeiros = await api.get('/barbeiros');

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
      await api.put(`/agendamentos/${selectedId}`, { status: 'C' });
      setIsModalOpen(false);
      fetchData();
    } catch (err) {
      alert("erro ao cancelar");
    }
  };

  const getNomeBarbeiro = (fk) => {
    const bId = fk && typeof fk === 'object' ? fk._id : fk;
    const encontrado = barbeiros.find(b => String(b._id) === String(bId));
    return encontrado ? encontrado.nome : 'barbeiro';
  };

  const ativos = agendamentos.filter(a => a.status === 'A');
  const finalizados = agendamentos.filter(a => a.status === 'F' || String(a.status).toLowerCase() === 'finalizado');
  const cancelados = agendamentos.filter(a => a.status === 'C');

  const RenderCard = ({ a, statusType }) => (
    <div key={a._id} className={`p-6 rounded-[2.5rem] border transition-all duration-300 ${
      statusType === 'C' 
      ? 'opacity-40 border-white/5 bg-transparent' 
      : 'bg-[#111] border-white/5 hover:border-white/10 shadow-xl'
    }`}>
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          {/* Data e Hora com destaque */}
          <div className="flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${statusType === 'A' ? 'bg-[#e6b32a] animate-pulse' : 'bg-gray-600'}`} />
            <p className={`text-[10px] font-black uppercase tracking-widest ${statusType === 'A' ? 'text-[#e6b32a]' : 'text-gray-500'}`}>
              {new Date(a.datahora).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}
            </p>
          </div>

          {/* Barbeiro e Tipo de Corte */}
          <h3 className="font-black text-white text-lg lowercase tracking-tight">
            {getNomeBarbeiro(a.fk_barbeiro)}
          </h3>
          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
            {a.tipoCorte === 'C' ? 'cabelo' : a.tipoCorte === 'B' ? 'barba' : 'cabelo + barba'}
          </p>
          
          {statusType === 'F' && <p className="text-[9px] text-green-500 font-black uppercase tracking-[2px] mt-1">finalizado</p>}
          {statusType === 'A' && (
            <button 
              onClick={() => handleOpenModal(a._id)} 
              className="text-[9px] font-black uppercase text-red-500/80 hover:text-red-500 mt-2 transition-colors underline decoration-red-500/30 underline-offset-4"
            >
              cancelar horário
            </button>
          )}
        </div>

        {/* Preço Chamativo (Badge) */}
        <div className={`flex flex-col items-end gap-1 ${statusType === 'C' ? 'grayscale' : ''}`}>
          <div className="bg-white/5 border border-white/10 px-4 py-2 rounded-2xl shadow-inner">
            <span className="text-[10px] text-[#e6b32a] font-black block text-right leading-none mb-1">R$</span>
            <span className="text-xl font-black text-white tracking-tighter">
              {a.valor?.toFixed(2).replace('.', ',')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 pb-24 font-sans selection:bg-[#e6b32a] selection:text-black">
      <div className="max-w-md mx-auto space-y-10">
        <header className="flex justify-between items-end border-b border-white/5 pb-8 pt-4">
          <div>
            <h1 className="text-2xl font-black italic lowercase tracking-tighter leading-none">meus.cortes</h1>
            <p className="text-[9px] text-gray-500 uppercase font-bold tracking-[3px] mt-1">cliente dashboard</p>
          </div>
          <button 
            onClick={() => { localStorage.clear(); navigate('/cliente/login'); }} 
            className="text-[10px] font-black text-gray-500 hover:text-red-500 uppercase tracking-widest transition-colors"
          >
            sair
          </button>
        </header>

        <button 
          onClick={() => navigate(`/cliente/novo-agendamento/${id}`)}
          className="group relative w-full py-5 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-[2rem] shadow-2xl shadow-[#e6b32a]/10 hover:shadow-[#e6b32a]/20 active:scale-95 transition-all overflow-hidden"
        >
          <span className="relative z-10">+ agendar novo serviço</span>
          <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
        </button>

        <div className="space-y-10">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 space-y-4">
              <div className="w-8 h-8 border-2 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">buscando dados...</p>
            </div>
          ) : (
            <>
              <div className="space-y-6">
                <h3 className="text-[10px] font-black uppercase tracking-[5px] text-[#e6b32a] pl-4">agendados</h3>
                {ativos.length === 0 ? (
                  <div className="p-10 border border-dashed border-white/5 rounded-[2.5rem] text-center">
                    <p className="text-xs text-gray-600 font-bold lowercase">nenhum horário pendente.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ativos.map(a => <RenderCard key={a._id} a={a} statusType="A" />)}
                  </div>
                )}
              </div>

              {finalizados.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[5px] text-gray-600 pl-4">histórico</h3>
                  <div className="space-y-4">
                    {finalizados.map(a => <RenderCard key={a._id} a={a} statusType="F" />)}
                  </div>
                </div>
              )}

              {cancelados.length > 0 && (
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[5px] text-gray-800 pl-4">cancelados</h3>
                  <div className="space-y-4">
                    {cancelados.map(a => <RenderCard key={a._id} a={a} statusType="C" />)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <ModalConfirmacao 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmCancel}
        mensagem="deseja mesmo cancelar seu horário?"
      />
    </div>
  );
}