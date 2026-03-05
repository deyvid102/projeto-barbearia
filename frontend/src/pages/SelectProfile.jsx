import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { IoPersonOutline, IoCutOutline, IoChevronBackOutline } from 'react-icons/io5';
import { useTheme } from '../components/ThemeContext';

export default function SelectProfile() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isDarkMode } = useTheme();
  const [fkBarbearia, setFkBarbearia] = useState(null);

  useEffect(() => {
    // Captura o ID da barbearia da URL para repassar aos botões de login
    const params = new URLSearchParams(location.search);
    const id = params.get('barbearia') || params.get('fk_barbearia');
    if (id) setFkBarbearia(id);
  }, [location]);

  // Função para voltar à vitrine da barbearia ou home
  const handleBack = () => {
    if (fkBarbearia) {
      navigate(`/${fkBarbearia}`);
    } else {
      navigate('/');
    }
  };

  // Função auxiliar para construir a URL de destino com o parâmetro de barbearia
  const handleNavigation = (basePath) => {
    if (fkBarbearia) {
      navigate(`${basePath}?barbearia=${fkBarbearia}`);
    } else {
      navigate(basePath);
    }
  };

  return (
    <div className={`min-h-screen grid lg:grid-cols-2 transition-colors duration-500 ${
      isDarkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'
    }`}>
      
      {/* Coluna da Esquerda: Seleção */}
      <div className="flex items-center justify-center p-8 lg:p-20 order-2 lg:order-1 relative">
        
        {/* BOTÃO VOLTAR */}
        <button 
          onClick={handleBack} 
          className={`absolute top-8 left-8 w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 shadow-sm z-50 ${
            isDarkMode 
              ? 'bg-white/5 border-white/10 text-gray-400 hover:text-white hover:bg-white/10' 
              : 'bg-white border-slate-200 text-slate-600 hover:text-black hover:bg-slate-50'
          }`}
          title="Voltar para a barbearia"
        >
          <IoChevronBackOutline size={20} />
        </button>

        <div className={`w-full max-w-md p-10 space-y-10 rounded-[3rem] border transition-all duration-700 animate-in fade-in slide-in-from-left-8 ${
          isDarkMode 
            ? 'bg-[#111] border-white/5 shadow-2xl' 
            : 'bg-white border-slate-100 shadow-xl shadow-slate-200/50'
        }`}>
          
          {/* Header */}
          <div className="text-center space-y-3">
            <h1 className={`text-4xl font-black italic lowercase tracking-tighter ${
              isDarkMode ? 'text-white' : 'text-slate-900'
            }`}>
              barber.<span className="text-[#e6b32a]">flow</span>
            </h1>
            <p className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[4px]">
              {fkBarbearia ? 'Vínculo Detectado' : 'bem-vindo de volta'}
            </p>
          </div>

          {/* Opções de Perfil */}
          <div className="grid gap-5">
            {/* Opção Cliente */}
            <button
              onClick={() => handleNavigation('/cliente/login')}
              className={`group relative flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/5 hover:border-white/20' 
                  : 'bg-slate-50 border-slate-100 hover:border-slate-200 shadow-sm'
              }`}
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all group-hover:shadow-[0_0_20px_rgba(230,179,42,0.3)] ${
                isDarkMode ? 'bg-white text-black' : 'bg-slate-900 text-white'
              }`}>
                <IoPersonOutline size={28} />
              </div>
              <div className="text-center">
                <span className={`block font-black uppercase text-xs tracking-[2px] ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  sou cliente
                </span>
                <span className="text-[9px] text-gray-500 uppercase font-medium mt-1 block">agendar serviço</span>
              </div>
            </button>

            {/* Opção Barbeiro */}
            <button
              onClick={() => navigate('/barbeiro/login')}
              className={`group relative flex flex-col items-center gap-4 p-8 rounded-[2rem] border-2 transition-all duration-300 hover:scale-[1.02] active:scale-95 ${
                isDarkMode 
                  ? 'bg-white/5 border-white/5 hover:border-[#e6b32a]/50' 
                  : 'bg-white border-slate-200 hover:border-[#e6b32a] shadow-sm'
              }`}
            >
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center bg-[#e6b32a] text-black transition-all group-hover:shadow-[0_0_20px_rgba(230,179,42,0.5)]">
                <IoCutOutline size={28} />
              </div>
              <div className="text-center">
                <span className={`block font-black uppercase text-xs tracking-[2px] ${
                  isDarkMode ? 'text-white' : 'text-slate-900'
                }`}>
                  sou barbeiro
                </span>
                <span className="text-[9px] text-gray-500 uppercase font-medium mt-1 block">gerenciar agenda</span>
              </div>
            </button>
          </div>

          <div className="pt-4 text-center">
            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-[3px] opacity-40">
              Barber Management System {fkBarbearia && `• ID: ${fkBarbearia}`}
            </p>
          </div>
        </div>
      </div>

      {/* Coluna da Direita: Imagem */}
      <div className="hidden lg:block relative overflow-hidden order-1 lg:order-2">
        <div className="absolute inset-0 bg-[#e6b32a]/10 z-10 mix-blend-overlay"></div>
        <img 
          src="https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&q=80&w=1000" 
          alt="Barbershop Experience" 
          className="absolute inset-0 w-full h-full object-cover grayscale-[20%] brightness-[0.7]"
        />
        <div className={`absolute inset-0 z-20 ${
          isDarkMode 
          ? 'bg-gradient-to-r from-[#0a0a0a] via-transparent to-transparent' 
          : 'bg-gradient-to-r from-slate-50 via-transparent to-transparent'
        }`}></div>
        
        <div className="absolute bottom-20 left-20 z-30 max-w-xs animate-in fade-in slide-in-from-bottom-10 duration-1000">
          <p className="text-white text-4xl font-black italic leading-tight">
            ESTILO É <br />
            <span className="text-[#e6b32a]">IDENTIDADE.</span>
          </p>
        </div>
      </div>
    </div>
  );
}