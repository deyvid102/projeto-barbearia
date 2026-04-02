import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import ModalFoto from '../../components/modais/ModalFoto';
import CustomAlert from '../../components/CustomAlert';
// import AdminLayout from '../../layout/AdminLayout';
import { useTheme } from '../../components/ThemeContext';
import { 
  IoAdd, IoTrashOutline, IoClose, IoCameraOutline, 
  IoPersonOutline, IoPieChartOutline, IoPricetagOutline, IoTimeOutline 
} from 'react-icons/io5';
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

export default function GestaoUnificada() {
  const { id } = useParams();
  const { isDarkMode } = useTheme();
  const fileInputRef = useRef(null);

  // Estados de Dados
  const [barbeiros, setBarbeiros] = useState([]);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [barbeariaId, setBarbeariaId] = useState(null);

  // Estados de UI
  const [isBarbeiroFormOpen, setIsBarbeiroFormOpen] = useState(false);
  const [isServicoFormOpen, setIsServicoFormOpen] = useState(false);
  const [editingBarbeiro, setEditingBarbeiro] = useState(null);
  const [editingServicoIndex, setEditingServicoIndex] = useState(null);
  
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState(null);
  const [modalConfig, setModalConfig] = useState({ tipo: '', mensagem: '', acao: null });
  const [alertConfig, setAlertConfig] = useState({ show: false, message: '', type: '' });

  // Forms Data
  const [barbeiroData, setBarbeiroData] = useState({
    nome: '', email: '', senha: '', confirmarSenha: '', foto: null, porcentagem_comissao: 50
  });
  const [servicoData, setServicoData] = useState({ nome: '', valor: '', tempo: '30' });

  // --- CARREGAMENTO DE DADOS ---
  const carregarTudo = useCallback(async () => {
    try {
      setLoading(true);
      // 1. Buscar Barbearia (para o ID interno e Serviços)
      const resBarbearia = await api.get(`/barbearias/${id}`);
      const bData = resBarbearia.data || resBarbearia;
      
      if (bData) {
        setBarbeariaId(bData._id);
        setServicos(bData.servicos || []);
        
        // 2. Buscar Barbeiros
        const resBarbeiros = await api.get('/barbeiros');
        const todosBarbeiros = resBarbeiros.data || resBarbeiros;
        const filtrados = todosBarbeiros.filter(b => 
          String(b.fk_barbearia?._id || b.fk_barbearia) === String(bData._id)
        );
        setBarbeiros(filtrados);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setAlertConfig({ show: true, message: 'Erro ao sincronizar dados', type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { carregarTudo(); }, [carregarTudo]);

  // --- LÓGICA DE BARBEIROS ---
  const handleOpenBarbeiro = (barbeiro = null) => {
    if (barbeiro) {
      setEditingBarbeiro(barbeiro);
      setBarbeiroData({ 
        nome: barbeiro.nome, email: barbeiro.email, senha: '', confirmarSenha: '', 
        foto: barbeiro.foto || null, porcentagem_comissao: barbeiro.porcentagem_comissao || 50 
      });
    } else {
      setEditingBarbeiro(null);
      setBarbeiroData({ nome: '', email: '', senha: '', confirmarSenha: '', foto: null, porcentagem_comissao: 50 });
    }
    setIsBarbeiroFormOpen(true);
  };

  const salvarBarbeiro = async () => {
    try {
      const payload = { ...barbeiroData, fk_barbearia: barbeariaId };
      if (!payload.senha) delete payload.senha;

      if (editingBarbeiro) {
        await api.put(`/barbeiros/${editingBarbeiro._id}`, payload);
      } else {
        await api.post('/barbeiros', payload);
      }
      setAlertConfig({ show: true, message: 'Equipe atualizada!', type: 'success' });
      setIsBarbeiroFormOpen(false);
      setIsConfirmModalOpen(false);
      carregarTudo();
    } catch (e) {
      setAlertConfig({ show: true, message: 'Erro ao salvar barbeiro', type: 'error' });
    }
  };

  // --- LÓGICA DE SERVIÇOS ---
  const handleOpenServico = (index = null) => {
    if (index !== null) {
      setEditingServicoIndex(index);
      setServicoData({
        nome: servicos[index].nome,
        valor: servicos[index].valor.toFixed(2).replace('.', ','),
        tempo: servicos[index].tempo.toString()
      });
    } else {
      setEditingServicoIndex(null);
      setServicoData({ nome: '', valor: '', tempo: '30' });
    }
    setIsServicoFormOpen(true);
  };

  const salvarServico = async () => {
    try {
      let novaLista = servicos.map(s => ({ ...s, valor: Number(s.valor), tempo: Number(s.tempo) }));
      const novo = { 
        nome: servicoData.nome.toLowerCase(), 
        valor: parseFloat(servicoData.valor.replace(',', '.')), 
        tempo: Number(servicoData.tempo) 
      };

      if (editingServicoIndex !== null) novaLista[editingServicoIndex] = novo;
      else novaLista.push(novo);

      await api.put(`/barbearias/${barbeariaId}`, { servicos: novaLista });
      setAlertConfig({ show: true, message: 'Serviços atualizados!', type: 'success' });
      setIsServicoFormOpen(false);
      setIsConfirmModalOpen(false);
      carregarTudo();
    } catch (e) {
      setAlertConfig({ show: true, message: 'Erro ao salvar serviço', type: 'error' });
    }
  };

  return (
    // <AdminLayout>
    <>
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
        
        {/* HEADER PRINCIPAL */}
        <header className="mb-12">
          <h1 className="text-4xl font-black italic lowercase tracking-tighter leading-none">
            gestão.<span className="text-[#e6b32a]">unificada</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[3px] font-bold opacity-40 mt-2">Equipe e Tabela de Preços</p>
        </header>

        {alertConfig.show && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[100] w-[90%] md:w-auto">
            <CustomAlert message={alertConfig.message} type={alertConfig.type} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <div className="space-y-16">
            
            {/* SEÇÃO BARBEIROS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <div className="w-2 h-6 bg-[#e6b32a] rounded-full" /> Barbeiros
                </h2>
                <button onClick={() => handleOpenBarbeiro()} className="p-3 bg-[#e6b32a] text-black rounded-xl active:scale-95 transition-all">
                  <IoAdd size={24} strokeWidth={3} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {barbeiros.map((b) => (
                  <div key={b._id} onClick={() => handleOpenBarbeiro(b)} className={`p-6 rounded-[2.5rem] border transition-all cursor-pointer relative ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div className="w-14 h-14 rounded-full border-2 border-[#e6b32a] overflow-hidden">
                        {b.foto ? <img src={b.foto} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center font-bold text-[#e6b32a]">{b.nome.charAt(0)}</div>}
                      </div>
                      <span className="text-[9px] font-black bg-[#e6b32a]/10 text-[#e6b32a] px-2 py-1 rounded-lg">{b.porcentagem_comissao}%</span>
                    </div>
                    <h3 className="font-black lowercase tracking-tighter text-lg truncate">{b.nome}</h3>
                    <p className="text-[10px] opacity-40 uppercase font-bold truncate">{b.email}</p>
                  </div>
                ))}
              </div>
            </section>

            <hr className="opacity-5" />

            {/* SEÇÃO SERVIÇOS */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black uppercase tracking-tighter flex items-center gap-2">
                  <div className="w-2 h-6 bg-[#e6b32a] rounded-full" /> Serviços
                </h2>
                <button onClick={() => handleOpenServico()} className="p-3 bg-[#e6b32a] text-black rounded-xl active:scale-95 transition-all">
                  <IoAdd size={24} strokeWidth={3} />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {servicos.map((serv, index) => (
                  <div key={index} onClick={() => handleOpenServico(index)} className={`p-6 rounded-[2.5rem] border flex items-center justify-between transition-all cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-[#e6b32a] text-black flex items-center justify-center"><IoPricetagOutline size={20} /></div>
                      <div>
                        <h3 className="font-black lowercase text-lg leading-tight">{serv.nome}</h3>
                        <div className="flex items-center gap-1 opacity-40 text-[10px] font-bold uppercase tracking-widest">
                          <IoTimeOutline size={12} /> {serv.tempo} min
                        </div>
                      </div>
                    </div>
                    <span className="font-mono font-black text-lg">R$ {Number(serv.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}
      </div>

      {/* MODAL FORM BARBEIRO */}
      {isBarbeiroFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setIsBarbeiroFormOpen(false)} />
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            setModalConfig({ tipo: 'confirmar', mensagem: `Salvar barbeiro ${barbeiroData.nome}?`, acao: salvarBarbeiro });
            setIsConfirmModalOpen(true);
          }} className={`relative w-full max-w-md rounded-[3rem] p-8 space-y-6 border ${isDarkMode ? 'bg-[#0d0d0d] border-white/10 text-white' : 'bg-white border-slate-200'}`}>
            <h2 className="text-2xl font-black italic">equipe.<span className="text-[#e6b32a]">membro</span></h2>
            {/* ... Campos de input de Barbeiro conforme seu código original ... */}
            <input className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} placeholder="Nome" value={barbeiroData.nome} onChange={e => setBarbeiroData({...barbeiroData, nome: e.target.value})} required />
            <input className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} placeholder="Email" value={barbeiroData.email} onChange={e => setBarbeiroData({...barbeiroData, email: e.target.value})} required />
            <div className="grid grid-cols-2 gap-2">
              <input type="password" placeholder="Senha" className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} value={barbeiroData.senha} onChange={e => setBarbeiroData({...barbeiroData, senha: e.target.value})} />
              <input type="number" placeholder="Comissão %" className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} value={barbeiroData.porcentagem_comissao} onChange={e => setBarbeiroData({...barbeiroData, porcentagem_comissao: e.target.value})} />
            </div>
            <button type="submit" className="w-full py-4 bg-[#e6b32a] text-black rounded-2xl font-black uppercase">Salvar Membro</button>
          </form>
        </div>
      )}

      {/* MODAL FORM SERVICO */}
      {isServicoFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <div className="absolute inset-0" onClick={() => setIsServicoFormOpen(false)} />
          <form onSubmit={(e) => { 
            e.preventDefault(); 
            setModalConfig({ tipo: 'confirmar', mensagem: `Salvar serviço ${servicoData.nome}?`, acao: salvarServico });
            setIsConfirmModalOpen(true);
          }} className={`relative w-full max-w-md rounded-[3rem] p-8 space-y-6 border ${isDarkMode ? 'bg-[#0d0d0d] border-white/10 text-white' : 'bg-white border-slate-200'}`}>
            <h2 className="text-2xl font-black italic">tabela.<span className="text-[#e6b32a]">preço</span></h2>
            <input className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} placeholder="Nome do Serviço" value={servicoData.nome} onChange={e => setServicoData({...servicoData, nome: e.target.value})} required />
            <div className="grid grid-cols-2 gap-2">
              <input className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} placeholder="Valor (Ex: 50,00)" value={servicoData.valor} onChange={e => setServicoData({...servicoData, valor: e.target.value})} required />
              <input type="number" className={`w-full p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50'}`} placeholder="Tempo (min)" value={servicoData.tempo} onChange={e => setServicoData({...servicoData, tempo: e.target.value})} required />
            </div>
            <button type="submit" className="w-full py-4 bg-[#e6b32a] text-black rounded-2xl font-black uppercase">Atualizar Tabela</button>
          </form>
        </div>
      )}

      <ModalConfirmacao isOpen={isConfirmModalOpen} onClose={() => setIsConfirmModalOpen(false)} onConfirm={modalConfig.acao} tipo={modalConfig.tipo} mensagem={modalConfig.mensagem} />
    {/* </AdminLayout> */}
    </>
  );
}