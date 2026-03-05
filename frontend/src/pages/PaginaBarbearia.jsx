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
  IoLogoWhatsapp, IoLogoInstagram, IoMailOutline
} from 'react-icons/io5';

// Importações do Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';

// Estilos do Swiper
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/effect-fade';

const brandYellow = '#EAB308'; 

export default function PaginaBarbearia() {
  const { idBarbearia } = useParams(); 
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

  const handleLoginClick = () => {
    if (idBarbearia) {
      navigate(`/select-profile?barbearia=${idBarbearia}`);
    } else {
      navigate('/select-profile');
    }
  };

  const handleAgendarClick = () => {
    if (idBarbearia && idBarbearia.length === 24) {
      navigate(`/agendar/${idBarbearia}`);
    }
  };

  useEffect(() => {
    async function fetchData() {
      if (!idBarbearia || idBarbearia.length !== 24) {
        setLoading(false);
        setError(true);
        return;
      }

      try {
        setLoading(true);
        setError(false);

        const dadosBarbearia = await api.get(`/barbearias/${idBarbearia}`);
        
        if (!dadosBarbearia) {
          setError(true);
        } else {
          setBarbearia(dadosBarbearia);

          try {
            const listaBarbeiros = await api.get('/barbeiros');
            const lista = Array.isArray(listaBarbeiros) ? listaBarbeiros : (listaBarbeiros.data || []);
            
            const filtrados = lista.filter(b => {
              const fk = b.fk_barbearia?._id || b.fk_barbearia;
              return String(fk) === String(idBarbearia);
            });
            setBarbeiros(filtrados);
          } catch (errBar) {
            console.error("Erro ao carregar barbeiros:", errBar);
          }
        }
      } catch (err) {
        console.error("Erro na requisição:", err.message);
        setError(true);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [idBarbearia]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${brandYellow}20`, borderTopColor: brandYellow }} />
    </div>
  );

  if (error || !barbearia) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 text-center">
      <h1 className="text-6xl font-black italic lowercase tracking-tighter mb-4">404.</h1>
      <p className="text-gray-400 max-w-md mb-8 italic">Barbearia não encontrada ou link inválido.</p>
      <button onClick={() => navigate('/')} className="px-8 py-3 rounded-full font-black uppercase text-xs tracking-widest bg-white text-black hover:bg-yellow-500 transition-colors">
        voltar ao início
      </button>
    </div>
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'}`}>
      
      {/* BOTÃO LOGIN */}
      <button 
        onClick={handleLoginClick}
        className="fixed top-8 right-8 z-[100] p-4 rounded-full transition-all duration-300 border backdrop-blur-md shadow-2xl hover:scale-110 active:scale-90 group"
        style={{ backgroundColor: `${brandYellow}ee`, borderColor: 'rgba(255,255,255,0.3)', boxShadow: `0 10px 25px ${brandYellow}40` }}
      >
        <IoLogInOutline size={26} color="#000" className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* HERO SECTION */}
      <section className="relative h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <Swiper
            modules={[Autoplay, EffectFade]}
            effect="fade"
            autoplay={{ delay: 5000, disableOnInteraction: false }}
            loop={true}
            className="w-full h-full"
          >
            {fotosLugar.map((foto, i) => (
              <SwiperSlide key={i}>
                <div className="relative w-full h-full">
                  <img src={foto} className="w-full h-full object-cover" alt={`Slide ${i}`} />
                  <div className="absolute inset-0 bg-black/60" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
        
        <div className="relative z-10 text-center space-y-4 px-6 animate-in fade-in zoom-in duration-1000">
          <h1 className="text-6xl md:text-9xl font-black italic lowercase tracking-tighter leading-none text-white">
            {barbearia?.nome}.<span style={{ color: brandYellow }}>flow</span>
          </h1>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] opacity-90 text-white">
            estética masculina premium • {barbearia?.endereco?.cidade || 'recife'}, {barbearia?.endereco?.estado || 'pe'}
          </p>
          <div className="pt-8">
            <button 
              onClick={handleAgendarClick}
              className="px-10 py-5 text-black font-black uppercase text-xs tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl"
              style={{ backgroundColor: brandYellow, boxShadow: `0 0 30px ${brandYellow}40` }}
            >
              agendar experiência
            </button>
          </div>
        </div>
      </section>

      {/* SERVIÇOS */}
      <section className={`py-24 ${isDarkMode ? 'bg-[#0e0e0e]' : 'bg-gray-50'}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16 text-center lg:text-left">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: brandYellow }}>menu</p>
            <h2 className="text-5xl font-black italic lowercase tracking-tighter">nossos <span style={{ color: brandYellow }}>serviços</span></h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {(barbearia?.servicos || []).map((s, i) => (
              <div key={i} className={`p-8 rounded-[2.5rem] border-2 transition-all hover:scale-[1.02] ${isDarkMode ? 'bg-[#121212] border-white/5 hover:border-[#e6b32a]' : 'bg-white border-gray-100 shadow-xl hover:border-black'}`}>
                <p className="font-black italic text-xl mb-1">{s.nome}</p>
                <p className="text-2xl font-bold mb-4" style={{ color: brandYellow }}>R$ {s.valor?.toFixed(2)}</p>
                <div className="flex items-center gap-2 mb-6 opacity-60 text-xs font-bold uppercase tracking-widest">
                  <span>{s.tempo} min</span>
                </div>
                <button 
                  onClick={handleAgendarClick}
                  className="w-full py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group transition-all" 
                  style={{ border: `1px solid ${brandYellow}40`, color: brandYellow }}
                >
                  selecionar <IoChevronForwardOutline className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* BARBEIROS COM ELOGIOS */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: brandYellow }}>especialistas</p>
          <h2 className="text-5xl font-black italic lowercase tracking-tighter">nossa <span style={{ color: brandYellow }}>equipe</span></h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
          {barbeiros.map((b, i) => (
            <div key={i} className={`group flex flex-col sm:flex-row items-center gap-8 p-8 rounded-[3rem] border transition-all duration-500 ${isDarkMode ? 'bg-[#111] border-white/5 hover:bg-[#161616]' : 'bg-white border-gray-100 shadow-2xl hover:border-gray-200'}`}>
              <div className="relative w-40 h-40 flex-shrink-0">
                <img src={b.foto || `https://i.pravatar.cc/400?u=${b._id}`} className="w-full h-full object-cover rounded-[2rem] grayscale group-hover:grayscale-0 transition-all duration-700" alt={b.nome} />
                <div className="absolute -bottom-3 -right-3 w-12 h-12 rounded-2xl flex items-center justify-center bg-[#e6b32a] text-black shadow-lg">
                  <IoStar size={20} />
                </div>
              </div>
              <div className="flex-1 space-y-4 text-center sm:text-left">
                <div>
                  <h3 className="text-3xl font-black italic lowercase tracking-tighter">{b.nome}</h3>
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60" style={{ color: brandYellow }}>{b.especialidade || 'barbeiro master'}</p>
                </div>
                <div className={`p-4 rounded-2xl border-l-4 italic text-sm ${isDarkMode ? 'bg-white/5 border-[#e6b32a]' : 'bg-gray-50 border-black'}`}>
                  <IoChatbubbleEllipsesOutline size={16} className="mb-2 opacity-40" />
                  <p className="leading-relaxed opacity-80">"{elogiosMock[i % elogiosMock.length]}"</p>
                </div>
                <button onClick={handleAgendarClick} className="text-[10px] font-black uppercase tracking-[2px] underline decoration-[#e6b32a] decoration-2 underline-offset-4 hover:opacity-70 transition-opacity">
                  ver agenda de {b.nome.split(' ')[0]}
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER - ATUALIZADO COM WHATSAPP E INSTAGRAM */}
      <footer className={`pt-24 pb-12 transition-all ${isDarkMode ? 'bg-[#050505]' : 'bg-[#121212] text-white'}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20">
            
            {/* Esquerda: Branding e Contatos */}
            <div className="space-y-12 flex flex-col items-center lg:items-start">
              <h1 className="text-5xl font-black italic lowercase tracking-tighter">barber.<span style={{ color: brandYellow }}>flow</span></h1>
              
              <div className="space-y-6 w-full max-w-md">
                {/* Localização */}
                <div className="flex items-center gap-6 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center text-black flex-shrink-0" style={{ backgroundColor: brandYellow }}>
                    <IoLocationOutline size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">localização</p>
                    <p className="text-base font-bold italic leading-tight">{barbearia?.endereco?.logradouro || 'Endereço não informado'}</p>
                  </div>
                </div>

                {/* WhatsApp */}
                <a href={`https://wa.me/55${barbearia?.contato?.whatsapp || ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#25D366] text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IoLogoWhatsapp size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">fale conosco</p>
                    <p className="text-base font-bold italic leading-tight">{barbearia?.contato?.whatsapp || '(81) 99999-9999'}</p>
                  </div>
                </a>

                {/* Instagram */}
                <a href={`https://instagram.com/${barbearia?.contato?.instagram || ''}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-6 p-5 rounded-[2rem] bg-white/5 border border-white/5 hover:bg-white/10 transition-colors group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 text-white flex-shrink-0 group-hover:scale-110 transition-transform">
                    <IoLogoInstagram size={24} />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase opacity-40 tracking-widest">nos acompanhe</p>
                    <p className="text-base font-bold italic leading-tight">@{barbearia?.contato?.instagram || barbearia?.nome?.toLowerCase()}</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Direita: Mapa */}
            <div className="h-[400px] rounded-[3.5rem] overflow-hidden border-8 border-white/5 grayscale brightness-75 hover:grayscale-0 transition-all duration-700">
              <iframe title="Mapa" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.39058514239!2d-34.9035227!3d-8.0615823!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOMKwMDMnNDEuNyJTIDM0wrA1NCcxMi43Ilc!5e0!3m2!1spt-BR!2sbr!4v1620000000000!5m2!1spt-BR!2sbr" width="100%" height="100%" style={{ border: 0 }} allowFullScreen />
            </div>
          </div>

          <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[9px] font-black uppercase tracking-[5px] opacity-20 text-center">© 2026 BarberFlow Technology</p>
            <div className="flex gap-6 opacity-30 text-[9px] font-black uppercase tracking-[2px]">
              <span className="hover:opacity-100 cursor-pointer">Termos</span>
              <span className="hover:opacity-100 cursor-pointer">Privacidade</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}