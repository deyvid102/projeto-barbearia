import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
  const [fkBarbearia, setFkBarbearia] = useState(null);
  const [dadosBarbearia, setDadosBarbearia] = useState(null);
  
  const [alertConfig, setAlertConfig] = useState({ 
    show: false, 
    titulo: '', 
    mensagem: '', 
    tipo: 'error' 
  });
  
  const navigate = useNavigate();
  const { nomeBarbearia } = useParams(); // Pega 'barbeariateste' da URL
  const { isDarkMode } = useTheme();

  useEffect(() => {
    if (nomeBarbearia) {
      fetchBarbeariaInfo(nomeBarbearia);
    }
  }, [nomeBarbearia]);

  // Busca as informações usando a rota /perfil/:perfil que você definiu no backend
  const fetchBarbeariaInfo = async (slug) => {
    try {
      // AJUSTADO: Agora batendo na rota exata do seu backend
      const response = await api.get(`/barbearias/perfil/${slug}`);
      const dados = response.data || response;
      
      if (dados && (dados._id || dados.id)) {
        setDadosBarbearia(dados);
        setFkBarbearia(dados._id || dados.id);
        console.log("✅ Barbearia carregada via perfil:", dados.nome);
      }
    } catch (error) {
      console.error("❌ Barbearia não encontrada na rota /perfil");
      // Fallback caso a rota de perfil falhe (busca manual)
      tentarBuscaManual(slug);
    }
  };

  const tentarBuscaManual = async (slug) => {
    try {
      const resGeral = await api.get('/barbearias');
      const lista = resGeral.data || resGeral || [];
      const encontrada = lista.find(b => 
        b.nome.toLowerCase().trim().replace(/\s+/g, '-') === slug.toLowerCase().trim()
      );

      if (encontrada) {
        setDadosBarbearia(encontrada);
        setFkBarbearia(encontrada._id || encontrada.id);
      }
    } catch (err) {
      console.error("Falha na busca manual");
    }
  };

  const handleVoltar = () => {
    navigate(nomeBarbearia ? `/${nomeBarbearia}` : '/');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!fkBarbearia) {
      setAlertConfig({ 
        show: true, 
        titulo: 'Acesso Restrito', 
        mensagem: 'Não foi possível identificar a barbearia através deste link.', 
        tipo: 'error' 
      });
      return;
    }

    setLoading(true);

    try {
      const response = await api.post('/barbeiros/login', { 
        email: email.toLowerCase().trim(), 
        senha,
        fk_barbearia: fkBarbearia 
      });

      const user = response.data || response;

      if (user && (user._id || user.id)) {
        
        // VALIDAÇÃO DE SEGURANÇA: Bloqueia login se o barbeiro for de outra barbearia
        const idBarbeariaUsuario = user.fk_barbearia?._id || user.fk_barbearia;
        
        if (String(idBarbeariaUsuario).trim() !== String(fkBarbearia).trim()) {
          setAlertConfig({ 
            show: true, 
            titulo: 'Acesso Negado', 
            mensagem: `Este profissional está vinculado a outra unidade e não pode acessar o painel de ${dadosBarbearia?.nome}.`, 
            tipo: 'error' 
          });
          setLoading(false);
          return;
        }

        // Se passou, salva e redireciona
        const idFinal = user._id || user.id;
        localStorage.setItem('barbeiroId', idFinal);
        localStorage.setItem('barbeiroNome', user.nome);
        localStorage.setItem('lastBarbearia', fkBarbearia);

        navigate(`/barbeiro/dashboard/${idFinal}`);
      }
    } catch (error) {
      const msg = error.response?.data?.mensagem || 'E-mail ou senha inválidos.';
      setAlertConfig({ 
        show: true, 
        titulo: 'Falha no Login', 
        mensagem: msg, 
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
          type="button"
          onClick={handleVoltar} 
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
              {dadosBarbearia?.nome ? `Acesso: ${dadosBarbearia.nome}` : 'Acesso Profissional'}
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
            className={`w-full py-4 font-black uppercase text-xs rounded-2xl active:scale-95 transition-all shadow-lg disabled:opacity-50 ${
              isDarkMode 
                ? 'bg-[#e6b32a] text-black shadow-[#e6b32a]/10 hover:brightness-110' 
                : 'bg-slate-900 text-white shadow-slate-900/20 hover:bg-black'
            }`}
          >
            {loading ? 'autenticando...' : 'entrar no painel'}
          </button>
        </form>
      </div>

      <div className="hidden lg:block relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-[#e6b32a]/10 z-10 mix-blend-overlay"></div>
        <img 
          src="https://images.pexels.com/photos/3993323/pexels-photo-3993323.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" 
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