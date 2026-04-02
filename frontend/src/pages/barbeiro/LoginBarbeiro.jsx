import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import CustomAlert from '../../components/CustomAlert';

// Importamos apenas o componente pai (o index.jsx da pasta barbeariasLayout)
import BarbeariasLayout from '../../layout/barbeariasLayout';

export default function LoginBarbeiro() {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingLayout, setLoadingLayout] = useState(true);
  const [dadosBarbearia, setDadosBarbearia] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ show: false, titulo: '', mensagem: '', tipo: 'error' });
  
  const navigate = useNavigate();
  const { nomeBarbearia } = useParams(); 

  useEffect(() => {
    if (nomeBarbearia) {
      fetchBarbeariaInfo(nomeBarbearia);
    } else {
      setLoadingLayout(false);
    }
  }, [nomeBarbearia]);

  const fetchBarbeariaInfo = async (slug) => {
    try {
      setLoadingLayout(true);
      const response = await api.get(`/barbearias/perfil/${slug}`);
      const dados = response.data || response;
      if (dados && (dados._id || dados.id)) {
        setDadosBarbearia(dados);
      }
    } catch (error) {
      console.error("Erro ao identificar unidade.");
    } finally {
      setTimeout(() => setLoadingLayout(false), 300);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!dadosBarbearia) return;
    setLoadingLogin(true);

    try {
      const response = await api.post('/barbeiros/login', { 
        email: email.toLowerCase().trim(), 
        senha 
      });
      
      const user = response.data || response;
      const barbeariaDoBarbeiro = user.fk_barbearia?._id || user.fk_barbearia || user.id_barbearia;

      if (String(barbeariaDoBarbeiro) !== String(dadosBarbearia._id)) {
        setAlertConfig({ 
          show: true, 
          titulo: 'Acesso Negado', 
          mensagem: 'Você não tem permissão para acessar o painel desta unidade.', 
          tipo: 'error' 
        });
        setLoadingLogin(false);
        return;
      }

      localStorage.setItem('barbeiroId', user._id || user.id);
      localStorage.setItem('barbeiroNome', user.nome);
      localStorage.setItem('isAdmin', user.admin); // opcional (bom pra usar depois)

      if (user.admin) {
        // 👉 vai para o painel admin
        navigate(`/admin/dashboard/${barbeariaDoBarbeiro}`);
      } else {
        // 👉 vai para o painel normal do barbeiro
        navigate(`/barbeiro/dashboard/${user._id || user.id}`);
      }

    } catch (error) {
      setAlertConfig({ 
        show: true, 
        titulo: 'Falha', 
        mensagem: 'E-mail ou senha incorretos.', 
        tipo: 'error' 
      });
    } finally {
      setLoadingLogin(false);
    }
  };

  if (loadingLayout) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-10 h-10 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] font-bold uppercase tracking-[3px] opacity-40">Carregando Identidade...</p>
    </div>
  );

  return (
    <>
      {/* Chamamos o BarbeariasLayout enviando a view='login'.
        Ele vai ler o dadosBarbearia.layout_key e renderizar o layout certo 
        já injetando as props de formulário.
      */}
      <BarbeariasLayout 
        view="login"
        barbearia={dadosBarbearia}
        email={email} 
        setEmail={setEmail}
        senha={senha} 
        setSenha={setSenha}
        showPassword={showPassword} 
        setShowPassword={setShowPassword}
        loadingLogin={loadingLogin}
        handleLogin={handleLogin}
        handleVoltar={() => navigate(nomeBarbearia ? `/${nomeBarbearia}` : '/')}
      />

      {alertConfig.show && (
        <CustomAlert 
          titulo={alertConfig.titulo}
          message={alertConfig.mensagem}
          type={alertConfig.tipo}
          onClose={() => setAlertConfig({ ...alertConfig, show: false })}
        />
      )}
    </>
  );
}