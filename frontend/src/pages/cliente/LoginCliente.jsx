import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert.jsx';

export default function LoginCliente() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [alertConfig, setAlertConfig] = useState({
    show: false,
    titulo: '',
    mensagem: '',
    tipo: 'success'
  });

  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      /**
       * Como sua api.js usa fetch e retorna res.json() direto,
       * a variável 'userData' já conterá o objeto { _id, nome, ... }
       */
      const userData = await api.post('/clientes/login', { 
        email: email.toLowerCase().trim(), 
        senha 
      });

      console.log("Dados do usuário recebidos:", userData);

      // No seu fetch, o ID estará diretamente na raiz do objeto retornado
      const userId = userData?._id || userData?.id;

      if (userId) {
        localStorage.setItem('clienteId', userId);
        
        setAlertConfig({
          show: true,
          titulo: 'bem-vindo!',
          mensagem: 'login realizado com sucesso.',
          tipo: 'success'
        });

        setTimeout(() => {
          navigate(`/cliente/${userId}`);
        }, 1500);
      } else {
        throw new Error("id do usuário não encontrado na resposta.");
      }

    } catch (error) {
      console.error("erro ao realizar login:", error);
      
      /**
       * No seu fetch customizado, o erro capturado aqui 
       * terá a mensagem que você definiu na api.js
       */
      setAlertConfig({
        show: true,
        titulo: 'falha no acesso',
        mensagem: error.message === 'erro 401' ? 'e-mail ou senha incorretos.' : error.message,
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
    <div className={`flex min-h-screen items-center justify-center p-4 font-sans transition-colors duration-300 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'}`}>
      
      <button 
        onClick={() => navigate('/')} 
        className={`fixed top-8 left-8 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${
          isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <IoChevronBackOutline size={20} />
      </button>

      <form onSubmit={handleLogin} className={`w-full max-w-sm p-8 space-y-6 rounded-[2.5rem] border shadow-2xl transition-colors ${
        isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200'
      }`}>
        <div className="text-center space-y-2">
          <h2 className={`text-3xl font-black italic lowercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            barber.<span className="text-[#e6b32a]">flow</span>
          </h2>
          <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[3px]">acesso do cliente</p>
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
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#e6b32a] transition-colors"
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

        <div className="pt-4 border-t border-black/5 dark:border-white/5 text-center">
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
              as senhas são protegidas por bcrypt<br/>fale com seu barbeiro para o link
          </p>
        </div>
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