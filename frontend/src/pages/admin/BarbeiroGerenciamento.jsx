import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert';
import AdminLayout from '../../layout/layout';
import { useTheme } from '../../components/ThemeContext';
import { IoAdd, IoTrashOutline, IoClose, IoEyeOutline, IoEyeOffOutline, IoCameraOutline, IoPersonOutline } from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';

export default function BarbeiroGerenciamento() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef(null);
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
    confirmarSenha: '',
    foto: null
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

  // FUNÇÃO MÁGICA DE OTIMIZAÇÃO (ESTILO INSTAGRAM)
  const otimizarEConverterParaBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onerror = reject;
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onerror = reject;
        img.onload = () => {
          // 1. Criar Canvas
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // 2. Definir tamanho final (Padrão Avatar: 400x400)
          const MAX_WIDTH = 400;
          const MAX_HEIGHT = 400;

          // 3. Lógica de Corte (Crop) Centralizado para Quadrado 1:1
          let sourceX = 0;
          let sourceY = 0;
          let sourceWidth = img.width;
          let sourceHeight = img.height;

          if (img.width > img.height) {
            // Imagem Paisagem: corta as laterais
            sourceWidth = img.height;
            sourceX = (img.width - img.height) / 2;
          } else {
            // Imagem Retrato: corta o topo e fundo
            sourceHeight = img.width;
            sourceY = (img.height - img.width) / 2;
          }

          // 4. Setar tamanho do canvas
          canvas.width = MAX_WIDTH;
          canvas.height = MAX_HEIGHT;

          // 5. Desenhar imagem cortada e redimensionada no canvas
          ctx.drawImage(
            img, 
            sourceX, sourceY, sourceWidth, sourceHeight, // Onde cortar na imagem original
            0, 0, MAX_WIDTH, MAX_HEIGHT // Onde desenhar no canvas final
          );

          // 6. Converter para Base64 (JPEG com 80% de qualidade para compressão)
          // Isso diminui drasticamente o tamanho do arquivo mantendo boa aparência
          const base64Otimizado = canvas.toDataURL('image/jpeg', 0.8);
          resolve(base64Otimizado);
        };
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        setLoading(true); // Mostra loader rápido
        const fotoOtimizada = await otimizarEConverterParaBase64(file);
        setFormData({ ...formData, foto: fotoOtimizada });
      } catch (error) {
        console.error("Erro ao processar imagem:", error);
        setAlertConfig({ show: true, message: 'Falha ao processar a imagem. Tente outra.', type: 'error' });
      } finally {
        setLoading(false);
      }
    }
  };

  const handleOpenForm = (barbeiro = null) => {
    setShowPassword(false);
    setShowConfirmPassword(false);
    if (barbeiro) {
      setEditingBarbeiro(barbeiro);
      setFormData({ 
        nome: barbeiro.nome, 
        email: barbeiro.email,
        senha: '',
        confirmarSenha: '',
        foto: barbeiro.foto || null
      });
    } else {
      setEditingBarbeiro(null);
      setFormData({ nome: '', email: '', senha: '', confirmarSenha: '', foto: null });
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
        foto: formData.foto, // Envia o Base64 já comprimido e cortado
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
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
        
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black italic lowercase tracking-tighter leading-none">
              equipe<span className="text-[#e6b32a]">.profissionais</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[3px] font-bold opacity-40 mt-2">Gestão de barbeiros e acessos</p>
          </div>

          <button 
            onClick={() => handleOpenForm()}
            className="h-12 px-6 bg-[#e6b32a] text-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-[#e6b32a]/20 w-fit"
          >
            <IoAdd size={20} className="stroke-[3]" />
            <span className="text-xs font-black uppercase tracking-widest">Adicionar Barbeiro</span>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="w-12 h-12 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {barbeiros.map((b) => {
              const isMe = String(b._id) === String(id);
              return (
                <div 
                  key={b._id} 
                  onClick={() => handleOpenForm(b)}
                  className={`group p-6 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-48 ${
                    isMe 
                    ? (isDarkMode ? 'bg-[#111] border-[#e6b32a]/40 shadow-lg shadow-[#e6b32a]/5' : 'bg-white border-[#e6b32a]/40 shadow-md') 
                    : (isDarkMode ? 'bg-white/5 border-white/5 hover:border-[#e6b32a]/50' : 'bg-slate-50 border-slate-100 hover:border-[#e6b32a]')
                  }`}
                >
                  <div className="flex justify-between items-start">
                    {/* AVATAR CIRCULAR NO GRID */}
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border transition-colors overflow-hidden shrink-0 ${
                      isMe ? 'bg-[#e6b32a] text-black border-[#e6b32a]' : (isDarkMode ? 'bg-black/40 text-[#e6b32a] border-white/10 group-hover:bg-[#e6b32a] group-hover:text-black' : 'bg-white text-[#e6b32a] border-black/5 group-hover:bg-[#e6b32a] group-hover:text-black')
                    }`}>
                      {b.foto ? (
                        <img src={b.foto} alt={b.nome} className="w-full h-full object-cover" />
                      ) : (
                        b.nome.charAt(0).toUpperCase()
                      )}
                    </div>
                    {isMe && (
                      <span className="bg-[#e6b32a] text-black text-[7px] font-black uppercase px-3 py-1 rounded-full tracking-widest">
                        você
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className={`text-xl font-black lowercase tracking-tighter truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {b.nome}
                    </h3>
                    <p className={`text-[10px] font-bold opacity-40 uppercase tracking-widest truncate mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      {b.email}
                    </p>
                  </div>

                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-xl bg-[#e6b32a] text-black flex items-center justify-center shadow-lg shadow-[#e6b32a]/20">
                      <FaEdit size={16} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL FORMULÁRIO */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          
          <form 
            onSubmit={preSubmit} 
            className={`relative w-full max-w-md rounded-[3rem] p-8 md:p-10 space-y-6 shadow-2xl border animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto custom-scrollbar ${
              isDarkMode ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black italic lowercase tracking-tighter">
                  {editingBarbeiro ? 'perfil.' : 'novo.'}<span className="text-[#e6b32a]">profissional</span>
                </h2>
                <div className="h-1.5 w-8 bg-[#e6b32a] mt-2 rounded-full" />
              </div>
              <div className="flex gap-2">
                {editingBarbeiro && editingBarbeiro._id !== id && (
                  <button 
                    type="button" 
                    onClick={triggerDelete}
                    className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500 hover:text-white transition-all border border-red-500/10"
                  >
                    <IoTrashOutline size={20} />
                  </button>
                )}
                <button 
                  type="button" 
                  onClick={() => setIsFormOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:bg-white/10 transition-all border border-white/5"
                >
                  <IoClose size={22} />
                </button>
              </div>
            </div>

            {/* SEÇÃO DE FOTO CIRCULAR COM CROP PADRÃO */}
            <div className="flex flex-col items-center gap-4 py-2 relative">
              <div 
                onClick={() => fileInputRef.current.click()}
                className={`relative w-28 h-28 rounded-full border-4 border-dashed flex items-center justify-center cursor-pointer group transition-all overflow-hidden shadow-inner ${
                  isDarkMode ? 'border-white/10 bg-white/5 hover:border-[#e6b32a]/50' : 'border-slate-200 bg-slate-50 hover:border-[#e6b32a]'
                }`}
              >
                {formData.foto ? (
                  <>
                    <img src={formData.foto} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <IoCameraOutline size={30} className="text-white" />
                      <span className="text-[7px] font-black text-white uppercase mt-1">Alterar</span>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center text-gray-400 group-hover:text-[#e6b32a]">
                    <IoPersonOutline size={40} className="opacity-30" />
                    <IoCameraOutline size={20} className="absolute bottom-4 right-4 bg-[#e6b32a] text-black p-1 rounded-full" />
                  </div>
                )}
              </div>
              <p className="text-[8px] font-black uppercase opacity-30 tracking-widest">Toque para upload (padrão circular)</p>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/jpeg, image/png, image/webp" 
                onChange={handleFileChange}
              />
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black opacity-40 ml-1 tracking-[2px]">nome completo</label>
                <input 
                  className={`w-full rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#e6b32a]/20 focus:border-[#e6b32a] transition-all border ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  placeholder="ex: joão silva"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black opacity-40 ml-1 tracking-[2px]">e-mail de acesso</label>
                <input 
                  type="email" 
                  className={`w-full rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#e6b32a]/20 focus:border-[#e6b32a] transition-all border ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  placeholder="ex: contato@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black opacity-40 ml-1 tracking-[2px]">
                    {editingBarbeiro ? 'nova senha (opcional)' : 'definir senha'}
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? "text" : "password"}
                      className={`w-full rounded-2xl p-4 pr-12 text-sm font-bold outline-none focus:ring-2 focus:ring-[#e6b32a]/20 focus:border-[#e6b32a] transition-all border ${
                        isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      value={formData.senha}
                      onChange={(e) => setFormData({...formData, senha: e.target.value})}
                      required={!editingBarbeiro}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e6b32a]">
                      {showPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black opacity-40 ml-1 tracking-[2px]">confirmar senha</label>
                  <div className="relative">
                    <input 
                      type={showConfirmPassword ? "text" : "password"}
                      className={`w-full rounded-2xl p-4 pr-12 text-sm font-bold outline-none focus:ring-2 focus:ring-[#e6b32a]/20 focus:border-[#e6b32a] transition-all border ${
                        isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                      }`}
                      value={formData.confirmarSenha}
                      onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})}
                      required={!editingBarbeiro || formData.senha}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e6b32a]">
                      {showConfirmPassword ? <IoEyeOffOutline size={20} /> : <IoEyeOutline size={20} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-5 bg-[#e6b32a] text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-[2px] active:scale-[0.97] transition-all shadow-xl shadow-[#e6b32a]/20 mt-4"
            >
              {editingBarbeiro ? 'Salvar Alterações' : 'Finalizar Cadastro'}
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
    </AdminLayout>
  );
}