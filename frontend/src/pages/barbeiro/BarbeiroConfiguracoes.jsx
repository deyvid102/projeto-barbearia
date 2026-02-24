import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { IoMoon, IoSunny } from 'react-icons/io5'; 
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert';

export default function BarbeiroConfiguracoes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

  const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    try {
      await api.put(`/barbeiros/${id}`, { admin: true });
      setAlertConfig({ show: true, message: "privilégios concedidos!", type: 'success' });
      setTimeout(() => navigate(`/barbeiro/${id}`), 2000);
    } catch (error) {
      setAlertConfig({ show: true, message: "erro ao atualizar.", type: 'error' });
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      {alertConfig.show && <CustomAlert {...alertConfig} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />}

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        <header className="flex items-center gap-6 mb-12 border-b border-slate-100 dark:border-white/5 pb-8">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-black dark:hover:border-[#e6b32a] transition-all">←</button>
          <div>
            <h1 className="text-3xl font-black lowercase tracking-tighter">configurações</h1>
            <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[4px]">ajustes de perfil</p>
          </div>
        </header>

        {/* Grid de Configurações: No PC ficam lado a lado */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <section className="space-y-4">
            <h2 className="text-[11px] text-slate-400 font-black uppercase tracking-widest px-2">aparência</h2>
            <div className="bg-slate-50 dark:bg-[#111] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex items-center justify-between shadow-sm">
              <div>
                <p className="font-black text-lg lowercase">modo {isDarkMode ? 'escuro' : 'claro'}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">interface adaptável</p>
              </div>
              <button onClick={toggleTheme} className={`w-16 h-9 rounded-full p-1 transition-all duration-500 flex items-center ${isDarkMode ? 'bg-[#e6b32a] justify-end' : 'bg-slate-900 justify-start'}`}>
                <div className="w-7 h-7 rounded-full bg-white shadow-xl flex items-center justify-center">
                  {isDarkMode ? <IoMoon size={14} className="text-black" /> : <IoSunny size={14} className="text-slate-900" />}
                </div>
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[11px] text-slate-400 font-black uppercase tracking-widest px-2">administrativo</h2>
            <div className="bg-slate-50 dark:bg-[#111] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 space-y-6 shadow-sm">
              <p className="text-[11px] text-slate-400 uppercase font-black tracking-widest leading-relaxed">liberar acesso total aos relatórios e gestão de equipe.</p>
              <button 
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={loading}
                className="w-full py-5 bg-slate-900 dark:bg-[#e6b32a] text-white dark:text-black font-black uppercase text-[11px] rounded-2xl active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? "processando..." : "virar administrador"}
              </button>
            </div>
          </section>

        </div>
      </div>

      <ModalConfirmacao isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={handleConfirmSave} mensagem="deseja ativar o modo administrador?" />
    </div>
  );
}