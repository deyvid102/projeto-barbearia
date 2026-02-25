import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoChevronBackOutline } from 'react-icons/io5';

export default function LoginBarbeiro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/barbeiros/login', { email, senha });
      const user = response.data || response;

      if (user.mensagem || user.error) {
        alert(user.mensagem || user.error);
        setLoading(false);
        return;
      }

      if (user && user._id) {
        localStorage.setItem('barbeiroId', user._id);
        navigate(`/barbeiro/${user._id}`);
      } else {
        alert('erro: dados de usuário não recebidos corretamente.');
      }
    } catch (error) {
      console.error("erro na autenticação:", error);
      alert('erro ao realizar login.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`flex min-h-screen items-center justify-center p-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-[#0a0a0a]' : 'bg-gray-50'
    }`}>
      {/* Botão Voltar */}
      <button 
        onClick={() => navigate('/')} 
        className={`fixed top-8 left-8 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${
          isDarkMode ? 'bg-white/5 border-white/10 text-gray-400' : 'bg-white border-slate-200 text-slate-600'
        }`}
      >
        <IoChevronBackOutline size={20} />
      </button>

      <form 
        onSubmit={handleLogin} 
        className={`w-full max-w-sm p-8 space-y-6 rounded-[2.5rem] border shadow-2xl transition-all ${
          isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'
        }`}
      >
        <div className="text-center space-y-2">
          <h2 className={`text-3xl font-black italic lowercase tracking-tighter ${
            isDarkMode ? 'text-white' : 'text-slate-900'
          }`}>
            barber.<span className="text-[#e6b32a]">flow</span>
          </h2>
          <p className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[3px]">acesso profissional</p>
        </div>

        <div className="space-y-3">
          <input 
            type="email" 
            placeholder="e-mail" 
            required 
            className={`w-full p-4 rounded-2xl text-sm outline-none transition-all border ${
              isDarkMode 
                ? 'bg-black border-white/10 text-white focus:border-[#e6b32a]' 
                : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-black'
            }`}
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          
          <div className="relative">
            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="senha" 
              required 
              className={`w-full p-4 rounded-2xl text-sm outline-none transition-all border ${
                isDarkMode 
                  ? 'bg-black border-white/10 text-white focus:border-[#e6b32a]' 
                  : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-black'
              }`}
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
          className={`w-full py-4 font-black uppercase text-xs rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-lg ${
            isDarkMode 
              ? 'bg-[#e6b32a] text-black' 
              : 'bg-slate-900 text-white'
          }`}
        >
          {loading ? 'autenticando...' : 'entrar no painel'}
        </button>

        <div className="pt-4 border-t border-black/5 dark:border-white/5 text-center">
          <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
            acesso restrito a profissionais<br/>
            cadastrados pelo administrador
          </p>
        </div>
      </form>
    </div>
  );
}