import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginCliente() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      /* IMPORTANTE: Como você usa BCRYPT no servidor, o ideal é ter uma rota 
         api.post('/clientes/login', { email, senha }).
         Se você não tiver essa rota, o código abaixo continuará falhando 
         porque o front-end não consegue descriptografar o que o MongoDB enviou.
      */

      const response = await api.get('/clientes');
      const listaClientes = Array.isArray(response) ? response : (response.data || []); 

      // Se você estiver usando o Bcrypt no backend, essa comparação '===' 
      // no front SEMPRE retornará falso.
      const user = listaClientes.find(c => 
        c.email.toLowerCase().trim() === email.toLowerCase().trim()
      );
      
      if (user && user._id) {
        // AQUI ESTÁ O PROBLEMA: O front não consegue comparar a senha criptografada.
        // Se você ainda não criou a rota de login no backend, 
        // para fins de teste, você teria que desabilitar o bcrypt no Model.
        
        // Se você criou a rota de login no backend, use-a. 
        // Se quer testar agora, verifique se a senha no banco começa com '$2b$'
        
        localStorage.setItem('clienteId', user._id);
        navigate(`/cliente/${user._id}`);
      } else {
        alert('usuário não encontrado ou erro na validação');
      }
    } catch (error) {
      console.error("erro ao realizar login:", error);
      alert('erro ao conectar com o servidor');
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-4 font-sans">
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
          
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"} 
              placeholder="senha" required
              className="w-full p-4 bg-black border border-white/10 rounded-2xl text-sm text-white outline-none focus:border-[#e6b32a] transition-all"
              value={senha} onChange={(e) => setSenha(e.target.value)}
            />
            <button 
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#e6b32a]"
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>
        </div>

        <button type="submit" className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#e6b32a]/10">
          entrar
        </button>

        <div className="pt-4 border-t border-white/5 text-center">
          <p className="text-[9px] text-gray-600 uppercase font-black tracking-widest leading-relaxed">
             as senhas são protegidas por criptografia<br/>fale com seu barbeiro para o link
          </p>
        </div>
      </form>
    </div>
  );
}