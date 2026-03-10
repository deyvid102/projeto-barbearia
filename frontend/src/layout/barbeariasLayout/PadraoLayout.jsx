import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/ThemeContext'; // Ajuste o caminho se necessário
import { 
  IoStar, IoLocationOutline, IoChevronForwardOutline, 
  IoLogInOutline, IoLogoWhatsapp 
} from 'react-icons/io5';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

// Estilos do Swiper
import 'swiper/css';
import 'swiper/css/effect-fade';

// Imagens de fallback caso o banco não tenha fotos
import barbearia1 from '../../assets/barbearia1.jpg';
import barbearia2 from '../../assets/barbearia2.jpg';
import barbearia3 from '../../assets/barbearia3.jpg';

const brandYellow = '#EAB308';

export default function PadraoLayout({ barbearia, barbeiros }) {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();

  const handleLoginClick = () => navigate('/barbeiro/login');
  const handleAgendarClick = () => navigate(`/agendar/${barbearia?.nome?.toLowerCase().replace(/\s+/g, '-')}`);

  const fotosExibicao = barbearia?.fotos?.length > 0 ? barbearia.fotos : [barbearia1, barbearia2, barbearia3];

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'}`}>
      
      {/* Botão Login Profissional */}
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
          <p className="text-[10px] font-black uppercase tracking-[0.4em] text-white opacity-80">
            Layout Padrão • {barbearia?.endereco || 'Localização não definida'}
          </p>
          <div className="pt-6">
            <button 
              onClick={handleAgendarClick}
              className="px-10 py-4 text-black font-black uppercase text-xs tracking-widest rounded-full hover:scale-105 transition-all"
              style={{ backgroundColor: brandYellow }}
            >
              agendar experiência
            </button>
          </div>
        </div>
      </section>

      {/* Seção de Serviços */}
      <section className={`py-20 ${isDarkMode ? 'bg-[#0e0e0e]' : 'bg-gray-50'}`}>
        <div className="max-w-[1200px] mx-auto px-6">
          <h2 className="text-3xl font-black italic mb-10">serviços_</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {barbearia?.servicos?.map((s, i) => (
              <div key={i} className={`p-8 rounded-3xl border ${isDarkMode ? 'bg-[#121212] border-white/5' : 'bg-white border-gray-100 shadow-lg'}`}>
                <h3 className="font-black italic text-xl">{s.nome}</h3>
                <p className="text-2xl font-bold my-2" style={{ color: brandYellow }}>R$ {s.valor?.toFixed(2)}</p>
                <p className="text-[10px] opacity-50 uppercase font-bold mb-6">{s.tempo} minutos</p>
                <button 
                  onClick={handleAgendarClick}
                  className="w-full py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                  style={{ borderColor: `${brandYellow}50`, color: brandYellow }}
                >
                  selecionar <IoChevronForwardOutline />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Rodapé Simples */}
      <footer className="py-10 text-center opacity-30">
        <p className="text-[8px] font-black uppercase tracking-[4px]">Powered by BarberFlow • Padrão</p>
      </footer>
    </div>
  );
}