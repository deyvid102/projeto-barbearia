import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function RegisterCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({ 
    nome: '', 
    numero: '', 
    email: '', 
    senha: '',
    fk_barbearia: '' 
  });
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const barbeariaId = params.get('barbearia');
    if (barbeariaId) {
      setFormData(prev => ({ ...prev, fk_barbearia: barbeariaId }));
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.senha !== confirmarSenha) {
      alert('as senhas não coincidem!');
      return;
    }

    try {
      await api.post('/clientes', formData);
      alert('registro criado com sucesso!');
      navigate('/cliente/login');
    } catch (error) {
      console.error(error);
      alert('erro ao realizar registro. verifique se o e-mail já existe.');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-sm p-8 space-y-5 bg-[#111] rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black italic lowercase tracking-tighter text-white">barber.flow</h2>
          <p className="text-[10px] text-[#e6b32a] uppercase font-bold tracking-[2px]">novo cadastro</p>
        </div>

        <div className="space-y-3">
          <input 
            type="text" placeholder="nome completo" required 
            className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
            onChange={e => setFormData({...formData, nome: e.target.value})} 
          />
          <input 
            type="text" placeholder="telefone / whatsapp" 
            className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
            onChange={e => setFormData({...formData, numero: e.target.value})} 
          />
          <input 
            type="email" placeholder="e-mail" required 
            className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="crie uma senha" required 
              className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
              onChange={e => setFormData({...formData, senha: e.target.value})} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#e6b32a]"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="repita a senha" required 
            className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
            onChange={e => setConfirmarSenha(e.target.value)} 
          />
        </div>

        {formData.fk_barbearia && (
          <div className="bg-[#e6b32a]/10 border border-[#e6b32a]/20 p-3 rounded-xl">
            <p className="text-[9px] text-[#e6b32a] uppercase font-black text-center tracking-widest">
              ✓ barbearia vinculada
            </p>
          </div>
        )}

        <button type="submit" className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl active:scale-95 transition-all">
          finalizar registro
        </button>

        <p className="text-[11px] text-center text-gray-500 lowercase">
          já tem conta? <Link to="/cliente/login" className="text-[#e6b32a] font-bold">faça login</Link>
        </p>
      </form>
    </div>
  );
}