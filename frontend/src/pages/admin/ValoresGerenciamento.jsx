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

  const preSubmit = (e) => {
    e.preventDefault();
    setModalConfig({
      tipo: 'confirmar',
      mensagem: editingIndex !== null ? `salvar alterações em "${formData.nome}"?` : `adicionar "${formData.nome}" à tabela?`,
      acao: salvarAlteracoes
    });
    setIsConfirmModalOpen(true);
  };

  const salvarAlteracoes = async () => {
    try {
      let novaListaServicos = [...servicos];
      const novoServico = {
        nome: formData.nome.toLowerCase(),
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
      setIsConfirmModalOpen(false);
    }
  };

  const triggerDelete = () => {
    setModalConfig({
      tipo: 'cancelar',
      mensagem: `remover "${servicos[editingIndex].nome}" permanentemente?`,
      acao: async () => {
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
                tabela<span className="text-[#e6b32a]">.</span>preços
              </h1>
              <p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[3px] md:tracking-[4px] ml-1">
                ajuste de serviços e valores
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
            {servicos.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-[2rem] md:rounded-[2.5rem] opacity-40">
                <p className="font-black uppercase text-[10px] tracking-[4px]">nenhum serviço listado</p>
              </div>
            ) : (
              servicos.map((serv, index) => (
                <div 
                  key={index}
                  onClick={() => handleOpenForm(index)}
                  className="group p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border bg-white dark:bg-[#0d0d0d] border-black/5 dark:border-white/5 hover:border-[#e6b32a]/30 active:scale-[0.98] transition-all relative overflow-hidden cursor-pointer shadow-sm flex justify-between items-center"
                >
                  <div className="flex items-center gap-4 md:gap-5">
                    <div className="w-12 h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gray-50 dark:bg-[#111] flex items-center justify-center text-[#e6b32a] border border-black/5 dark:border-white/10 group-hover:bg-[#e6b32a] group-hover:text-black transition-colors">
                      <IoPricetagOutline size={22} />
                    </div>
                    <div>
                      <h3 className="text-base md:text-lg font-black text-black dark:text-white lowercase tracking-tight">{serv.nome}</h3>
                      <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-bold tracking-widest opacity-70">serviço ativo</p>
                    </div>
                  </div>
                  <div className="text-right flex items-center gap-4">
                    <span className="text-lg md:text-xl font-mono font-black text-black dark:text-white">
                      R$ {parseFloat(serv.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg md:rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-[#e6b32a] group-hover:scale-110 transition-transform">
                      <FaEdit size={14} />
                    </div>
                  </div>
                </div>
              ))
            )}
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
                  {editingIndex !== null ? 'editar serviço' : 'novo serviço'}
                </h2>
                <div className="h-1 w-10 bg-[#e6b32a] mt-1 rounded-full" />
              </div>
              <div className="flex gap-2">
                {editingIndex !== null && (
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
                <label className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 ml-1 tracking-[2px]">descrição do serviço</label>
                <input 
                  className="w-full bg-gray-50 dark:bg-[#141414] border border-black/5 dark:border-white/10 rounded-xl md:rounded-2xl p-4 text-sm md:text-base text-black dark:text-white outline-none focus:border-[#e6b32a] transition-all"
                  placeholder="ex: corte degradê"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] uppercase font-black text-gray-400 dark:text-gray-500 ml-1 tracking-[2px]">valor de venda (r$)</label>
                <input 
                  className="w-full bg-gray-50 dark:bg-[#141414] border border-black/5 dark:border-white/10 rounded-xl md:rounded-2xl p-4 text-sm md:text-base text-black dark:text-white outline-none focus:border-[#e6b32a] transition-all font-mono"
                  placeholder="0,00"
                  value={formData.valor}
                  onChange={(e) => setFormData({...formData, valor: e.target.value})}
                  required
                />
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-4 md:py-5 bg-[#e6b32a] text-black rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest active:scale-[0.97] transition-all shadow-xl shadow-[#e6b32a]/10 mt-2"
            >
              confirmar e salvar
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