import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert';
import { IoAdd, IoArrowBack, IoTrashOutline, IoClose } from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';

export default function BarbeiroGerenciamento() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barbeariaId, setBarbeariaId] = useState(null); 
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ tipo: '', mensagem: '', acao: null });
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '' });
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBarbeiro, setEditingBarbeiro] = useState(null);
  const [formData, setFormData] = useState({ 
    nome: '', 
    email: ''
  });

  const fetchDados = async () => {
    try {
      setLoading(true);
      const response = await api.get('/barbeiros');
      const data = response.data || response;
      
      if (Array.isArray(data)) {
        const adminLogado = data.find(b => String(b._id) === String(id));
        
        if (adminLogado) {
          const bId = adminLogado.fk_barbearia || adminLogado.barbearia_id;
          setBarbeariaId(bId);

          const filtrados = data.filter(b => String(b.fk_barbearia || b.barbearia_id) === String(bId));
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
    if (barbeiro) {
      setEditingBarbeiro(barbeiro);
      setFormData({ 
        nome: barbeiro.nome, 
        email: barbeiro.email
      });
    } else {
      setEditingBarbeiro(null);
      setFormData({ nome: '', email: '' });
    }
    setIsFormOpen(true);
  };

  const preSubmit = (e) => {
    e.preventDefault();
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
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-gray-200 font-sans pb-10 transition-colors">
      <div className="max-w-2xl lg:max-w-5xl mx-auto p-5 md:p-10 space-y-8">
        
        <header className="flex items-center justify-between py-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-4 md:gap-6">
            <button 
              onClick={() => navigate(`/admin/dashboard/${id}`)} 
              className="w-10 h-10 md:w-12 md:h-12 rounded-2xl bg-white dark:bg-[#111] flex items-center justify-center border border-black/10 dark:border-white/10 active:scale-90 transition-all text-[#e6b32a] shadow-sm"
            >
              <IoArrowBack size={20} className="md:size-6" />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black tracking-tighter lowercase leading-tight text-black dark:text-white italic">
                equipe<span className="text-[#e6b32a]">.</span>
              </h1>
              <p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[3px] md:tracking-[4px] ml-1">
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
                    isMe ? 'bg-white dark:bg-[#111] border-[#e6b32a]/40 dark:border-[#e6b32a]/20' : 'bg-white dark:bg-[#0d0d0d] border-black/5 dark:border-white/5 hover:border-[#e6b32a]/30'
                  }`}
                >
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className={`w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center text-base md:text-lg font-black border ${
                      isMe ? 'bg-[#e6b32a] text-black border-[#e6b32a]' : 'bg-gray-50 dark:bg-[#111] text-[#e6b32a] border-black/5 dark:border-white/10'
                    }`}>
                      {b.nome.charAt(0).toUpperCase()}
                    </div>
                    <div className="max-w-[150px] md:max-w-xs truncate">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base md:text-lg font-black text-black dark:text-white lowercase tracking-tight truncate">{b.nome}</h3>
                        {isMe && (
                          <span className="bg-[#e6b32a]/10 text-[#e6b32a] text-[7px] md:text-[8px] font-black uppercase px-2 py-0.5 rounded-full tracking-widest border border-[#e6b32a]/20 shrink-0">
                            você
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] md:text-xs text-gray-400 dark:text-gray-500 font-medium opacity-80 truncate">{b.email}</p>
                    </div>
                  </div>
                  <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl flex items-center justify-center transition-all shrink-0 ${
                    isMe ? 'bg-[#e6b32a]/10 text-[#e6b32a]' : 'bg-black/5 dark:bg-white/5 text-[#e6b32a] group-hover:bg-[#e6b32a] group-hover:text-black'
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-black/95 backdrop-blur-md p-4">
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          
          <form 
            onSubmit={preSubmit} 
            className="relative bg-white dark:bg-[#0d0d0d] w-full max-w-md rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-10 space-y-6 shadow-2xl border border-black/5 dark:border-white/10 animate-in zoom-in-95 duration-300"
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl md:text-2xl font-black text-black dark:text-white lowercase tracking-tighter">
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
                  className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400 flex items-center justify-center active:scale-90 transition-all border border-black/5 dark:border-white/10"
                >
                  <IoClose size={22} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 ml-1 tracking-[2px]">nome completo</label>
                <input 
                  className="w-full bg-gray-50 dark:bg-[#141414] border border-black/5 dark:border-white/10 rounded-xl md:rounded-2xl p-4 text-sm md:text-base text-black dark:text-white outline-none focus:border-[#e6b32a] transition-all"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 ml-1 tracking-[2px]">e-mail de acesso</label>
                <input 
                  type="email" 
                  className="w-full bg-gray-50 dark:bg-[#141414] border border-black/5 dark:border-white/10 rounded-xl md:rounded-2xl p-4 text-sm md:text-base text-black dark:text-white outline-none focus:border-[#e6b32a] transition-all"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
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