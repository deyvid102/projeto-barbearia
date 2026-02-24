import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert';
import { IoAdd, IoArrowBack, IoTrashOutline, IoClose, IoPricetagOutline } from 'react-icons/io5';
import { FaEdit } from 'react-icons/fa';

export default function ValoresGerenciamento() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barbeariaId, setBarbeariaId] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ tipo: '', mensagem: '', acao: null });
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState({ nome: '', valor: '' });

  const carregarDados = async () => {
    try {
      setLoading(true);
      const resBarbeiro = await api.get(`/barbeiros/${id}`);
      const barbeiroData = resBarbeiro.data || resBarbeiro;
      const bId = barbeiroData.fk_barbearia?._id || barbeiroData.fk_barbearia;
      
      if (!bId) {
        setAlertConfig({ show: true, message: 'unidade não encontrada', type: 'error' });
        return;
      }
      setBarbeariaId(bId);

      const resBarbearia = await api.get(`/barbearias/${bId}`);
      const barbeariaData = resBarbearia.data || resBarbearia;
      setServicos(barbeariaData.servicos || []);
    } catch (error) {
      console.error(error);
      setAlertConfig({ show: true, message: 'erro ao conectar com o servidor', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) carregarDados();
  }, [id]);

  const handleOpenForm = (index = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setFormData({ 
        nome: servicos[index].nome, 
        valor: servicos[index].valor.toString().replace('.', ',')
      });
    } else {
      setEditingIndex(null);
      setFormData({ nome: '', valor: '' });
    }
    setIsFormOpen(true);
  };

  const salvarAlteracoes = async () => {
    try {
      let novaListaServicos = [...servicos];
      const novoServico = {
        nome: formData.nome,
        valor: parseFloat(formData.valor.replace(',', '.'))
      };

      if (editingIndex !== null) {
        novaListaServicos[editingIndex] = novoServico;
      } else {
        novaListaServicos.push(novoServico);
      }

      await api.put(`/barbearias/${barbeariaId}`, { servicos: novaListaServicos });
      
      setAlertConfig({ show: true, message: 'tabela de preços atualizada!', type: 'success' });
      setIsFormOpen(false);
      setIsConfirmModalOpen(false);
      carregarDados();
    } catch (error) {
      setAlertConfig({ show: true, message: 'erro ao salvar alterações', type: 'error' });
    }
  };

  const excluirServico = async () => {
    try {
      const novaLista = servicos.filter((_, i) => i !== editingIndex);
      await api.put(`/barbearias/${barbeariaId}`, { servicos: novaLista });
      
      setAlertConfig({ show: true, message: 'serviço removido!', type: 'success' });
      setIsConfirmModalOpen(false);
      setIsFormOpen(false);
      carregarDados();
    } catch (error) {
      setAlertConfig({ show: true, message: 'erro ao remover', type: 'error' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-gray-200 font-sans pb-10 transition-colors">
      <div className="max-w-4xl mx-auto p-6 md:p-10 space-y-8">
        
        <header className="flex items-center justify-between py-6 border-b border-black/5 dark:border-white/5">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)} 
              className="w-10 h-10 rounded-2xl bg-white dark:bg-[#111] flex items-center justify-center border border-black/10 dark:border-white/10 text-[#e6b32a] shadow-sm"
            >
              <IoArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-2xl font-black italic text-black dark:text-white lowercase tracking-tighter">
                tabela.<span className="text-[#e6b32a]">preços</span>
              </h1>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[3px]">unidade gerenciada</p>
            </div>
          </div>
          
          <button 
            onClick={() => handleOpenForm()}
            className="h-10 px-5 bg-[#e6b32a] text-black rounded-xl flex items-center gap-2 active:scale-95 font-black uppercase text-[10px] shadow-lg shadow-[#e6b32a]/20"
          >
            <IoAdd size={20} />
            <span>novo serviço</span>
          </button>
        </header>

        {alertConfig.show && (
          <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4">
            <CustomAlert 
              message={alertConfig.message} 
              type={alertConfig.type} 
              onClose={() => setAlertConfig({ ...alertConfig, show: false })} 
            />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-2 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {servicos.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-[2.5rem] opacity-50">
                <p className="font-black uppercase text-[10px] tracking-widest">lista de serviços vazia</p>
              </div>
            ) : (
              servicos.map((serv, index) => (
                <div 
                  key={index}
                  onClick={() => handleOpenForm(index)}
                  className="group bg-white dark:bg-[#0d0d0d] border border-black/5 dark:border-white/5 p-6 rounded-[2rem] flex items-center justify-between hover:border-[#e6b32a]/40 cursor-pointer shadow-sm transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#e6b32a]/10 flex items-center justify-center text-[#e6b32a]">
                      <IoPricetagOutline size={22} />
                    </div>
                    <h3 className="text-lg font-black text-black dark:text-white lowercase">{serv.nome}</h3>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className="text-xl font-mono font-black text-black dark:text-white">
                      R$ {parseFloat(serv.valor).toFixed(2).replace('.', ',')}
                    </span>
                    <FaEdit className="text-gray-300 dark:text-gray-700 group-hover:text-[#e6b32a]" />
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/90 dark:bg-black/90 backdrop-blur-sm p-4">
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          <form 
            onSubmit={(e) => { e.preventDefault(); setModalConfig({ acao: salvarAlteracoes, mensagem: 'salvar este serviço?' }); setIsConfirmModalOpen(true); }}
            className="relative bg-white dark:bg-[#0d0d0d] w-full max-w-md rounded-[2.5rem] p-8 space-y-6 border border-black/5 dark:border-white/10 shadow-2xl"
          >
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black text-black dark:text-white lowercase italic">{editingIndex !== null ? 'editar' : 'novo'}</h2>
              <div className="flex gap-2">
                {editingIndex !== null && (
                  <button 
                    type="button" 
                    onClick={() => { setModalConfig({ acao: excluirServico, mensagem: 'excluir serviço da lista?' }); setIsConfirmModalOpen(true); }} 
                    className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center border border-red-500/20"
                  >
                    <IoTrashOutline size={20} />
                  </button>
                )}
                <button type="button" onClick={() => setIsFormOpen(false)} className="w-10 h-10 rounded-xl bg-black/5 dark:bg-white/5 text-gray-400 flex items-center justify-center">
                  <IoClose size={22} />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 ml-1">nome do serviço</label>
                <input 
                  className="w-full bg-gray-50 dark:bg-[#141414] border border-black/5 dark:border-white/10 rounded-2xl p-4 text-black dark:text-white outline-none focus:border-[#e6b32a] transition-all"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 ml-1">valor (r$)</label>
                <input 
                  className="w-full bg-gray-50 dark:bg-[#141414] border border-black/5 dark:border-white/10 rounded-2xl p-4 text-black dark:text-white outline-none focus:border-[#e6b32a] transition-all font-mono"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-5 bg-[#e6b32a] text-black rounded-2xl text-sm font-black uppercase tracking-widest active:scale-[0.97] transition-all shadow-xl shadow-[#e6b32a]/10"
            >
              confirmar serviço
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