import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';

export default function ClienteConfiguracoes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // inicializamos sempre com string vazia para evitar o erro de "controlled to uncontrolled"
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');
  
  // estados para o fluxo de senha no modal
  const [isSenhaModalOpen, setIsSenhaModalOpen] = useState(false);
  const [etapaSenha, setEtapaSenha] = useState(1); 
  const [senhaAtual, setSenhaAtual] = useState('');
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarNovaSenha, setConfirmarNovaSenha] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);

  useEffect(() => {
    if (!id) return navigate('/cliente/login');
    
    const loadCliente = async () => {
      try {
        const res = await api.get(`/clientes/${id}`);
        const cliente = res.data || res;
        // o uso do || '' garante que o input nunca receba undefined
        setNome(cliente.nome || '');
        setTelefone(cliente.telefone || '');
      } catch (error) {
        console.error("erro ao carregar perfil:", error);
      }
    };
    loadCliente();
  }, [id, navigate]);

  const abrirModalSenha = () => {
    setEtapaSenha(1);
    setSenhaAtual('');
    setNovaSenha('');
    setConfirmarNovaSenha('');
    setIsSenhaModalOpen(true);
  };

  const handleProximaEtapa = () => {
    if (etapaSenha === 1) {
      if (!senhaAtual) return alert("digite sua senha atual");
      setEtapaSenha(2);
    } else {
      if (novaSenha !== confirmarNovaSenha) return alert("as senhas não coincidem");
      if (novaSenha.length < 4) return alert("a nova senha é muito curta");
      setIsSenhaModalOpen(false);
    }
  };

  const handleSubmitAttempt = (e) => {
    e.preventDefault();
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSave = async () => {
    setIsConfirmModalOpen(false);
    setLoading(true);
    
    try {
      // payload para a rota localhost:3000/clientes/_id
      const payload = {
        nome,
        telefone
      };
      
      if (senhaAtual) payload.senhaAtual = senhaAtual;
      if (novaSenha) payload.novaSenha = novaSenha;

      await api.put(`/clientes/${id}`, payload);
      
      alert("perfil atualizado com sucesso!");
      navigate(`/cliente/${id}`);
    } catch (error) {
      alert(error.response?.data?.message || "erro ao atualizar perfil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 font-sans">
      <div className="max-w-md mx-auto space-y-10">
        
        <header className="flex items-center gap-4 pt-4">
          <button 
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-gray-400"
          >
            ←
          </button>
          <div>
            <h1 className="text-xl font-black text-white lowercase tracking-tighter">configurações</h1>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[3px]">minha conta</p>
          </div>
        </header>

        <form onSubmit={handleSubmitAttempt} className="space-y-8">
          
          <div className="space-y-4">
            <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[0.3em] px-2">dados pessoais</h2>
            <div className="bg-[#111] p-6 rounded-[2.5rem] border border-white/5 space-y-6 shadow-2xl">
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest pl-1">nome completo</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#e6b32a] transition-colors"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest pl-1">telefone</label>
                <input 
                  type="text"
                  required
                  className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#e6b32a] transition-colors font-mono"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[0.3em] px-2">segurança</h2>
            <div className="bg-[#111] p-2 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <button 
                type="button"
                onClick={abrirModalSenha}
                className="w-full p-6 flex items-center justify-between group"
              >
                <div className="text-left">
                  <p className="text-sm font-bold text-white">alterar senha</p>
                  <p className="text-[9px] text-gray-500 uppercase tracking-widest">
                    {novaSenha ? "senha definida para alteração" : "clique para mudar sua senha"}
                  </p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-[#e6b32a] group-hover:bg-[#e6b32a] group-hover:text-black transition-all">
                  →
                </div>
              </button>
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full py-5 bg-[#e6b32a] text-black font-black uppercase text-[11px] tracking-[2px] rounded-[1.5rem] shadow-xl active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "processando..." : "salvar alterações"}
          </button>
        </form>
      </div>

      {/* MODAL DE ALTERAR SENHA (ETAPAS) */}
      {isSenhaModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-xs bg-[#111] border border-white/10 rounded-[2.5rem] p-8 space-y-6">
            <header className="text-center space-y-2">
              <h3 className="text-white font-black uppercase text-[10px] tracking-[0.2em]">
                {etapaSenha === 1 ? "passo 01: senha atual" : "passo 02: nova senha"}
              </h3>
              <div className="flex justify-center gap-1">
                <div className={`h-1 w-8 rounded-full ${etapaSenha === 1 ? 'bg-[#e6b32a]' : 'bg-white/10'}`} />
                <div className={`h-1 w-8 rounded-full ${etapaSenha === 2 ? 'bg-[#e6b32a]' : 'bg-white/10'}`} />
              </div>
            </header>

            <div className="space-y-4">
              {etapaSenha === 1 ? (
                <div className="space-y-2">
                  <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">digite a senha atual</label>
                  <input 
                    type="password"
                    autoFocus
                    className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#e6b32a]"
                    value={senhaAtual}
                    onChange={(e) => setSenhaAtual(e.target.value)}
                  />
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">nova senha</label>
                    <input 
                      type="password"
                      autoFocus
                      className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#e6b32a]"
                      value={novaSenha}
                      onChange={(e) => setNovaSenha(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[9px] text-gray-500 uppercase font-black tracking-widest">confirmar nova senha</label>
                    <input 
                      type="password"
                      className="w-full bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-[#e6b32a]"
                      value={confirmarNovaSenha}
                      onChange={(e) => setConfirmarNovaSenha(e.target.value)}
                    />
                  </div>
                </>
              )}
            </div>

            <div className="space-y-3 pt-2">
              <button 
                onClick={handleProximaEtapa}
                className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl"
              >
                {etapaSenha === 1 ? "próximo" : "confirmar senha"}
              </button>
              <button 
                onClick={() => setIsSenhaModalOpen(false)}
                className="w-full text-[9px] text-gray-500 uppercase font-black tracking-widest"
              >
                cancelar
              </button>
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