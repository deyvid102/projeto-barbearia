import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../../services/Api.js';

export default function LoginCliente() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // O Axios retorna um objeto, os dados do banco ficam em .data
      const response = await api.get('/clientes');
      const listaClientes = response.data || response; 

      const user = listaClientes.find(c => c.email === email && c.senha === senha);
      
      if (user && user._id) {
        // Salva com _id do MongoDB
        localStorage.setItem('clienteId', user._id);
        // Redireciona usando o _id na URL
        navigate(`/cliente/${user._id}`);
      } else {
        alert('credenciais inválidas ou usuário não encontrado');
      }
    } catch (error) {
      console.error("erro ao realizar login:", error);
      alert('erro ao conectar com o servidor');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4">
      <form onSubmit={handleLogin} className="w-full max-w-sm p-8 space-y-6 bg-[#111] rounded-[2rem] border border-white/5 shadow-2xl">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-black italic lowercase tracking-tighter text-white">barber.flow</h2>
          <p className="text-[10px] text-[#e6b32a] uppercase font-bold tracking-[2px]">acesso do cliente</p>
        </div>

        <div className="space-y-3">
          <input
            type="email" placeholder="e-mail" required
            className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password" placeholder="senha" required
            className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
            value={senha} onChange={(e) => setSenha(e.target.value)}
          />
        </div>

        <button type="submit" className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl active:scale-95 transition-all">
          entrar
        </button>

        <p className="text-[11px] text-center text-gray-500 lowercase">
          não tem conta? <Link to="/cliente/register" className="text-[#e6b32a] font-bold">registre-se aqui</Link>
        </p>
      </form>
    </div>
  );
}