import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { IoChevronBackOutline } from 'react-icons/io5';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert.jsx';

export default function RegisterCliente() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  
  const [formData, setFormData] = useState({ 
    nome: '', 
    numero: '', 
    email: '', 
    senha: '',
    fk_barbearia: '' 
  });
  
  const [confirmarSenha, setConfirmarSenha] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [alertConfig, setAlertConfig] = useState({
    show: false,
    titulo: '',
    mensagem: '',
    tipo: 'success'
  });

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    // Ajustado para 'fk_barbearia' conforme enviado pelo componente de agendamento
    const barbeariaId = params.get('fk_barbearia') || params.get('barbearia');
    if (barbeariaId) {
      setFormData(prev => ({ ...prev, fk_barbearia: barbeariaId }));
    }
  }, [location]);

  const closeAlert = useCallback(() => {
    setAlertConfig(prev => ({ ...prev, show: false }));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.senha !== confirmarSenha) {
      setAlertConfig({
        show: true,
        titulo: 'erro no cadastro',
        mensagem: 'as senhas não coincidem!',
        tipo: 'error'
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Cria o perfil do cliente
      const resCliente = await api.post('/clientes', formData);
      const novoCliente = resCliente.data || resCliente;

      // 2. Verifica se existe um agendamento pendente no localStorage
      const pendingAppointment = localStorage.getItem('pending_appointment');

      if (pendingAppointment) {
        try {
          const appointmentData = JSON.parse(pendingAppointment);
          
          // Prepara o payload final com o ID do cliente recém-criado
          const finalPayload = {
            tipoCorte: appointmentData.tipoCorte,
            fk_barbeiro: appointmentData.fk_barbeiro,
            fk_barbearia: appointmentData.fk_barbearia,
            datahora: appointmentData.datahora,
            datahora_fim: appointmentData.datahora_fim,
            fk_cliente: novoCliente._id, // ID que acabou de ser gerado
            valor: Number(appointmentData.valor),
            tempo_estimado: Number(appointmentData.tempo),
            status: 'A'
          };

          // Salva o agendamento automaticamente
          await api.post('/agendamentos', finalPayload);
          
          // Limpa o agendamento pendente
          localStorage.removeItem('pending_appointment');

          setAlertConfig({
            show: true,
            titulo: 'sucesso total!',
            mensagem: 'conta criada e horário reservado com sucesso!',
            tipo: 'success'
          });

          setTimeout(() => {
            navigate(`/cliente/${novoCliente._id}`);
          }, 2000);
          return; // Finaliza aqui para não seguir para o fluxo normal de login
        } catch (errAppo) {
          console.error("Erro ao finalizar agendamento automático:", errAppo);
          // Se falhar o agendamento, ainda assim a conta foi criada, então seguimos para o login
        }
      }

      // Fluxo normal (sem agendamento pendente)
      setAlertConfig({
        show: true,
        titulo: 'sucesso!',
        mensagem: 'registro criado! redirecionando para login...',
        tipo: 'success'
      });
      
      setTimeout(() => {
        navigate('/cliente/login');
      }, 2000);

    } catch (error) {
      console.error(error);
      setAlertConfig({
        show: true,
        titulo: 'falha no registro',
        mensagem: error.response?.data?.message || 'não foi possível criar sua conta.',
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
      
      <div className="flex items-center justify-center p-6 lg:p-20 order-2 lg:order-1 relative">
        <button 
          onClick={() => navigate(-1)} 
          className={`absolute top-8 left-8 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 shadow-sm z-50 ${
            isDarkMode ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white' : 'bg-white border-slate-200 text-slate-600 hover:text-black'
          }`}
        >
          <IoChevronBackOutline size={20} />
        </button>

        <form onSubmit={handleSubmit} className={`w-full max-w-md p-8 lg:p-10 space-y-6 rounded-[3rem] border shadow-2xl transition-all duration-500 ${
          isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'
        }`}>
          <div className="text-center space-y-2">
            <h2 className={`text-3xl font-black italic lowercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              barber.<span className="text-[#e6b32a]">flow</span>
            </h2>
            <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[3px]">novo cadastro de cliente</p>
          </div>

          <div className="space-y-3">
            <input 
              type="text" placeholder="nome completo" required 
              className={inputStyle}
              onChange={e => setFormData({...formData, nome: e.target.value})} 
            />
            <input 
              type="text" placeholder="telefone / whatsapp" 
              className={inputStyle}
              onChange={e => setFormData({...formData, numero: e.target.value})} 
            />
            <input 
              type="email" placeholder="e-mail" required 
              className={inputStyle}
              onChange={e => setFormData({...formData, email: e.target.value})} 
            />
            
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="crie uma senha" required 
                className={inputStyle}
                onChange={e => setFormData({...formData, senha: e.target.value})} 
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-[#e6b32a]"
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <input 
              type={showPassword ? "text" : "password"} 
              placeholder="repita a senha" required 
              className={inputStyle}
              onChange={e => setConfirmarSenha(e.target.value)} 
            />
          </div>

          {formData.fk_barbearia && (
            <div className={`p-3 rounded-xl border flex items-center justify-center gap-2 ${
              isDarkMode ? 'bg-[#e6b32a]/5 border-[#e6b32a]/20' : 'bg-emerald-50 border-emerald-100'
            }`}>
              <span className="w-1.5 h-1.5 bg-[#e6b32a] rounded-full animate-pulse" />
              <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-widest">
                vínculo ativo para agendamento
              </p>
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-4 bg-[#e6b32a] text-black font-black uppercase text-xs rounded-2xl active:scale-95 transition-all shadow-lg shadow-[#e6b32a]/20 hover:brightness-110 disabled:opacity-50"
          >
            {loading ? 'processando...' : 'finalizar e agendar'}
          </button>

          <p className={`text-[11px] text-center font-bold lowercase ${isDarkMode ? 'text-gray-500' : 'text-slate-400'}`}>
            já tem conta? <Link to="/cliente/login" className="text-[#e6b32a] hover:underline font-black">faça login</Link>
          </p>

          <div className="pt-4 border-t border-black/5 dark:border-white/5 text-center">
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest leading-relaxed">
                as senhas são protegidas por bcrypt
            </p>
          </div>
        </form>
      </div>

      <div className="hidden lg:block relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-[#e6b32a]/10 z-10 mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1000" 
          alt="Barber Shop" 
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
          onClose={closeAlert}
        />
      )}
    </div>
  );
}