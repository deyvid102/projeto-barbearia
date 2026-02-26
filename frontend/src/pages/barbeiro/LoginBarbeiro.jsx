import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert';

export default function LoginBarbeiro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState({ 
    show: false, 
    titulo: '', 
    mensagem: '', 
    tipo: 'error' 
  });
  
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await api.post('/barbeiros/login', { 
        email: email.toLowerCase().trim(), 
        senha 
      });
      const user = response.data || response;

      if (user && user._id) {
        localStorage.setItem('barbeiroId', user._id);
        navigate(`/barbeiro/dashboard/${user._id}`);
      } else {
        throw new Error('dados de usuário inválidos.');
      }
    } catch (error) {
      console.error("erro na autenticação:", error);
      setAlertConfig({ 
        show: true, 
        titulo: 'falha no acesso', 
        mensagem: error.response?.data?.message || 'credenciais de profissional inválidas.', 
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
    <div className={`min-h-screen grid lg:grid-cols-2 transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'
    }`}>
      
      {/* Coluna da Esquerda: Formulario */}
      <div className="flex items-center justify-center p-8 lg:p-20 order-2 lg:order-1 relative">
        <button 
          onClick={() => navigate('/')} 
          className={`absolute top-8 left-8 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 shadow-sm ${
            isDarkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-black'
          }`}
        >
          <IoChevronBackOutline size={20} />
        </button>

        <form onSubmit={handleLogin} className={`w-full max-w-sm p-10 space-y-8 rounded-[3rem] border shadow-2xl transition-all duration-500 ${
          isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'
        }`}>
          <div className="text-center space-y-2">
            <h2 className={`text-3xl font-black italic lowercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              barber.<span className="text-[#e6b32a]">flow</span>
            </h2>
            <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[3px]">acesso profissional</p>
          </div>

          <div className="space-y-3">
            <input
              type="email" 
              placeholder="e-mail" 
              required
              className={inputStyle}
              value={email} 
              onChange={(e) => setEmail(e.target.value)}
            />
            
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} 
                placeholder="senha" 
                required
                className={inputStyle}
                value={senha} 
                onChange={(e) => setSenha(e.target.value)}
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#e6b32a] transition-colors"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className={`w-full py-4 font-black uppercase text-xs rounded-2xl active:scale-95 transition-all shadow-lg disabled:opacity-50 ${
              isDarkMode 
                ? 'bg-[#e6b32a] text-black shadow-[#e6b32a]/10 hover:brightness-110' 
                : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-black'
            }`}
          >
            {loading ? 'autenticando...' : 'entrar no painel'}
          </button>

          <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-center">
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest leading-relaxed">
                acesso restrito a profissionais<br/>cadastrados pelo administrador
            </p>
          </div>
        </form>
      </div>

      {/* Coluna da Direita: Imagem */}
      <div className="hidden lg:block relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-[#e6b32a]/10 z-10 mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1517832606299-7ae9b720a186?auto=format&fit=crop&q=80&w=1000" 
          alt="Professional" 
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%] brightness-[0.7]"
        />
        <div className={`absolute inset-0 z-20 transition-colors duration-500 ${
          isDarkMode ? 'bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent' : 'bg-gradient-to-r from-slate-50 via-slate-50/20 to-transparent'
        }`}></div>
      </div>

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