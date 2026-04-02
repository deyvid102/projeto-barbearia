import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import ModalFoto from '../../components/modais/ModalFoto'; 
import CustomAlert from '../../components/CustomAlert';
import AdminLayout from '../../layout/AdminLayout';
import { useTheme } from '../../components/ThemeContext';
import { IoAdd, IoTrashOutline, IoClose, IoPricetagOutline, IoCameraOutline, IoPersonOutline, IoPieChartOutline, IoTimeOutline } from 'react-icons/io5';
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

export default function ValoresGerenciamento() {
  const { id } = useParams(); // Assumindo que este ID é o da barbearia (fk_barbearia)
  const { isDarkMode } = useTheme();

  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barbeariaId, setBarbeariaId] = useState(null);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({ tipo: '', mensagem: '', acao: null });
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '' });

  const [formData, setFormData] = useState({ nome: '', valor: '', tempo: '30' });

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      // Busca direta pela barbearia para evitar o erro 404 de /barbeiros
      const response = await api.get(`/barbearias/${id}`);
      const barbeariaData = response.data || response;

      if (!barbeariaData) {
        setAlertConfig({ show: true, message: 'unidade não encontrada', type: 'error' });
        return;
      }

      setBarbeariaId(barbeariaData._id);

      const servicosFormatados = (barbeariaData.servicos || []).map(s => ({
        ...s,
        valor: Number(s.valor || 0),
        tempo: Number(s.tempo || 30)
      }));

      setServicos(servicosFormatados);
    } catch (error) {
      console.error("Erro ao carregar serviços:", error);
      setAlertConfig({ show: true, message: 'erro ao carregar dados da barbearia', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) carregarDados();
  }, [id, carregarDados]);

  const handleOpenForm = (index = null) => {
    if (index !== null) {
      setEditingIndex(index);
      setFormData({
        nome: servicos[index].nome,
        valor: servicos[index].valor.toFixed(2).replace('.', ','),
        tempo: servicos[index].tempo.toString()
      });
    } else {
      setEditingIndex(null);
      setFormData({ nome: '', valor: '', tempo: '30' });
    }
    setIsFormOpen(true);
  };

  const preSubmit = (e) => {
    e.preventDefault();
    if (!formData.nome || !formData.valor) {
      setAlertConfig({ show: true, message: 'preencha todos os campos', type: 'error' });
      return;
    }
    setModalConfig({
      tipo: 'confirmar',
      mensagem: editingIndex !== null ? `salvar alterações em "${formData.nome}"?` : `adicionar "${formData.nome}" à tabela?`,
      acao: salvarAlteracoes
    });
    setIsConfirmModalOpen(true);
  };

  const salvarAlteracoes = async () => {
    try {
      // Limpa a lista para enviar apenas o necessário ao backend
      let novaListaServicos = servicos.map(s => ({
        nome: s.nome.toLowerCase(),
        valor: Number(s.valor),
        tempo: Number(s.tempo || 30)
      }));

      const novoServico = {
        nome: formData.nome.toLowerCase(),
        valor: parseFloat(formData.valor.replace(',', '.')),
        tempo: Number(formData.tempo)
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
      console.error("Erro ao salvar:", error);
      setAlertConfig({ show: true, message: 'erro ao salvar: verifique os valores', type: 'error' });
      setIsConfirmModalOpen(false);
    }
  };

  const triggerDelete = () => {
    setModalConfig({
      tipo: 'cancelar',
      mensagem: `remover "${servicos[editingIndex].nome}" permanentemente?`,
      acao: async () => {
        try {
          const novaLista = servicos
            .filter((_, i) => i !== editingIndex)
            .map(s => ({
              nome: s.nome,
              valor: Number(s.valor),
              tempo: Number(s.tempo || 30)
            }));

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
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">

        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black italic lowercase tracking-tighter leading-none">
              tabela<span className="text-[#e6b32a]">.preços</span>
            </h1>
            <p className="text-[10px] uppercase tracking-[3px] font-bold opacity-40 mt-2">Ajuste de serviços e valores da unidade</p>
          </div>

          <button
            onClick={() => handleOpenForm()}
            className="h-12 px-6 bg-[#e6b32a] text-black rounded-2xl flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl shadow-[#e6b32a]/20 w-fit"
          >
            <IoAdd size={20} className="stroke-[3]" />
            <span className="text-xs font-black uppercase tracking-widest">Novo Serviço</span>
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
            <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
            {servicos.length === 0 ? (
              <div className="col-span-full py-20 text-center border-2 border-dashed border-black/5 dark:border-white/5 rounded-[2.5rem] opacity-40">
                <p className="font-black uppercase text-[10px] tracking-[4px]">nenhum serviço listado</p>
              </div>
            ) : (
              servicos.map((serv, index) => (
                <div
                  key={index}
                  onClick={() => handleOpenForm(index)}
                  className={`group p-6 rounded-[2.5rem] border transition-all cursor-pointer relative overflow-hidden flex items-center justify-between h-32 ${
                    isDarkMode 
                    ? 'bg-white/5 border-white/5 hover:border-[#e6b32a]/50' 
                    : 'bg-slate-50 border-slate-100 hover:border-[#e6b32a]'
                  }`}
                >
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-[#e6b32a] border transition-colors ${
                      isDarkMode ? 'bg-black/40 border-white/10 group-hover:bg-[#e6b32a] group-hover:text-black' : 'bg-white border-black/5 group-hover:bg-[#e6b32a] group-hover:text-black'
                    }`}>
                      <IoPricetagOutline size={24} />
                    </div>
                    <div>
                      <h3 className={`text-xl font-black lowercase tracking-tighter truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {serv.nome}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1 opacity-40">
                        <IoTimeOutline size={12} />
                        <p className="text-[10px] font-bold uppercase tracking-widest">
                          {serv.tempo || 0} min
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex items-center gap-6">
                    <span className={`text-xl font-mono font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      R$ {serv.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <div className="w-10 h-10 rounded-xl bg-[#e6b32a] text-black flex items-center justify-center shadow-lg shadow-[#e6b32a]/20 opacity-0 group-hover:opacity-100 transition-opacity">
                      <FaEdit size={16} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="absolute inset-0" onClick={() => setIsFormOpen(false)} />
          
          <form 
            onSubmit={preSubmit} 
            className={`relative w-full max-w-md rounded-[3rem] p-8 md:p-10 space-y-8 shadow-2xl border animate-in zoom-in-95 duration-300 ${
              isDarkMode ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-slate-200'
            }`}
          >
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-black italic lowercase tracking-tighter">
                  {editingIndex !== null ? 'editar.' : 'novo.'}<span className="text-[#e6b32a]">serviço</span>
                </h2>
                <div className="h-1.5 w-8 bg-[#e6b32a] mt-2 rounded-full" />
              </div>
              <div className="flex gap-2">
                {editingIndex !== null && (
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

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[9px] uppercase font-black opacity-40 ml-1 tracking-[2px]">descrição do serviço</label>
                <input 
                  className={`w-full rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#e6b32a]/20 focus:border-[#e6b32a] transition-all border ${
                    isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                  }`}
                  placeholder="ex: corte degradê"
                  value={formData.nome}
                  onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black opacity-40 ml-1 tracking-[2px]">valor (r$)</label>
                  <input 
                    className={`w-full rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#e6b32a]/20 focus:border-[#e6b32a] transition-all border font-mono ${
                      isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    placeholder="0,00"
                    value={formData.valor}
                    onChange={(e) => setFormData({...formData, valor: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] uppercase font-black opacity-40 ml-1 tracking-[2px]">tempo (min)</label>
                  <input 
                    type="number"
                    className={`w-full rounded-2xl p-4 text-sm font-bold outline-none focus:ring-2 focus:ring-[#e6b32a]/20 focus:border-[#e6b32a] transition-all border font-mono ${
                      isDarkMode ? 'bg-white/5 border-white/10 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                    }`}
                    placeholder="30"
                    value={formData.tempo}
                    onChange={(e) => setFormData({...formData, tempo: e.target.value})}
                    required
                  />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="w-full py-5 bg-[#e6b32a] text-black rounded-[1.5rem] text-[10px] font-black uppercase tracking-[2px] active:scale-[0.97] transition-all shadow-xl shadow-[#e6b32a]/20 mt-4"
            >
              {editingIndex !== null ? 'Salvar Alterações' : 'Adicionar à Tabela'}
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