import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';

export default function BarbeiroDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const precos = { 'C': 30, 'B': 20, 'CB': 40 };

  useEffect(() => {
    // Tenta pegar o ID da URL ou do localStorage
    const barbeiroId = id || localStorage.getItem('barbeiroId');
    
    if (!barbeiroId || barbeiroId === 'undefined') {
      navigate('/barbeiro/login');
      return;
    }

    fetchData(barbeiroId);
  }, [id, navigate]);

  const fetchData = async (currentId) => {
    try {
      setLoading(true);
      const [resAgendados, resClientes] = await Promise.all([
        api.get(`/agendamentos?fk_barbeiro=${currentId}`),
        api.get('/clientes')
      ]);

      // Garantindo que pegamos .data e que seja um array
      const agendados = resAgendados.data || resAgendados || [];
      const clis = resClientes.data || resClientes || [];

      setAgendamentos(Array.isArray(agendados) ? agendados : []);
      setClientes(Array.isArray(clis) ? clis : []);
    } catch (error) {
      console.error("erro ao buscar dados do barbeiro:", error);
    } finally {
      setLoading(false);
    }
  };

  const getNomeCliente = (fk) => {
    // Lida se fk for objeto (populate) ou apenas ID string
    const clienteId = fk?._id || fk;
    return clientes.find(c => String(c._id) === String(clienteId))?.nome || 'cliente desconhecido';
  };

  const handleUpdate = async (agendamento, updates) => {
    try {
      // Importante: usamos a._id que vem do MongoDB
      const agendamentoId = agendamento._id;
      
      if (!agendamentoId) {
        alert("erro: id do agendamento não encontrado");
        return;
      }

      const payload = { ...agendamento, ...updates };
      if (updates.tipoCorte) {
        payload.valor = precos[updates.tipoCorte];
      }

      await api.put(`/agendamentos/${agendamentoId}`, payload);
      
      // Recarrega os dados após a atualização
      fetchData(id || localStorage.getItem('barbeiroId'));
    } catch (error) {
      console.error("erro ao atualizar agendamento:", error);
      alert("erro ao atualizar status");
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 font-sans">
      <div className="max-w-2xl mx-auto space-y-8">
        
        <header className="flex justify-between items-center border-b border-white/5 pb-6">
          <h1 className="text-xl font-black italic lowercase tracking-tighter text-white">
            barber.flow <span className="text-[#e6b32a] not-italic text-xs ml-2">agenda</span>
          </h1>
          <button 
            onClick={() => { localStorage.clear(); navigate('/barbeiro/login'); }} 
            className="text-[10px] font-bold text-red-500 uppercase tracking-widest"
          >
            sair
          </button>
        </header>

        <div className="space-y-4">
          {loading ? (
            <p className="text-center text-xs text-gray-500 animate-pulse">carregando agenda...</p>
          ) : agendamentos.length > 0 ? (
            agendamentos.map(a => (
              <div key={a._id} className={`p-6 rounded-[2rem] border ${a.status !== 'A' ? 'opacity-40 border-white/5' : 'bg-[#111] border-white/10 shadow-xl'}`}>
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[10px] text-[#e6b32a] font-bold uppercase tracking-widest">
                      {new Date(a.datahora).toLocaleString('pt-BR')}
                    </p>
                    <h3 className="text-lg font-bold text-white lowercase">
                      {getNomeCliente(a.fk_cliente)}
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400 uppercase font-bold">
                      <span>{a.status === 'A' ? '⏳ pendente' : a.status === 'F' ? '✅ finalizado' : '❌ cancelado'}</span>
                      <span>•</span>
                      <span>r$ {a.valor?.toFixed(2)}</span>
                    </div>

                    {a.status === 'A' && (
                      <div className="mt-4 flex items-center gap-2">
                        <span className="text-[10px] text-gray-500 uppercase font-bold">serviço:</span>
                        <select 
                          className="bg-black border border-white/10 rounded-lg px-2 py-1 text-xs text-white outline-none focus:border-[#e6b32a]"
                          value={a.tipoCorte} 
                          onChange={e => handleUpdate(a, { tipoCorte: e.target.value })}
                        >
                          <option value="C">cabelo</option>
                          <option value="B">barba</option>
                          <option value="CB">cabelo+barba</option>
                        </select>
                      </div>
                    )}
                  </div>
                  
                  {a.status === 'A' && (
                    <div className="flex flex-row md:flex-col gap-2 justify-end">
                      <button 
                        onClick={() => handleUpdate(a, { status: 'F' })} 
                        className="flex-1 bg-green-600/20 text-green-500 border border-green-600/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-green-600 hover:text-white transition-all"
                      >
                        finalizar
                      </button>
                      <button 
                        onClick={() => handleUpdate(a, { status: 'C' })} 
                        className="flex-1 bg-red-600/20 text-red-500 border border-red-600/30 px-4 py-2 rounded-xl text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all"
                      >
                        cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-20 border-2 border-dashed border-white/5 rounded-[3rem]">
              <p className="text-gray-600 text-xs uppercase font-bold tracking-widest">nenhum agendamento para hoje</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}