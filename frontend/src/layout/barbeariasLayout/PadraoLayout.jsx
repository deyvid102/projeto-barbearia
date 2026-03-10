import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/ThemeContext';
import { 
  IoLocationOutline, IoChevronForwardOutline, 
  IoLogInOutline, IoLogoWhatsapp, IoLogoInstagram 
} from 'react-icons/io5';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

import 'swiper/css';
import 'swiper/css/effect-fade';

import barbearia1 from '../../assets/barbearia1.jpg';
import barbearia2 from '../../assets/barbearia2.jpg';
import barbearia3 from '../../assets/barbearia3.jpg';

const brandYellow = '#EAB308';

export default function PadraoLayout({ barbearia, barbeiros }) {
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
    return val;
  };

  const whatsappLimpo = barbearia?.whatsapp?.replace(/\D/g, '');

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'}`}>
      
      {/* Botão de Login Flutuante */}
      <button 
        onClick={handleLoginClick}
        className="fixed top-4 right-4 z-[100] p-3 rounded-full transition-all border backdrop-blur-md shadow-2xl hover:scale-110 active:scale-90"
        style={{ backgroundColor: `${brandYellow}ee`, borderColor: 'rgba(255,255,255,0.3)' }}
      >
        <IoLogInOutline size={22} color="#000" />
      </button>

      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
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
          <h1 className="font-black italic lowercase tracking-tighter leading-[0.9] text-white text-6xl md:text-9xl">
            {barbearia?.nome}
          </h1>
          <button 
            onClick={handleAgendarClick} 
            className="px-10 py-4 text-black font-black uppercase text-xs tracking-widest rounded-full hover:scale-105 transition-all mt-6" 
            style={{ backgroundColor: brandYellow }}
          >
            agendar experiência
          </button>
        </div>
      </section>

      {/* Serviços */}
      <section className={`py-20 ${isDarkMode ? 'bg-[#0e0e0e]' : 'bg-gray-50'}`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-black italic mb-10">serviços_</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barbearia?.servicos?.map((s, i) => (
              <div key={i} className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-lg'}`}>
                <h3 className="font-black italic text-xl">{s.nome}</h3>
                <p className="text-2xl font-bold my-2" style={{ color: brandYellow }}>R$ {s.valor?.toFixed(2)}</p>
                <p className="text-[10px] opacity-50 uppercase font-bold mb-6">{s.tempo} minutos</p>
                <button onClick={handleAgendarClick} className="w-full py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2" style={{ borderColor: `${brandYellow}50`, color: brandYellow }}>
                  selecionar <IoChevronForwardOutline />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Especialistas (Seção Corrigida) */}
      <section className={`py-20 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-black italic mb-10">especialistas_</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {barbeiros?.map((b, i) => (
              <div key={i} className="group cursor-pointer text-center" onClick={handleAgendarClick}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl mb-4 border border-white/5 bg-neutral-900 flex items-center justify-center">
                  {b.foto ? (
                    <img 
                      src={b.foto} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 grayscale group-hover:grayscale-0" 
                      alt={b.nome} 
                      onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&h=600&auto=format&fit=crop'; }}
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <span className="text-5xl font-black italic opacity-20 text-white">
                        {b.nome.charAt(0)}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center p-6">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white">agendar com {b.nome.split(' ')[0]}</p>
                  </div>
                </div>
                <h4 className="font-bold italic uppercase text-sm tracking-tighter">{b.nome}</h4>
                <p className="text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">{b.especialidade || 'Master Barber'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#050505] text-white pt-16 pb-10 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
            <div className="flex-1 space-y-10 order-2 lg:order-1 text-center lg:text-left">
              <div>
                <h3 className="text-[#e6b32a] font-black italic text-3xl mb-8 lowercase tracking-tighter">{barbearia?.nome}</h3>
                <div className="space-y-8">
                  <div className="block group">
                    <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40">Localização</p>
                    <p className="text-sm mt-1 opacity-80">{barbearia?.endereco}</p>
                  </div>
                  <a href={`https://wa.me/${whatsappLimpo}`} target="_blank" rel="noopener noreferrer" className="block group">
                    <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40 group-hover:text-emerald-500 transition-colors">WhatsApp</p>
                    <p className="text-sm mt-1 font-bold tracking-[2px]">{formatarExibicaoZap(barbearia?.whatsapp)}</p>
                  </a>
                  <div className="block group">
                    <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40">Social</p>
                    <p className="text-sm mt-1 lowercase font-black tracking-wider inline-block">@{barbearia?.instagram?.replace('@', '') || 'barberflow'}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2 w-full">
              <div className="h-[250px] md:h-[400px] w-full rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden border border-white/10 grayscale opacity-40 hover:grayscale-0 transition-all duration-1000">
                <iframe 
                  title="Localização" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(barbearia?.endereco || 'Brasil')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                  style={{ filter: 'invert(90%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
                ></iframe>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-[8px] font-black uppercase tracking-[4px] opacity-20">
            <p>© {new Date().getFullYear()} {barbearia?.nome}</p>
            <p>Powered by BarberFlow</p>
          </div>
        </div>
      </footer>
    </div>
  );
}