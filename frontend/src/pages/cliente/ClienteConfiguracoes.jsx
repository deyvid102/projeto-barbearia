import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { IoMoon, IoSunny } from 'react-icons/io5'; 
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert.jsx';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function ClienteConfiguracoes() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode, toggleTheme } = useTheme();
  
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  
  const [isSenhaModalOpen, setIsSenhaModalOpen] = useState(false);
  const [etapaSenha, setEtapaSenha] = useState(1); 
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');

  const [showSenhaAtual, setShowSenhaAtual] = useState(false);
  const [showNovaSenha, setShowNovaSenha] = useState(false);
  const [showConfirmarSenha, setShowConfirmarSenha] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    if (!id || id === 'undefined') return navigate('/cliente/login');
    
    const loadCliente = async () => {
      try {
        const res = await api.get(`/clientes/${id}`);
        const cliente = res.data || res;
        setNome(cliente.nome || '');
        setTelefone(cliente.telefone || '');
      } catch (error) {
        console.error("erro ao carregar perfil:", error);
      }
    };
    loadCliente();
  }, [id, navigate]);

  const showAlert = (message, type = 'success') => {
    setAlertConfig({ show: true, message, type });
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
      if (!senhaAtual) return showAlert("digite sua senha atual", "error");
      setEtapaSenha(2);
    } else {
      if (novaSenha !== confirmarNovaSenha) return showAlert("as senhas não coincidem", "error");
      if (novaSenha.length < 4) return showAlert("a nova senha é muito curta", "error");
      setIsSenhaModalOpen(false);
      showAlert("senha preparada para atualização!", "info");
    }
  };

  const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    
    try {
      const payload = { nome, telefone };
      if (novaSenha) payload.senha = novaSenha;

      await api.put(`/clientes/${id}`, payload);
      
      showAlert("perfil atualizado com sucesso!");
      setNovaSenha('');
      setSenhaAtual('');

      setTimeout(() => navigate(`/cliente/${id}`), 2000);
    } catch (error) {
      showAlert(error.response?.data?.message || "erro ao atualizar.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 font-sans ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-white text-slate-900'}`}>
      
      {alertConfig.show && (
        <CustomAlert 
          {...alertConfig}
          onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
        />
      )}

      <div className="max-w-4xl mx-auto p-6 md:p-12">
        
        <header className={`flex items-center gap-6 mb-12 border-b pb-8 ${isDarkMode ? 'border-white/5' : 'border-slate-100'}`}>
          <button 
            onClick={() => navigate(-1)}
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${
              isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#e6b32a]' : 'bg-slate-50 border-slate-200 hover:border-black'
            }`}
          >
            ←
          </button>
          <div>
            <h1 className="text-3xl font-black lowercase tracking-tighter">configurações</h1>
            <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[4px]">ajustes de conta</p>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          <section className="space-y-4 md:col-span-2">
            <h2 className="text-[11px] text-slate-400 font-black uppercase tracking-widest px-2">dados pessoais</h2>
            <div className={`p-8 rounded-[2.5rem] border grid grid-cols-1 md:grid-cols-2 gap-6 shadow-sm ${
              isDarkMode ? 'bg-[#111] border-white/5' : 'bg-slate-50 border-slate-100'
            }`}>
              <div className="space-y-2">
                <label className="text-[9px] text-slate-400 uppercase font-black tracking-widest pl-1">nome completo</label>
                <input 
                  type="text"
                  className={`w-full border rounded-2xl p-4 text-sm outline-none focus:border-[#e6b32a] transition-colors ${
                    isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-slate-400 uppercase font-black tracking-widest pl-1">telefone</label>
                <input 
                  type="text"
                  className={`w-full border rounded-2xl p-4 text-sm outline-none focus:border-[#e6b32a] transition-colors font-mono ${
                    isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[11px] text-slate-400 font-black uppercase tracking-widest px-2">aparência</h2>
            <div className={`p-8 rounded-[2.5rem] border flex items-center justify-between shadow-sm ${
              isDarkMode ? 'bg-[#111] border-white/5' : 'bg-slate-50 border-slate-100'
            }`}>
              <div>
                <p className="font-black text-lg lowercase">modo {isDarkMode ? 'escuro' : 'claro'}</p>
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mt-1">interface adaptável</p>
              </div>
              <button 
                onClick={toggleTheme} 
                className={`w-16 h-9 rounded-full p-1 transition-all duration-500 flex items-center ${isDarkMode ? 'bg-[#e6b32a] justify-end' : 'bg-slate-900 justify-start'}`}
              >
                <div className="w-7 h-7 rounded-full bg-white shadow-xl flex items-center justify-center">
                  {isDarkMode ? <IoMoon size={14} className="text-black" /> : <IoSunny size={14} className="text-slate-900" />}
                </div>
              </button>
            </div>
          </section>

          <section className="space-y-4">
            <h2 className="text-[11px] text-slate-400 font-black uppercase tracking-widest px-2">segurança</h2>
            <div className={`p-2 rounded-[2.5rem] border shadow-sm ${
               isDarkMode ? 'bg-[#111] border-white/5' : 'bg-slate-50 border-slate-100'
            }`}>
              <button 
                type="button"
                onClick={abrirModalSenha}
                className="w-full p-6 flex items-center justify-between group"
              >
                <div className="text-left">
                  <p className="text-sm font-bold">alterar senha</p>
                  <p className="text-[9px] text-slate-400 uppercase tracking-widest">
                    {novaSenha ? "senha alterada (salve abaixo)" : "mudar credenciais de acesso"}
                  </p>
                </div>
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[#e6b32a] group-hover:bg-[#e6b32a] group-hover:text-black transition-all ${
                  isDarkMode ? 'bg-white/5' : 'bg-slate-200'
                }`}>
                  →
                </div>
              </button>
            </div>
          </section>

          <div className="md:col-span-2 pt-4">
            <button 
              onClick={() => setIsConfirmModalOpen(true)}
              disabled={loading}
              className={`w-full py-5 font-black uppercase text-[11px] tracking-[2px] rounded-2xl shadow-xl active:scale-95 transition-all disabled:opacity-50 ${
                isDarkMode ? 'bg-[#e6b32a] text-black' : 'bg-slate-900 text-white'
              }`}
            >
              {loading ? "processando..." : "salvar todas as alterações"}
            </button>
          </div>

        </div>
      </div>

      {/* Modal Senha */}
      {isSenhaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className={`w-full max-w-xs border rounded-[2.5rem] p-8 space-y-6 ${
            isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-slate-200'
          }`}>
            <header className="text-center space-y-2">
              <h3 className={`font-black uppercase text-[10px] tracking-[0.2em] ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {etapaSenha === 1 ? "passo 01: senha atual" : "passo 02: nova senha"}
              </h3>
            </header>

            <div className="space-y-4">
              {etapaSenha === 1 ? (
                <div className="space-y-2">
                  <label className="text-[9px] text-slate-400 uppercase font-black tracking-widest">senha atual</label>
                  <div className="relative">
                    <input 
                      type={showSenhaAtual ? "text" : "password"}
                      autoFocus
                      className={`w-full border rounded-2xl p-4 text-sm outline-none focus:border-[#e6b32a] ${
                        isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      value={senhaAtual}
                      onChange={(e) => setSenhaAtual(e.target.value)}
                    />
                    <button type="button" onClick={() => setShowSenhaAtual(!showSenhaAtual)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                      {showSenhaAtual ? <FaEyeSlash /> : <FaEye />}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-400 uppercase font-black tracking-widest">nova senha</label>
                    <div className="relative">
                      <input 
                        type={showNovaSenha ? "text" : "password"}
                        autoFocus
                        className={`w-full border rounded-2xl p-4 text-sm outline-none focus:border-[#e6b32a] ${
                          isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                        value={novaSenha}
                        onChange={(e) => setNovaSenha(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowNovaSenha(!showNovaSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showNovaSenha ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-slate-400 uppercase font-black tracking-widest">confirmar senha</label>
                    <div className="relative">
                      <input 
                        type={showConfirmarSenha ? "text" : "password"}
                        className={`w-full border rounded-2xl p-4 text-sm outline-none focus:border-[#e6b32a] ${
                          isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                        }`}
                        value={confirmarNovaSenha}
                        onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                      />
                      <button type="button" onClick={() => setShowConfirmarSenha(!showConfirmarSenha)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showConfirmarSenha ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={handleProximaEtapa}
                className={`w-full py-4 font-black uppercase text-[10px] tracking-widest rounded-2xl ${
                  isDarkMode ? 'bg-[#e6b32a] text-black' : 'bg-slate-900 text-white'
                }`}
              >
                {etapaSenha === 1 ? "próximo" : "confirmar"}
              </button>
              <button onClick={() => setIsSenhaModalOpen(false)} className="w-full text-[9px] text-slate-400 uppercase font-black">cancelar</button>
            </div>
          </div>
        </div>
      )}

      <ModalConfirmacao 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={handleConfirmSave}
        mensagem="deseja salvar as alterações no seu perfil?"
      />
    </div>
  );
}