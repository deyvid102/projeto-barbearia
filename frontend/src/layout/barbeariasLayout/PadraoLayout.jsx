import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/ThemeContext';
import { 
  IoChevronForwardOutline, 
  IoLogInOutline,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowBackOutline
} from 'react-icons/io5';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';

import barbearia1 from '../../assets/barbearia1.jpg';
import barbearia2 from '../../assets/barbearia2.jpg';
import barbearia3 from '../../assets/barbearia3.jpg';

const brandYellow = '#EAB308';

export default function PadraoLayout({ 
  barbearia, 
  barbeiros, 
  view = 'home',
  children, 
  email, setEmail,
  senha, setSenha,
  showPassword, setShowPassword,
  loadingLogin,
  handleLogin,
  handleVoltar
}) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleLoginClick = () => {
    const barbeariaPath = barbearia?.nome?.toLowerCase().replace(/\s+/g, '-');
    navigate(`/barbeiro/login/${barbeariaPath}`);
  };

  const handleAgendarClick = () => {
    const barbeariaPath = barbearia?.nome?.toLowerCase().replace(/\s+/g, '-');
    navigate(`/agendar/${barbeariaPath}`);
  };

  const fotosExibicao = barbearia?.fotos?.length > 0 ? barbearia.fotos : [barbearia1, barbearia2, barbearia3];

  const formatarExibicaoZap = (val) => {
    if (!val) return "";
    const nums = val.replace(/\D/g, "");
    if (nums.length === 13) return `+${nums.substring(0, 2)} (${nums.substring(2, 4)}) ${nums.substring(4, 5)} ${nums.substring(5, 9)}-${nums.substring(9)}`;
    if (nums.length === 11) return `(${nums.substring(0, 2)}) ${nums.substring(2, 3)} ${nums.substring(3, 7)}-${nums.substring(7)}`;
    return val;
  };

  const whatsappLimpo = barbearia?.whatsapp?.replace(/\D/g, '');

  /* ==========================================================
      VIEW DE LOGIN
     ========================================================== */
  if (view === 'login') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}>
        <div className={`w-full max-w-sm p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border shadow-2xl transition-all ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="text-center mb-8 space-y-2">
            <h2 className={`text-2xl md:text-3xl font-black italic lowercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {barbearia?.nome || 'barber.flow'}
            </h2>
            <p className="text-[10px] text-[#EAB308] uppercase font-black tracking-[3px]">Acesso Profissional</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" placeholder="e-mail" required
              className={`w-full p-4 rounded-2xl text-sm outline-none border transition-all ${isDarkMode ? 'bg-black border-white/10 text-white focus:border-[#EAB308]' : 'bg-slate-50 border-slate-200 focus:border-black'}`}
              value={email} onChange={(e) => setEmail(e.target.value)}
            />
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} placeholder="senha" required
                className={`w-full p-4 rounded-2xl text-sm outline-none border transition-all ${isDarkMode ? 'bg-black border-white/10 text-white focus:border-[#EAB308]' : 'bg-slate-50 border-slate-200 focus:border-black'}`}
                value={senha} onChange={(e) => setSenha(e.target.value)}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                {showPassword ? <IoEyeOffOutline size={18}/> : <IoEyeOutline size={18}/>}
              </button>
            </div>
            <button className="w-full py-4 bg-[#EAB308] text-black font-black uppercase text-[10px] tracking-widest rounded-2xl hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-[#EAB308]/10">
              {loadingLogin ? 'autenticando...' : 'entrar no painel'}
            </button>
          </form>

          <button 
            type="button"
            onClick={handleVoltar}
            className="mt-8 w-full p-4 rounded-2xl bg-gray-50 text-gray-400 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 active:bg-gray-100 active:scale-95 transition-all"
          >
            <IoArrowBackOutline size={16} />
            Voltar
          </button>
        </div>
      </div>
    );
  }

  /* ==========================================================
      VIEW DE AGENDAMENTO (OTIMIZADA MOBILE)
     ========================================================== */
  if (view === 'agendamento') {
    return (
      <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-slate-900'}`}>
        <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-black/80 border-white/5' : 'bg-white/80 border-slate-100'}`}>
          <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
            <button 
              onClick={handleVoltar} 
              className={`p-3 rounded-2xl border transition-all active:scale-95 ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-slate-50 border-slate-200'}`}
            >
              <IoArrowBackOutline size={20} />
            </button>
            
            <div className="text-center flex-1 px-2">
              <h2 className="text-base md:text-lg font-black italic lowercase tracking-tighter leading-none line-clamp-1">{barbearia?.nome}</h2>
              <p className="text-[8px] uppercase font-black tracking-[2px] text-[#EAB308]">novo agendamento</p>
            </div>

            <div className="w-10 md:w-12" /> 
          </div>
        </header>

        {/* Padding responsivo: Menor no mobile (px-2) para não apertar o agendamento */}
        <main className="w-full max-w-4xl mx-auto py-4 md:py-8 px-2 md:px-4">
          {children}
        </main>
      </div>
    );
  }

  /* ==========================================================
      VIEW HOME
     ========================================================== */
  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'}`}>
      
      <button 
        onClick={handleLoginClick}
        className="fixed top-4 right-4 z-[100] p-3 rounded-full transition-all border backdrop-blur-md shadow-2xl hover:scale-110 active:scale-90"
        style={{ backgroundColor: `${brandYellow}ee`, borderColor: 'rgba(255,255,255,0.3)' }}
      >
        <IoLogInOutline size={22} color="#000" />
      </button>

      <section className="relative h-[70vh] md:h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Swiper modules={[Autoplay, EffectFade]} effect="fade" autoplay={{ delay: 5000 }} loop={true} className="w-full h-full">
            {fotosExibicao.map((foto, i) => (
              <SwiperSlide key={i}>
                <div className="relative w-full h-full">
                  <img src={foto} className="w-full h-full object-cover" alt="Ambiente" />
                  <div className="absolute inset-0 bg-black/60" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        <div className="relative z-10 text-center space-y-4 px-6 max-w-5xl">
          <h1 className="font-black italic lowercase tracking-tighter leading-[0.9] text-white text-5xl md:text-9xl">
            {barbearia?.nome}
          </h1>
          <button 
            onClick={handleAgendarClick} 
            className="w-full md:w-auto px-10 py-4 text-black font-black uppercase text-xs tracking-widest rounded-full hover:scale-105 transition-all mt-6 shadow-xl" 
            style={{ backgroundColor: brandYellow }}
          >
            agendar experiência
          </button>
        </div>
      </section>

      {/* Serviços: 1 coluna no mobile, 3 no PC */}
      <section className={`py-12 md:py-20 ${isDarkMode ? 'bg-[#0e0e0e]' : 'bg-gray-50'}`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-black italic mb-8 md:mb-10 tracking-tighter">serviços_</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {barbearia?.servicos?.map((s, i) => (
              <div key={i} className={`p-6 md:p-8 rounded-3xl border transition-all ${isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-lg'}`}>
                <h3 className="font-black italic text-lg md:text-xl uppercase tracking-tighter">{s.nome}</h3>
                <div className="flex items-baseline gap-2 my-2">
                  <span className="text-2xl font-bold" style={{ color: brandYellow }}>R$ {s.valor?.toFixed(2)}</span>
                  <span className="text-[10px] opacity-50 uppercase font-bold tracking-widest">{s.tempo} min</span>
                </div>
                <button 
                  onClick={handleAgendarClick} 
                  className="w-full mt-4 py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-colors hover:bg-yellow-500/10" 
                  style={{ borderColor: `${brandYellow}50`, color: brandYellow }}
                >
                  selecionar <IoChevronForwardOutline />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Especialistas */}
      <section className={`py-12 md:py-20 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-2xl md:text-3xl font-black italic mb-8 md:mb-10 tracking-tighter">especialistas_</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {barbeiros?.map((b, i) => (
              <div key={i} className="group cursor-pointer text-center" onClick={handleAgendarClick}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-[1.5rem] md:rounded-[2rem] mb-4 border border-white/5 bg-neutral-900 flex items-center justify-center shadow-xl">
                  <img 
                    src={b.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.nome)}&background=1a1a1a&color=EAB308`} 
                    className="w-full h-full object-cover transition-transform duration-700 grayscale group-hover:grayscale-0" 
                    alt={b.nome} 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-4">
                    <p className="text-[8px] font-black uppercase tracking-widest text-white">agendar com {b.nome.split(' ')[0]}</p>
                  </div>
                </div>
                <h4 className="font-bold italic uppercase text-xs md:text-sm tracking-tighter">{b.nome}</h4>
                <p className="text-[8px] md:text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">{b.especialidade || 'Master Barber'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Responsivo */}
      <footer className="bg-[#050505] text-white pt-16 pb-10 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
            <div className="flex-1 space-y-10 order-2 lg:order-1">
              <h3 className="font-black italic text-3xl md:text-4xl lowercase tracking-tighter" style={{ color: brandYellow }}>{barbearia?.nome}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-8">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40">Localização</p>
                  <p className="text-sm mt-1 opacity-80 max-w-xs mx-auto lg:mx-0">{barbearia?.endereco || "Endereço não informado"}</p>
                </div>
                <a href={`https://wa.me/${whatsappLimpo}`} target="_blank" rel="noopener noreferrer" className="block group">
                  <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40 group-hover:text-emerald-500 transition-colors">WhatsApp</p>
                  <p className="text-sm mt-1 font-bold tracking-[2px]">{formatarExibicaoZap(barbearia?.whatsapp)}</p>
                </a>
              </div>
            </div>
            
            <div className="flex-1 order-1 lg:order-2 w-full">
              <div className="h-[200px] md:h-[400px] w-full rounded-[2rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 opacity-60">
                <iframe 
                  title="Localização" 
                  width="100%" height="100%" frameBorder="0" 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(barbearia?.endereco || 'Brasil')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                  style={{ filter: isDarkMode ? 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' : 'none' }}
                ></iframe>
              </div>
            </div>
          </div>

          <div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-black uppercase tracking-[4px] opacity-20">
            <p>© {new Date().getFullYear()} {barbearia?.nome}</p>
            <p>Powered by BarberFlow</p>
          </div>
        </div>
      </footer>
    </div>
  );
}