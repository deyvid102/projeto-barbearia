import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/Api.js';
import { useTheme } from '../components/ThemeContext';

// Importação das imagens .jpg locais
import barbearia1 from '../assets/barbearia1.jpg';
import barbearia2 from '../assets/barbearia2.jpg';
import barbearia3 from '../assets/barbearia3.jpg';

// Ícones
import { 
  IoStar, IoLocationOutline, IoChevronForwardOutline,
  IoLogInOutline, IoChatbubbleEllipsesOutline,
  IoLogoWhatsapp, IoLogoInstagram
} from 'react-icons/io5';

// Importações do Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, EffectFade } from 'swiper/modules';

// Estilos do Swiper
import 'swiper/css';
import 'swiper/css/effect-fade';

const brandYellow = '#EAB308'; 

export default function PaginaBarbearia() {
  const { nomeBarbearia } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbearia, setBarbearia] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const elogiosMock = [
    "O melhor degradê da região, recomendo demais!",
    "Atendimento impecável e muita técnica na tesoura.",
    "Ambiente sensacional e o profissional é nota 10.",
    "Sempre pontual e o resultado final é surpreendente."
  ];

  const fotosLugar = [barbearia1, barbearia2, barbearia3];

  const handleLoginClick = () => navigate('/barbeiro/login');
  const handleAgendarClick = () => nomeBarbearia && navigate(`/agendar/${nomeBarbearia}`);

  useEffect(() => {
    async function fetchData() {
      if (!nomeBarbearia) { setLoading(false); setError(true); return; }
      try {
        setLoading(true);
        const res = await api.get(`/barbearias/perfil/${nomeBarbearia}`);
        const dadosB = res.data || res;
        
        if (!dadosB) {
          setError(true);
        } else {
          setBarbearia(dadosB);
          const resBarbeiros = await api.get('/barbeiros');
          const lista = Array.isArray(resBarbeiros) ? resBarbeiros : (resBarbeiros.data || []);
          setBarbeiros(lista.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === String(dadosB._id)));
        }
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [nomeBarbearia]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${brandYellow}20`, borderTopColor: brandYellow }} />
    </div>
  );

  if (error || !barbearia) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 text-center">
      <h1 className="text-4xl font-black italic mb-4">404.</h1>
      <p className="text-gray-400 mb-8">Barbearia não encontrada.</p>
      <button onClick={() => navigate('/')} className="px-8 py-3 rounded-full font-black uppercase text-xs bg-white text-black">voltar ao início</button>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'}`}>
      
      {/* Botão Login Profissional */}
      <button 
        onClick={handleLoginClick}
        className="fixed top-4 right-4 md:top-8 md:right-8 z-[100] p-3 md:p-4 rounded-full transition-all border backdrop-blur-md shadow-2xl hover:scale-110 active:scale-90"
        style={{ backgroundColor: `${brandYellow}ee`, borderColor: 'rgba(255,255,255,0.3)' }}
      >
        <IoLogInOutline size={22} color="#000" className="md:w-[26px] md:h-[26px]" />
      </button>

      {/* Hero Section */}
      <section className="relative h-[85vh] md:h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Swiper modules={[Autoplay, EffectFade]} effect="fade" autoplay={{ delay: 5000 }} loop={true} className="w-full h-full">
            {fotosLugar.map((foto, i) => (
              <SwiperSlide key={i}>
                <div className="relative w-full h-full">
                  <img src={foto} className="w-full h-full object-cover" alt="Ambiente" />
                  <div className="absolute inset-0 bg-black/70" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        <div className="relative z-10 text-center space-y-4 px-6 max-w-5xl animate-in fade-in zoom-in duration-1000">
          {/* Nome da Barbearia Dinâmico e Responsivo */}
          <h1 className="font-black italic lowercase tracking-tighter leading-[0.9] text-white break-words
                         text-4xl sm:text-6xl md:text-7xl lg:text-9xl">
            {barbearia?.nome}
          </h1>
          
          <p className="text-[9px] md:text-xs font-black uppercase tracking-[0.3em] md:tracking-[0.5em] opacity-90 text-white">
            estética masculina premium • {barbearia?.endereco?.cidade || 'Recife'}, {barbearia?.endereco?.estado || 'PE'}
          </p>
          <div className="pt-6">
            <button 
              onClick={handleAgendarClick}
              className="w-full md:w-auto px-8 md:px-12 py-4 md:py-5 text-black font-black uppercase text-[10px] md:text-xs tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl"
              style={{ backgroundColor: brandYellow, boxShadow: `0 0 30px ${brandYellow}40` }}
            >
              agendar experiência
            </button>
          </div>
        </div>
      </section>

      {/* Serviços */}
      <section className={`py-16 md:py-24 ${isDarkMode ? 'bg-[#0e0e0e]' : 'bg-gray-50'}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-10 md:mb-16 text-center lg:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: brandYellow }}>menu</p>
            <h2 className="text-4xl md:text-5xl font-black italic lowercase tracking-tighter">nossos <span style={{ color: brandYellow }}>serviços</span></h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {(barbearia?.servicos || []).map((s, i) => (
              <div key={i} className={`p-6 md:p-8 rounded-[2rem] border-2 transition-all ${isDarkMode ? 'bg-[#121212] border-white/5 hover:border-[#e6b32a]' : 'bg-white border-gray-100 shadow-xl hover:border-black'}`}>
                <p className="font-black italic text-lg md:text-xl mb-1">{s.nome}</p>
                <p className="text-xl md:text-2xl font-bold mb-3 md:mb-4" style={{ color: brandYellow }}>R$ {s.valor?.toFixed(2)}</p>
                <div className="flex items-center gap-2 mb-5 md:mb-6 opacity-60 text-[9px] md:text-xs font-bold uppercase tracking-widest">
                  <span>{s.tempo} min</span>
                </div>
                <button 
                  onClick={handleAgendarClick}
                  className="w-full py-3 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border transition-all" 
                  style={{ borderColor: `${brandYellow}40`, color: brandYellow }}
                >
                  selecionar <IoChevronForwardOutline />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Equipe */}
      <section className="max-w-[1400px] mx-auto px-6 py-16 md:py-24">
        <div className="mb-12 md:mb-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: brandYellow }}>especialistas</p>
          <h2 className="text-4xl md:text-5xl font-black italic lowercase tracking-tighter">nossa <span style={{ color: brandYellow }}>equipe</span></h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-12">
          {barbeiros.map((b, i) => (
            <div key={i} className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 p-6 md:p-8 rounded-[2rem] border transition-all ${isDarkMode ? 'bg-[#111] border-white/5 hover:bg-[#161616]' : 'bg-white border-gray-100 shadow-2xl hover:border-gray-200'}`}>
              <div className="relative w-32 h-32 md:w-40 md:h-40 flex-shrink-0">
                <img src={b.foto || `https://i.pravatar.cc/400?u=${b._id}`} className="w-full h-full object-cover rounded-3xl grayscale hover:grayscale-0 transition-all duration-700" alt={b.nome} />
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl flex items-center justify-center bg-[#e6b32a] text-black shadow-lg">
                  <IoStar size={18} />
                </div>
              </div>
              <div className="flex-1 space-y-3 text-center md:text-left w-full">
                <div>
                  <h3 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter">{b.nome}</h3>
                  <p className="text-[9px] md:text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: brandYellow }}>{b.especialidade || 'barbeiro master'}</p>
                </div>
                <div className={`p-4 rounded-xl border-l-4 italic text-xs md:text-sm ${isDarkMode ? 'bg-white/5 border-[#e6b32a]' : 'bg-gray-50 border-black'}`}>
                  <p className="leading-relaxed opacity-80">"{elogiosMock[i % elogiosMock.length]}"</p>
                </div>
                <button onClick={handleAgendarClick} className="text-[9px] md:text-[10px] font-black uppercase underline decoration-[#e6b32a] decoration-2 underline-offset-4">
                  ver agenda de {b.nome.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className={`pt-16 md:pt-24 pb-8 transition-all ${isDarkMode ? 'bg-[#050505]' : 'bg-[#121212] text-white'}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
            <div className="space-y-8 flex flex-col items-center lg:items-start text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-black italic lowercase tracking-tighter">{barbearia?.nome}</h1>
              <div className="space-y-4 w-full max-w-md">
                <div className="flex flex-row items-center gap-4 p-4 rounded-[1.5rem] bg-white/5 border border-white/5">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-black flex-shrink-0" style={{ backgroundColor: brandYellow }}>
                    <IoLocationOutline size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] md:text-[9px] font-black uppercase opacity-40">localização</p>
                    <p className="text-sm md:text-base font-bold italic leading-tight">{barbearia?.endereco?.logradouro}</p>
                  </div>
                </div>
                <a href={`https://wa.me/55${barbearia?.contato?.whatsapp || ''}`} className="flex flex-row items-center gap-4 p-4 rounded-[1.5rem] bg-white/5 border border-white/5 group">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#25D366] text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IoLogoWhatsapp size={20} />
                  </div>
                  <div className="text-left">
                    <p className="text-[8px] md:text-[9px] font-black uppercase opacity-40">fale conosco</p>
                    <p className="text-sm md:text-base font-bold italic leading-tight">{barbearia?.contato?.whatsapp || '(81) 99999-9999'}</p>
                  </div>
                </a>
              </div>
            </div>
            <div className="h-[300px] rounded-[2rem] overflow-hidden border-4 border-white/5 grayscale brightness-75">
               <iframe title="Mapa" src={`https://maps.google.com/maps?q=${encodeURIComponent(barbearia?.endereco?.logradouro || 'Recife')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} width="100%" height="100%" style={{ border: 0 }} allowFullScreen />
            </div>
          </div>
          <div className="mt-12 pt-8 border-t border-white/5 flex justify-center items-center">
            <p className="text-[8px] font-black uppercase tracking-[3px] opacity-20">© 2026 BarberFlow Technology</p>
          </div>
        </div>
      </footer>
    </div>
  );
}