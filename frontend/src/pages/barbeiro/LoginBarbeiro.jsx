import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/Api.js';

export default function LoginBarbeiro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // 1. Busca a lista de barbeiros
      const response = await api.get('/barbeiros');
      
      // 2. Garante que estamos acessando .data e que seja um array
      const listaBarbeiros = response.data || response || [];
      
      // 3. Procura o usuário (MongoDB usa _id)
      const user = listaBarbeiros.find(b => b.email === email && b.senha === senha);

      if (user) {
        // CORREÇÃO CRÍTICA: MongoDB usa _id (com underline)
        const idReal = user._id;

        if (idReal) {
          localStorage.setItem('barbeiroId', idReal);
          console.log("Login bem-sucedido, ID:", idReal);
          navigate(`/barbeiro/${idReal}`);
        } else {
          alert('Erro: ID do usuário não encontrado no banco.');
        }
      } else {
        alert('E-mail ou senha inválidos.');
      }
    } catch (error) {
      console.error("Erro na autenticação:", error);
      alert('Erro ao conectar com o servidor.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-6">
      <form 
        onSubmit={handleLogin} 
        className="w-full max-w-sm p-8 space-y-6 bg-[#111] rounded-[2.5rem] border border-white/5 shadow-2xl"
      >
        <div className="text-center space-y-2">
          <h2 className="text-xl font-black italic text-white tracking-tighter lowercase">barber.flow</h2>
          <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">acesso profissional</p>
        </div>

        <div className="space-y-3">
          <input 
            type="email" 
            placeholder="e-mail" 
            required 
            className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="senha" 
            required 
            className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl active:scale-95 transition-all disabled:opacity-50"
        >
          {loading ? 'autenticando...' : 'entrar no painel'}
        </button>

        <p className="text-[10px] text-center text-gray-500 uppercase font-bold tracking-tighter">
          não tem conta? <Link to="/barbeiro/register" className="text-[#e6b32a] hover:underline">registre-se aqui</Link>
        </p>
      </form>
    </div>
  );
}