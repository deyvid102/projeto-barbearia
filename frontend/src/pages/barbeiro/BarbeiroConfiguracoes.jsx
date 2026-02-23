import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert';

export default function BarbeiroConfiguracoes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [codigoAdmin, setCodigoAdmin] = useState('');
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  // Estado para o CustomAlert
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

  const showAlert = (message, type = 'success') => {
    setAlertConfig({ show: true, message, type });
  };

  const handleSubmitAttempt = (e) => {
    e.preventDefault();
    if (!codigoAdmin) return showAlert("insira o código de administrador", "error");
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    
    try {
      // Endpoint fictício para validar/atualizar código do barbeiro
      await api.put(`/barbeiros/${id}/validar-admin`, { codigoAdmin });
      
      showAlert("código de administrador validado!");
      
      setTimeout(() => {
        navigate(`/barbeiro/${id}`);
      }, 2000);

    } catch (error) {
      showAlert(error.response?.data?.message || "código inválido ou erro na atualização.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 font-sans">
      
      {/* Alerta Customizado */}
      {alertConfig.show && (
        <CustomAlert 
          message={alertConfig.message} 
          type={alertConfig.type} 
          onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
        />
      )}

      <div className="max-w-md mx-auto space-y-10">
        
        <header className="flex items-center gap-4 pt-4 border-b border-white/5 pb-6">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-400 hover:border-[#e6b32a] hover:text-[#e6b32a] transition-all"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-black text-white lowercase tracking-tighter leading-none">configurações</h1>
            <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[3px] mt-1">painel barbeiro</p>
          </div>
        </header>

        <form onSubmit={handleSubmitAttempt} className="space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[0.3em] px-2">acesso administrativo</h2>
            <div className="bg-[#111] p-6 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest pl-1">código de administrador</label>
                <input 
                  type="password"
                  required
                  placeholder="••••••••"
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#e6b32a] transition-colors tracking-[0.5em]"
                  value={codigoAdmin}
                  onChange={(e) => setCodigoAdmin(e.target.value)}
                />
                <p className="text-[8px] text-gray-600 uppercase font-bold px-1 mt-2">
                  este código permite acesso a funções restritas do sistema.
                </p>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#e6b32a] text-black font-black uppercase text-[11px] tracking-[2px] rounded-[1.5rem] shadow-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "verificando..." : "salvar configurações"}
          </button>
        </form>
      </div>

      <ModalConfirmacao 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        mensagem="deseja aplicar este código de administrador?"
      />
    </div>
  );
}