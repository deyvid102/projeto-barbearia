import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { IoMoon, IoSunny, IoChevronBackOutline } from 'react-icons/io5'; 
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert';

export default function BarbeiroConfiguracoes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success', titulo: '' });

  const [isSenhaModalOpen, setIsSenhaModalOpen] = useState(false);
  const [etapaSenha, setEtapaSenha] = useState(1); 
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);

  const showAlert = (message, type = 'success', titulo = '') => {
    setAlertConfig({ show: true, message, type, titulo });
  };

  const abrirModalSenha = () => {
    setEtapaSenha(1);
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setIsSenhaModalOpen(true);
  };

  const handleProximaEtapa = () => {
    if (etapaSenha === 1) {
      if (!senhaAtual) return showAlert("digite sua senha atual", "error", "erro");
      setEtapaSenha(2);
    } else {
      if (novaSenha !== confirmarNovaSenha) return showAlert("as senhas não coincidem", "error", "erro");
      if (novaSenha.length < 4) return showAlert("a nova senha é muito curta", "error", "erro");
      setIsSenhaModalOpen(false);
      showAlert("senha pronta para ser alterada!", "info", "aviso");
    }
  };

  const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    try {
      const payload = { admin: true };
      if (novaSenha) payload.senha = novaSenha;

      await api.put(`/barbeiros/${id}`, payload);
      showAlert(novaSenha ? "perfil e senha atualizados!" : "configurações salvas!", "success", "sucesso");
      
      setNovaSenha('');
      setSenhaAtual('');
      setTimeout(() => navigate(`/barbeiro/dashboard/${id}`), 2000);
    } catch (error) {
      showAlert(error.response?.data?.message || "erro ao atualizar.", "error", "erro");
    } finally { setLoading(false); }
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-3 md:p-6 pb-24 font-sans transition-colors duration-300`}>
      {alertConfig.show && (
        <CustomAlert 
          titulo={alertConfig.titulo}
          message={alertConfig.message} 
          type={alertConfig.type} 
          onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
        />
      )}

      <div className="max-w-[1000px] mx-auto space-y-8">
        {/* HEADER PADRONIZADO */}
        <header className="flex items-center gap-4 md:gap-6 border-b border-black/5 dark:border-white/5 pb-6">
          <button 
            onClick={() => navigate(-1)} 
            className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all active:scale-90 ${
              isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <IoChevronBackOutline size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter">
              meu.<span className="text-[#e6b32a]">perfil</span>
            </h1>
            <p className="text-[8px] md:text-[9px] text-[#e6b32a] uppercase font-black tracking-[4px] mt-1">ajustes de conta</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* APARÊNCIA */}
          <section className="space-y-4">
            <h2 className="text-[10px] text-slate-400 font-black uppercase tracking-[3px] ml-2">aparência</h2>
            <div className={`p-8 rounded-[2.5rem] border flex items-center justify-between shadow-sm ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
              <div>
                <p className="font-black text-lg lowercase">modo {isDarkMode ? 'escuro' : 'claro'}</p>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">interface adaptável</p>
              </div>
              <button 
                onClick={toggleTheme} 
                className={`w-14 h-8 rounded-full p-1 transition-all duration-500 flex items-center ${isDarkMode ? 'bg-[#e6b32a] justify-end' : 'bg-slate-900 justify-start'}`}
              >
                <div className="w-6 h-6 rounded-full bg-white shadow-xl flex items-center justify-center">
                  {isDarkMode ? <IoMoon size={12} className="text-black" /> : <IoSunny size={12} className="text-slate-900" />}
                </div>
              </button>
            </div>
          </section>

          {/* SEGURANÇA */}
          <section className="space-y-4">
            <h2 className="text-[10px] text-slate-400 font-black uppercase tracking-[3px] ml-2">segurança</h2>
            <button 
              onClick={abrirModalSenha}
              className={`w-full p-8 rounded-[2.5rem] border flex items-center justify-between shadow-sm group transition-all ${isDarkMode ? 'bg-[#111] border-white/5 hover:border-[#e6b32a]/30' : 'bg-white border-slate-100 hover:border-[#e6b32a]'}`}
            >
              <div className="text-left">
                <p className="font-black text-lg lowercase">alterar senha</p>
                <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">proteger conta</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#e6b32a]/10 text-[#e6b32a] flex items-center justify-center group-hover:bg-[#e6b32a] group-hover:text-black transition-all">
                →
              </div>
            </button>
          </section>

          {/* SALVAR TUDO */}
          <section className="md:col-span-2 space-y-4 pt-4">
            <div className={`p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-100 border-slate-200'}`}>
               <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest leading-relaxed mb-6 text-center">
                atualize suas preferências e segurança para manter seu acesso otimizado.
              </p>
              <button 
                onClick={() => setIsConfirmModalOpen(true)}
                disabled={loading}
                className="w-full py-5 bg-slate-900 dark:bg-[#e6b32a] text-white dark:text-black font-black uppercase text-[11px] tracking-widest rounded-[1.5rem] active:scale-95 transition-all shadow-xl disabled:opacity-50"
              >
                {loading ? "sincronizando..." : "confirmar alterações"}
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* MODAL SENHA PADRONIZADO */}
      {isSenhaModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-6 bg-black/90 backdrop-blur-md">
          <div className={`w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 border ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'}`}>
            <div className="text-center">
              <h3 className="text-[#e6b32a] font-black uppercase text-[10px] tracking-[5px] mb-2">
                etapa 0{etapaSenha}
              </h3>
              <p className="font-black lowercase text-xl tracking-tighter">
                {etapaSenha === 1 ? "validação de segurança" : "definir nova senha"}
              </p>
            </div>

            <div className="space-y-4">
              {etapaSenha === 1 ? (
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">senha atual</label>
                  <div className="relative">
                    <input 
                      type={showSenhaAtual ? "text" : "password"}
                      className={`w-full p-4 rounded-2xl outline-none font-bold text-sm border ${isDarkMode ? 'bg-black border-white/10 focus:border-[#e6b32a]' : 'bg-gray-50 border-slate-200'}`}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                    />
                    <button onClick={() => setShowSenhaAtual(!showSenhaAtual)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
                      {showSenhaAtual ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">nova senha</label>
                    <div className="relative">
                      <input 
                        type={showNovaSenha ? "text" : "password"}
                        className={`w-full p-4 rounded-2xl outline-none font-bold text-sm border ${isDarkMode ? 'bg-black border-white/10 focus:border-[#e6b32a]' : 'bg-gray-50 border-slate-200'}`}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                      />
                      <button onClick={() => setShowNovaSenha(!showNovaSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
                        {showNovaSenha ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] font-black uppercase tracking-widest ml-1 opacity-50">confirmar nova</label>
                    <div className="relative">
                      <input 
                        type={showConfirmarSenha ? "text" : "password"}
                        className={`w-full p-4 rounded-2xl outline-none font-bold text-sm border ${isDarkMode ? 'bg-black border-white/10 focus:border-[#e6b32a]' : 'bg-gray-50 border-slate-200'}`}
                        value={confirmarNovaSenha}
                        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                      />
                      <button onClick={() => setShowConfirmarSenha(!showConfirmarSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 opacity-30">
                        {showConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <button 
                onClick={handleProximaEtapa}
                className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl shadow-lg shadow-[#e6b32a]/20"
              >
                {etapaSenha === 1 ? "próximo" : "confirmar alteração"}
              </button>
              <button onClick={() => setIsSenhaModalOpen(false)} className="w-full text-[9px] text-slate-500 font-black uppercase">cancelar</button>
            </div>
          </div>
        </div>
      )}

      <ModalConfirmacao 
        isOpen={isConfirmModalOpen} 
        onClose={() => setIsConfirmModalOpen(false)} 
        onConfirm={handleConfirmSave} 
        mensagem="deseja salvar as alterações no perfil?" 
      />
    </div>
  );
}