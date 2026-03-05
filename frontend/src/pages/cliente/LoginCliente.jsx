import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert';

export default function LoginCliente() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fkBarbearia, setFkBarbearia] = useState(null);
  
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    titulo: '',
    mensagem: '',
    tipo: 'error'
  });

  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();

  useEffect(() => {
    // Captura a barbearia da URL para manter o vínculo durante o login
    const params = new URLSearchParams(location.search);
    const id = params.get('barbearia') || params.get('fk_barbearia');
    if (id) setFkBarbearia(id);
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Enviamos o email, senha E a barbearia para o backend validar o vínculo
      const userData = await api.post('/clientes/login', { 
        email: email.toLowerCase().trim(), 
        senha,
        fk_barbearia: fkBarbearia 
      });

      const userId = userData?._id || userData?.id;

      if (userId) {
        localStorage.setItem('clienteId', userId);
        if (fkBarbearia) localStorage.setItem('lastBarbearia', fkBarbearia);
        
        navigate(`/cliente/${userId}`);
      } else {
        throw new Error("id do usuário não encontrado.");
      }

    } catch (error) {
      console.error("erro ao realizar login:", error);
      setAlertConfig({
        show: true,
        titulo: 'falha no acesso',
        mensagem: error.response?.data?.message || 'E-mail ou senha incorretos para esta barbearia.',
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
      
      <div className="flex items-center justify-center p-8 lg:p-20 order-2 lg:order-1 relative">
        <button 
          onClick={() => navigate(-1)} 
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
            <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[3px]">
               {fkBarbearia ? 'Acesso Barbearia Vinculada' : 'Acesso Geral'}
            </p>
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
            className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#e6b32a]/20 hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'autenticando...' : 'entrar'}
          </button>

          <div className="space-y-4 text-center">
            {/* LINK DE CADASTRO COM O ID DA BARBEARIA NA URL */}
            <button 
              type="button"
              onClick={() => navigate(`/cliente/register?barbearia=${fkBarbearia || ''}`)}
              className="text-[10px] text-[#e6b32a] font-black uppercase tracking-widest hover:underline"
            >
              Não tem conta? Cadastre-se aqui
            </button>
            
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 text-center text-[9px] text-gray-400 uppercase font-black tracking-widest leading-relaxed">
                Logando em: <span className="text-[#e6b32a]">{fkBarbearia || 'Unidade Geral'}</span>
            </div>
          </div>
        </form>
      </div>

      <div className="hidden lg:block relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-[#e6b32a]/10 z-10 mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1585747860715-2ba37e788b70?auto=format&fit=crop&q=80&w=1000" 
          alt="Experience" 
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