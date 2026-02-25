import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert.jsx';

export default function RegisterCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({ 
    nome: '', 
    numero: '', 
    email: '', 
    senha: '',
    fk_barbearia: '' 
  });
  
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    show: false,
    titulo: '',
    mensagem: '',
    tipo: 'success'
  });

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
      setAlertConfig({
        show: true,
        titulo: 'erro no cadastro',
        mensagem: 'as senhas não coincidem!',
        tipo: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/clientes', formData);
      setAlertConfig({
        show: true,
        titulo: 'sucesso!',
        mensagem: 'registro criado com sucesso! redirecionando...',
        tipo: 'success'
      });
      
      setTimeout(() => {
        navigate('/cliente/login');
      }, 2000);

    } catch (error) {
      console.error(error);
      setAlertConfig({
        show: true,
        titulo: 'falha no registro',
        mensagem: 'não foi possível criar sua conta. tente novamente.',
        tipo: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = `w-full p-4 rounded-2xl text-sm outline-none transition-all border ${
    isDarkMode 
      ? 'bg-black border-white/10 text-white focus:border-[#e6b32a]' 
      : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-black'
  }`;

  return (
    <div className={`flex min-h-screen items-center justify-center p-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      <form onSubmit={handleSubmit} className={`w-full max-w-sm p-8 space-y-5 rounded-[2.5rem] border shadow-2xl transition-colors ${
        isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
      }`}>
        <div className="text-center space-y-2">
          <h2 className={`text-3xl font-black italic lowercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            barber.<span className="text-[#e6b32a]">flow</span>
          </h2>
          <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[3px]">novo cadastro</p>
        </div>

        <div className="space-y-3">
          <input 
            type="text" placeholder="nome completo" required 
            className={inputStyle}
            onChange={e => setFormData({...formData, nome: e.target.value})} 
          />
          <input 
            type="text" placeholder="telefone / whatsapp" 
            className={inputStyle}
            onChange={e => setFormData({...formData, numero: e.target.value})} 
          />
          <input 
            type="email" placeholder="e-mail" required 
            className={inputStyle}
            onChange={e => setFormData({...formData, email: e.target.value})} 
          />
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="crie uma senha" required 
              className={inputStyle}
              onChange={e => setFormData({...formData, senha: e.target.value})} 
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#e6b32a]"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <input 
            type={showPassword ? "text" : "password"} 
            placeholder="repita a senha" required 
            className={inputStyle}
            onChange={e => setConfirmarSenha(e.target.value)} 
          />
        </div>

        {formData.fk_barbearia && (
          <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 ${
            isDarkMode ? 'bg-[#e6b32a]/5 border-[#e6b32a]/20' : 'bg-emerald-50 border-emerald-100'
          }`}>
            <span className="w-1.5 h-1.5 bg-[#e6b32a] rounded-full animate-pulse" />
            <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-widest">
              barbearia vinculada
            </p>
          </div>
        )}

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#e6b32a]/20 hover:brightness-110 disabled:opacity-50"
        >
          {loading ? 'processando...' : 'finalizar registro'}
        </button>

        <p className={`text-[11px] text-center font-bold lowercase ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
          já tem conta? <Link to="/cliente/login" className="text-[#e6b32a] hover:underline">faça login</Link>
        </p>
      </form>

      {alertConfig.show && (
        <CustomAlert 
          titulo={alertConfig.titulo}
          message={alertConfig.mensagem}
          type={alertConfig.tipo}
          onClose={() => setAlertConfig({ ...alertConfig, show: false })}
        />
      )}
    </div>
  );
}