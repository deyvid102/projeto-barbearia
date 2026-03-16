import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import ModalFoto from '../../components/modais/ModalFoto'; 
import CustomAlert from '../../components/CustomAlert';
import AdminLayout from '../../layout/AdminLayout';
import { useTheme } from '../../components/ThemeContext';
import { IoAdd, IoTrashOutline, IoClose, IoCameraOutline, IoPersonOutline, IoPieChartOutline } from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';

const getCroppedImg = (imageSrc, pixelCrop) => {
  return new Promise((resolve) => {
    const image = new Image();
    image.src = imageSrc;
    image.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 400;
      canvas.height = 400;
      ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, 400, 400);
      resolve(canvas.toDataURL('image/jpeg', 0.8));
    };
  });
};

export default function BarbeiroGerenciamento() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef(null);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barbeariaId, setBarbeariaId] = useState(null); 
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false); 
  const [tempPhotoUrl, setTempPhotoUrl] = useState(null); 
  
  const [modalConfig, setModalConfig] = useState({ tipo: '', mensagem: '', acao: null });
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '' });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBarbeiro, setEditingBarbeiro] = useState(null);
  
  const [formData, setFormData] = useState({ 
    nome: '', 
    email: '',
    senha: '',
    confirmarSenha: '',
    foto: null,
    porcentagem_comissao: 50 // Alinhado com o Model
  });

  const fetchDados = useCallback(async () => {
    try {
      setLoading(true);
      const resBeb = await api.get('/barbearias');
      const barbearias = resBeb.data || resBeb;
      const minhaBarbearia = barbearias.find(b => 
        String(b._id) === String(id) || String(b.fk_admin?._id || b.fk_admin) === String(id)
      );

      if (minhaBarbearia) {
        const bId = minhaBarbearia._id;
        setBarbeariaId(bId);

        const response = await api.get('/barbeiros');
        const data = response.data || response;
        
        if (Array.isArray(data)) {
          const filtrados = data.filter(b => 
            String(b.fk_barbearia?._id || b.fk_barbearia) === String(bId)
          );
          setBarbeiros(filtrados);
        }
      }
    } catch (error) {
      console.error("erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchDados();
  }, [id, fetchDados]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setTempPhotoUrl(reader.result);
        setIsPhotoModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmCrop = async (pixelCrop) => {
    try {
      const croppedImage = await getCroppedImg(tempPhotoUrl, pixelCrop);
      setFormData({ ...formData, foto: croppedImage });
      setIsPhotoModalOpen(false);
    } catch (error) {
      setAlertConfig({ show: true, message: 'Erro ao processar imagem.', type: 'error' });
    }
  };

  const handleOpenForm = (barbeiro = null) => {
    if (barbeiro) {
      setEditingBarbeiro(barbeiro);
      setFormData({ 
        nome: barbeiro.nome, 
        email: barbeiro.email,
        senha: '',
        confirmarSenha: '',
        foto: barbeiro.foto || null,
        porcentagem_comissao: barbeiro.porcentagem_comissao || 50
      });
    } else {
      setEditingBarbeiro(null);
      setFormData({ 
        nome: '', email: '', senha: '', confirmarSenha: '', foto: null, porcentagem_comissao: 50 
      });
    }
    setIsFormOpen(true);
  };

  const executeSubmit = async () => {
    try {
      const payload = {
        nome: formData.nome,
        email: formData.email,
        foto: formData.foto,
        porcentagem_comissao: Number(formData.porcentagem_comissao),
        fk_barbearia: barbeariaId 
      };

      if (formData.senha) payload.senha = formData.senha;

      if (editingBarbeiro) {
        await api.put(`/barbeiros/${editingBarbeiro._id}`, payload);
        setAlertConfig({ show: true, message: 'Perfil atualizado!', type: 'success' });
      } else {
        await api.post('/barbeiros', payload); 
        setAlertConfig({ show: true, message: 'Barbeiro cadastrado!', type: 'success' });
      }
      
      setIsConfirmModalOpen(false);
      setIsFormOpen(false);
      fetchDados();
    } catch (error) {
      setAlertConfig({ show: true, message: 'Erro ao salvar dados', type: 'error' });
      setIsConfirmModalOpen(false);
    }
  };

  const preSubmit = (e) => {
    e.preventDefault();
    if (!editingBarbeiro || formData.senha) {
      if (formData.senha.length < 6) {
        setAlertConfig({ show: true, message: 'Senha curta demais!', type: 'error' });
        return;
      }
      if (formData.senha !== formData.confirmarSenha) {
        setAlertConfig({ show: true, message: 'As senhas não coincidem!', type: 'error' });
        return;
      }
    }
    setModalConfig({
      tipo: 'confirmar',
      mensagem: editingBarbeiro ? `Salvar alterações em ${editingBarbeiro.nome}?` : `Cadastrar ${formData.nome}?`,
      acao: executeSubmit
    });
    setIsConfirmModalOpen(true);
  };

  const triggerDelete = () => {
    setModalConfig({
      tipo: 'cancelar',
      mensagem: `Remover permanentemente ${editingBarbeiro.nome}?`,
      acao: async () => {
        try {
          await api.delete(`/barbeiros/${editingBarbeiro._id}`);
          setAlertConfig({ show: true, message: 'Removido!', type: 'success' });
          setIsConfirmModalOpen(false);
          setIsFormOpen(false);
          fetchDados();
        } catch (e) {
          setAlertConfig({ show: true, message: 'Erro ao deletar', type: 'error' });
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
            <p className="text-[10px] uppercase tracking-[3px] font-bold opacity-40 mt-2">Gestão de barbeiros e comissões</p>
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
            <CustomAlert message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-12 h-12 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {barbeiros.map((b) => (
              <div 
                key={b._id} 
                onClick={() => handleOpenForm(b)}
                className={`group p-6 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between h-52 ${
                  isDarkMode ? 'bg-white/5 border-white/5 hover:border-[#e6b32a]/50' : 'bg-slate-50 border-slate-100 hover:border-[#e6b32a]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-black border overflow-hidden shrink-0 ${
                    isDarkMode ? 'bg-black/40 text-[#e6b32a] border-white/10' : 'bg-white text-[#e6b32a] border-black/5'
                  }`}>
                    {b.foto ? <img src={b.foto} alt={b.nome} className="w-full h-full object-cover" /> : b.nome.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="bg-[#e6b32a]/10 text-[#e6b32a] text-[9px] font-black uppercase px-3 py-1 rounded-full tracking-widest border border-[#e6b32a]/20">
                      {b.porcentagem_comissao || 0}% Comissão
                    </span>
                  </div>
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
            ))}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          <form 
            onSubmit={preSubmit} 
            className={`relative w-full max-w-md rounded-[3rem] p-8 md:p-10 space-y-6 shadow-2xl border max-h-[90vh] overflow-y-auto custom-scrollbar ${
              isDarkMode ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <h2 className="text-2xl font-black italic lowercase tracking-tighter">
                {editingBarbeiro ? 'perfil.' : 'novo.'}<span className="text-[#e6b32a]">profissional</span>
              </h2>
              <div className="flex gap-2">
                {editingBarbeiro && (
                  <button type="button" onClick={triggerDelete} className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/10 hover:bg-red-500 hover:text-white transition-all">
                    <IoTrashOutline size={20} />
                  </button>
                )}
                <button type="button" onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 border border-white/5"><IoClose size={22} /></button>
              </div>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div onClick={() => fileInputRef.current.click()} className="relative w-24 h-24 rounded-full border-4 border-dashed border-[#e6b32a]/30 flex items-center justify-center cursor-pointer overflow-hidden group">
                {formData.foto ? <img src={formData.foto} className="w-full h-full object-cover" /> : <IoPersonOutline size={30} className="opacity-20" />}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><IoCameraOutline size={20} className="text-white"/></div>
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-black opacity-40 ml-1">Nome Completo</label>
                  <input className={`w-full rounded-2xl p-4 text-sm font-bold border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} value={formData.nome} onChange={(e) => setFormData({...formData, nome: e.target.value})} required />
                </div>
                
                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-black opacity-40 ml-1 flex items-center gap-2">
                    <IoPieChartOutline /> Porcentagem de Comissão (%)
                  </label>
                  <input 
                    type="number"
                    min="0"
                    max="100"
                    className={`w-full rounded-2xl p-4 text-sm font-bold border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} 
                    value={formData.porcentagem_comissao} 
                    onChange={(e) => setFormData({...formData, porcentagem_comissao: e.target.value})} 
                    required 
                  />
                </div>

                <div className="col-span-2 space-y-1">
                  <label className="text-[9px] uppercase font-black opacity-40 ml-1">Email</label>
                  <input type="email" className={`w-full rounded-2xl p-4 text-sm font-bold border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black opacity-40 ml-1">Senha</label>
                  <input type="password" placeholder="******" className={`w-full rounded-2xl p-4 text-sm font-bold border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} value={formData.senha} onChange={(e) => setFormData({...formData, senha: e.target.value})} required={!editingBarbeiro} />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] uppercase font-black opacity-40 ml-1">Confirmar</label>
                  <input type="password" placeholder="******" className={`w-full rounded-2xl p-4 text-sm font-bold border outline-none ${isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200'}`} value={formData.confirmarSenha} onChange={(e) => setFormData({...formData, confirmarSenha: e.target.value})} required={!editingBarbeiro || formData.senha} />
                </div>
              </div>
            </div>

            <button type="submit" className="w-full py-5 bg-[#e6b32a] text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-[2px] shadow-xl shadow-[#e6b32a]/20">
              {editingBarbeiro ? 'Salvar Alterações' : 'Finalizar Cadastro'}
            </button>
          </form>
        </div>
      )}

      {isPhotoModalOpen && <ModalFoto image={tempPhotoUrl} onClose={() => setIsPhotoModalOpen(false)} onCropComplete={handleConfirmCrop} />}

      <ModalConfirmacao isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={modalConfig.acao} tipo={modalConfig.tipo} mensagem={modalConfig.mensagem} />
    </AdminLayout>
  );
}