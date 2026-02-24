import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';

export default function LoginBarbeiro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await api.post('/barbeiros/login', { email, senha });
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
      alert('erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white dark:bg-[#0a0a0a] p-6 transition-colors duration-300">
      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-sm p-8 space-y-6 bg-slate-50 dark:bg-[#111] rounded-[2.5rem] border border-slate-100 dark:border-white/5 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black italic text-slate-900 dark:text-white tracking-tighter lowercase">barber.flow</h2>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">acesso profissional</p>
        </div>

        <div className="space-y-3">
          <input 
            type="email" 
            placeholder="e-mail" 
            required 
            className="w-full p-4 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-[#e6b32a] transition-all"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="senha" 
            required 
            className="w-full p-4 bg-white dark:bg-black border border-slate-200 dark:border-white/10 rounded-2xl text-sm text-slate-900 dark:text-white outline-none focus:border-slate-900 dark:focus:border-[#e6b32a] transition-all"
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-slate-900 dark:bg-[#e6b32a] text-white dark:text-black font-black uppercase text-xs rounded-2xl active:scale-95 transition-all disabled:opacity-50 shadow-lg"
        >
          {loading ? 'autenticando...' : 'entrar no painel'}
        </button>

        <p className="text-[10px] text-center text-slate-400 uppercase font-bold tracking-tighter">
          não tem conta? <Link to="/barbeiro/register" className="text-slate-900 dark:text-[#e6b32a] font-black hover:underline">registre-se aqui</Link>
        </p>
      </form>
    </div>
  );
}