import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert';
import { useTheme } from '../../components/ThemeContext';
import { IoAdd, IoArrowBack, IoTrashOutline, IoClose, IoEyeOutline, IoEyeOffOutline } from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';

export default function BarbeiroGerenciamento() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barbeariaId, setBarbeariaId] = useState(null); 
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ tipo: '', mensagem: '', acao: null });
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '' });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [editingBarbeiro, setEditingBarbeiro] = useState(null);
  
  const [formData, setFormData] = useState({ 
    nome: '', 
    email: '',
    senha: '',
    confirmarSenha: ''
  });

  const fetchDados = async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbeiros');
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        const adminLogado = data.find(b => String(b._id) === String(id));
        
        if (adminLogado) {
          const bId = adminLogado.fk_barbearia?._id || adminLogado.fk_barbearia || adminLogado.barbearia_id;
          setBarbeariaId(bId);

          const filtrados = data.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia || b.barbearia_id) === String(bId));
          const ordenados = filtrados.sort((a, b) => {
            if (String(a._id) === String(id)) return -1;
            if (String(b._id) === String(id)) return 1;
            return 0;
          });

          setBarbeiros(ordenados);
        }
      }
    } catch (error) {
      console.error("erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchDados();
  }, [id]);

  const handleOpenForm = (barbeiro = null) => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (barbeiro) {
      setEditingBarbeiro(barbeiro);
      setFormData({ 
        nome: barbeiro.nome, 
        email: barbeiro.email,
        senha: '',
        confirmarSenha: ''
      });
    } else {
      setEditingBarbeiro(null);
      setFormData({ nome: '', email: '', senha: '', confirmarSenha: '' });
    }
    setIsFormOpen(true);
  };

  const preSubmit = (e) => {
    e.preventDefault();

    if (!editingBarbeiro || formData.senha) {
      if (formData.senha.length < 6) {
        setAlertConfig({ show: true, message: 'a senha deve ter no mínimo 6 caracteres', type: 'error' });
        return;
      }
      if (formData.senha !== formData.confirmarSenha) {
        setAlertConfig({ show: true, message: 'as senhas não coincidem!', type: 'error' });
        return;
      }
    }

    setModalConfig({
      tipo: 'confirmar',
      mensagem: editingBarbeiro ? `salvar alterações em ${editingBarbeiro.nome}?` : `cadastrar ${formData.nome}?`,
      acao: executeSubmit
    });
    setIsConfirmModalOpen(true);
  };

  const executeSubmit = async () => {
    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        admin: editingBarbeiro ? editingBarbeiro.admin : false,
        fk_barbearia: barbeariaId 
      };

      if (formData.senha) {
        payload.senha = formData.senha;
      }

      if (editingBarbeiro) {
        await api.put(`/barbeiros/${editingBarbeiro._id}`, payload);
        setAlertConfig({ show: true, message: 'perfil atualizado!', type: 'success' });
      } else {
        await api.post('/barbeiros', payload); 
        setAlertConfig({ show: true, message: 'barbeiro cadastrado!', type: 'success' });
      }
      
      setIsConfirmModalOpen(false);
      setIsFormOpen(false);
      fetchDados();
    } catch (error) {
      setAlertConfig({ show: true, message: 'erro ao salvar dados', type: 'error' });
      setIsConfirmModalOpen(false);
    }
  };

  const triggerDelete = () => {
    setModalConfig({
      tipo: 'cancelar',
      mensagem: `remover permanentemente ${editingBarbeiro.nome}?`,
      acao: async () => {
        try {
          await api.delete(`/barbeiros/${editingBarbeiro._id}`);
          setAlertConfig({ show: true, message: 'removido!', type: 'success' });
          setIsConfirmModalOpen(false);
          setIsFormOpen(false);
          fetchDados();
        } catch (e) {
          setAlertConfig({ show: true, message: 'erro ao deletar', type: 'error' });
        }
      }
    });
    setIsConfirmModalOpen(true);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#070707] text-gray-200' : 'bg-gray-50 text-slate-900'} font-sans pb-10 transition-colors duration-300`}>
      <div className="max-w-2xl lg:max-w-5xl mx-auto p-5 md:p-10 space-y-8">
        
        <header className={`flex items-center justify-between py-6 border-b ${isDarkMode ? 'border-white/5' : 'border-black/5'}`}>
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => navigate(`/admin/dashboard/${id}`)} 
              className={`w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center border active:scale-90 transition-all text-[#e6b32a] shadow-sm ${
                isDarkMode ? 'bg-[#111] border-white/10' : 'bg-white border-black/10'
              }`}
            >
              <IoArrowBack size={20} className="md:size-6" />
            </button>
            <div>
              <h1 className={`text-2xl md:text-3xl font-black tracking-tighter lowercase leading-tight italic ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                equipe<span className="text-[#e6b32a]">.</span>
              </h1>
              <p className={`text-[9px] md:text-[10px] uppercase font-black tracking-[3px] md:tracking-[4px] ml-1 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                gestão de barbeiros
              </p>
            </div>
          </div>
          
          <button 
            onClick={() => handleOpenForm()}
            className="h-10 md:h-12 px-4 md:px-6 bg-[#e6b32a] text-black rounded-xl md:rounded-2xl flex items-center gap-2 active:scale-95 transition-all shadow-xl shadow-[#e6b32a]/20"
          >
            <IoAdd size={20} className="stroke-[3]" />
            <span className="text-[10px] md:text-xs font-black uppercase tracking-tight">novo</span>
          </button>
        </header>

        {alertConfig.show && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[90%] md:w-auto">
            <CustomAlert 
              message={alertConfig.message} 
              type={alertConfig.type} 
              onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
            />
          </div>
        )}

        {loading ? (
          <div className="flex flex-col items-center py-24 gap-4">
            <div className="w-8 h-8 border-3 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {barbeiros.map((b) => {
              const isMe = String(b._id) === String(id);
              return (
                <div 
                  key={b._id} 
                  onClick={() => handleOpenForm(b)}
                  className={`group p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border flex justify-between items-center active:scale-[0.98] transition-all relative overflow-hidden cursor-pointer shadow-sm ${
                    isMe 
                    ? (isDarkMode ? 'bg-[#111] border-[#e6b32a]/20' : 'bg-white border-[#e6b32a]/40') 
                    : (isDarkMode ? 'bg-[#0d0d0d] border-white/5 hover:border-[#e6b32a]/30' : 'bg-white border-black/5 hover:border-[#e6b32a]/30')
                  }`}
                >
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-lg font-black border ${
                      isMe ? 'bg-[#e6b32a] text-black border-[#e6b32a]' : (isDarkMode ? 'bg-[#111] text-[#e6b32a] border-white/10' : 'bg-gray-50 text-[#e6b32a] border-black/5')
                    }`}>
                      {b.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="max-w-[150px] md:max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <h3 className={`text-base md:text-lg font-black lowercase tracking-tight truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{b.nome}</h3>
                        {isMe && (
                          <span className="bg-[#e6b32a]/10 text-[#e6b32a] text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest border border-[#e6b32a]/20 shrink-0">
                            você
                          </span>
                        )}
                      </div>
                      <p className={`text-[10px] md:text-xs font-medium opacity-80 truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>{b.email}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    isMe ? 'bg-[#e6b32a]/10 text-[#e6b32a]' : (isDarkMode ? 'bg-white/5 text-[#e6b32a] group-hover:bg-[#e6b32a] group-hover:text-black' : 'bg-black/5 text-[#e6b32a] group-hover:bg-[#e6b32a] group-hover:text-black')
                  }`}>
                    <FaEdit size={14} className="md:size-4" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className={`fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md p-4 overflow-y-auto ${isDarkMode ? 'bg-black/95' : 'bg-white/90'}`}>
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          
          <form 
            onSubmit={preSubmit} 
            className={`relative w-full max-w-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-2xl border animate-in zoom-in-95 duration-300 my-auto transition-colors ${
              isDarkMode ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-black/5'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className={`text-xl md:text-2xl font-black lowercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {editingBarbeiro ? 'editar perfil' : 'novo profissional'}
                </h2>
                <div className="h-1 w-10 bg-[#e6b32a] mt-1 rounded-full" />
              </div>
              <div className="flex gap-2">
                {editingBarbeiro && editingBarbeiro._id !== id && (
                  <button 
                    type="button" 
                    onClick={triggerDelete}
                    className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center active:scale-90 transition-all border border-red-500/20 hover:bg-red-500 hover:text-white"
                  >
                    <IoTrashOutline size={20} />
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center active:scale-90 transition-all border ${
                    isDarkMode ? 'bg-white/5 text-gray-400 border-white/10' : 'bg-black/5 text-slate-400 border-black/5'
                  }`}
                >
                  <IoClose size={22} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className={`text-[9px] md:text-[10px] uppercase font-black ml-1 tracking-[2px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>nome completo</label>
                <input 
                  className={`w-full border rounded-xl md:rounded-2xl p-4 text-sm md:text-base outline-none focus:border-[#e6b32a] transition-all ${
                    isDarkMode ? 'bg-[#141414] border-white/10 text-white' : 'bg-gray-50 border-black/5 text-slate-900'
                  }`}
                  placeholder="ex: joão silva"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className={`text-[9px] md:text-[10px] uppercase font-black ml-1 tracking-[2px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>e-mail de acesso</label>
                <input 
                  type="email" 
                  className={`w-full border rounded-xl md:rounded-2xl p-4 text-sm md:text-base outline-none focus:border-[#e6b32a] transition-all ${
                    isDarkMode ? 'bg-[#141414] border-white/10 text-white' : 'bg-gray-50 border-black/5 text-slate-900'
                  }`}
                  placeholder="ex: contato@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className={`text-[9px] md:text-[10px] uppercase font-black ml-1 tracking-[2px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                    {editingBarbeiro ? 'nova senha (opcional)' : 'definir senha'}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className={`w-full border rounded-xl md:rounded-2xl p-4 pr-12 text-sm md:text-base outline-none focus:border-[#e6b32a] transition-all ${
                        isDarkMode ? 'bg-[#141414] border-white/10 text-white' : 'bg-gray-50 border-black/5 text-slate-900'
                      }`}
                      value={formData.senha}
                      onChange={(e) => setFormData({...formData, senha: e.target.value})}
                      required={!editingBarbeiro}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e6b32a] transition-colors"
                    >
                      {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className={`text-[9px] md:text-[10px] uppercase font-black ml-1 tracking-[2px] ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>confirmar senha</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full border rounded-xl md:rounded-2xl p-4 pr-12 text-sm md:text-base outline-none focus:border-[#e6b32a] transition-all ${
                        isDarkMode ? 'bg-[#141414] border-white/10 text-white' : 'bg-gray-50 border-black/5 text-slate-900'
                      }`}
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                      required={!editingBarbeiro || formData.senha}
                    />
                    <button 
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e6b32a] transition-colors"
                    >
                      {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 md:py-5 bg-[#e6b32a] text-black rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest active:scale-[0.97] transition-all shadow-xl shadow-[#e6b32a]/10 mt-2"
            >
              {editingBarbeiro ? 'confirmar alterações' : 'finalizar cadastro'}
            </button>
          </form>
        </div>
      )}

      <ModalConfirmacao 
        isOpen={isConfirmModalOpen}
        onClose={() => setIsConfirmModalOpen(false)}
        onConfirm={modalConfig.acao}
        tipo={modalConfig.tipo}
        mensagem={modalConfig.mensagem}
      />
    </div>
  );
}