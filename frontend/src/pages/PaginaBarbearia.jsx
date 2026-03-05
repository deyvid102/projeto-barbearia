import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../services/Api.js';
import { useTheme } from '../components/ThemeContext';

// Importação das imagens .jpeg locais
import barbearia1 from '../assets/barbearia1.jpg';
import barbearia2 from '../assets/barbearia2.jpg';
import barbearia3 from '../assets/barbearia3.jpg';
import fotoFundo from '../assets/fundo.jpg';

// Ícones
import { 
  IoStar, IoLocationOutline, IoLogoWhatsapp, 
  IoTimeOutline, IoChevronForwardOutline,
  IoLogInOutline // Novo ícone de porta para o login
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

  const fotosLugar = [barbearia1, barbearia2, barbearia3];

  const servicosExemplo = [
    { nome: "corte clássico", preco: "r$ 50", desc: "tesoura e máquina, finalizado com pomada premium." },
    { nome: "barba premium", preco: "r$ 40", desc: "toalha quente, barboterapia e alinhamento com navalha." },
    { nome: "cabelo & barba", preco: "r$ 80", desc: "o combo completo para renovar seu estilo." },
    { nome: "pigmentação", preco: "r$ 30", desc: "disfarce de falhas e realce do contorno da barba/cabelo." },
  ];

  useEffect(() => {
    async function fetchData() {
      try {
        const [resBeb, resBar] = await Promise.all([
          api.get(`/barbearias/${idBarbearia}`),
          api.get('/barbeiros')
        ]);
        setBarbearia(resBeb.data || resBeb);
        const lista = resBar.data || resBar || [];
        setBarbeiros(lista.filter(b => String(b.fk_barbearia?._id || b.fk_barbearia) === String(idBarbearia)));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [idBarbearia]);

  const swiperStyle = {
    '--swiper-navigation-color': brandYellow,
    '--swiper-pagination-color': brandYellow,
    '--swiper-navigation-size': '25px',
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
      <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${brandYellow}20`, borderTopColor: brandYellow }} />
    </div>
  );

  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'}`}>
      
      {/* BOTÃO LOGIN (ÍCONE DE PORTA) */}
      <button 
        onClick={() => navigate('/select-profile')}
        className="fixed top-8 right-8 z-[100] p-4 rounded-full transition-all duration-300 border backdrop-blur-md shadow-2xl hover:scale-110 active:scale-90 group"
        title="Entrar"
        style={{ 
          backgroundColor: `${brandYellow}ee`, 
          borderColor: 'rgba(255,255,255,0.3)',
          boxShadow: `0 10px 25px ${brandYellow}40`
        }}
      >
        <IoLogInOutline size={26} color="#000" className="group-hover:translate-x-0.5 transition-transform" />
      </button>

      {/* 1. HERO SECTION */}
      <section className="relative h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src={fotoFundo} 
            className="w-full h-full object-cover blur-sm scale-110" 
            alt="Fundo Barbearia"
          />
          <div className="absolute inset-0 bg-black/70" />
        </div>
        
        <div className="relative z-10 text-center space-y-4 px-6">
          <h1 className="text-6xl md:text-9xl font-black italic lowercase tracking-tighter leading-none text-white">
            {barbearia?.nome || 'barber'}.<span style={{ color: brandYellow }}>flow</span>
          </h1>
          <p className="text-[10px] md:text-xs font-black uppercase tracking-[0.5em] opacity-90 text-white">
            estética masculina premium • recife, pe
          </p>
          <div className="pt-8">
            <button 
              className="px-10 py-5 text-black font-black uppercase text-xs tracking-widest rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl"
              style={{ backgroundColor: brandYellow, boxShadow: `0 0 30px ${brandYellow}40` }}
            >
              agendar experiência
            </button>
          </div>
        </div>
      </section>

      {/* 2. NOSSO ESPAÇO */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="mb-12 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: brandYellow }}>o ambiente</p>
          <h2 className="text-5xl font-black italic lowercase tracking-tighter">conheça nosso <span style={{ color: brandYellow }}>espaço</span></h2>
        </div>

        <div className="relative rounded-[3rem] overflow-hidden border border-white/10 shadow-2xl bg-[#111]">
          <Swiper
            modules={[Navigation, Pagination, Autoplay, EffectFade]}
            effect="fade"
            navigation={true}
            pagination={{ clickable: true }}
            autoplay={{ delay: 4000 }}
            className="w-full h-[400px] md:h-[650px]"
            style={swiperStyle}
          >
            {fotosLugar.map((foto, i) => (
              <SwiperSlide key={i} className="flex items-center justify-center bg-black">
                <img src={foto} alt={`Barbearia ${i+1}`} className="w-full h-full object-cover" />
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </section>

      {/* 3. SERVIÇOS - CENTRALIZADO */}
      <section className={`py-24 ${isDarkMode ? 'bg-[#111]' : 'bg-gray-50'}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="mb-16 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: brandYellow }}>menu de serviços</p>
            <h2 className="text-4xl font-black italic lowercase tracking-tighter">o que <span style={{ color: brandYellow }}>fazemos</span></h2>
          </div>

          <div className="relative pb-16">
            <Swiper
              modules={[Navigation, Pagination]}
              spaceBetween={30}
              slidesPerView={1}
              navigation={true}
              pagination={{ clickable: true }}
              breakpoints={{
                768: { slidesPerView: 2 },
                1024: { slidesPerView: 3 },
              }}
              style={swiperStyle}
              className="px-4"
            >
              {servicosExemplo.map((s, i) => (
                <SwiperSlide key={i}>
                  <div className={`p-10 h-[320px] rounded-[3rem] border-2 flex flex-col justify-between transition-all hover:scale-[1.02] mx-auto ${isDarkMode ? 'border-white/5 bg-[#0a0a0a]' : 'border-gray-200 bg-white shadow-xl'}`}>
                    <div className="text-center">
                      <div className="flex flex-col items-center gap-2 mb-6">
                        <span className="font-black italic lowercase text-3xl tracking-tighter leading-tight">{s.nome}</span>
                        <span className="font-black text-2xl" style={{ color: brandYellow }}>{s.preco}</span>
                      </div>
                      <p className={`text-sm italic leading-relaxed opacity-70 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>{s.desc}</p>
                    </div>
                    <button className="text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:translate-y-[-2px] transition-transform" style={{ color: brandYellow }}>
                      reservar agora <IoChevronForwardOutline size={16}/>
                    </button>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>
      </section>

      {/* 4. BARBEIROS */}
      <section className="max-w-[1400px] mx-auto px-6 py-24">
        <div className="mb-16 text-center">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] mb-2" style={{ color: brandYellow }}>nossos especialistas</p>
          <h2 className="text-5xl font-black italic lowercase tracking-tighter">mestres do <span style={{ color: brandYellow }}>estilo</span></h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {barbeiros.map((b, i) => (
            <div key={i} className="group relative">
              <div className={`relative aspect-[3/4] overflow-hidden rounded-[3rem] border-2 transition-all duration-500 ${isDarkMode ? 'border-white/5 group-hover:border-yellow-500/50' : 'border-gray-200 group-hover:border-black shadow-lg'}`}>
                <img src={b.foto || `https://i.pravatar.cc/400?u=${b._id}`} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110" alt={b.nome} />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-80" />
                <div className="absolute bottom-10 left-8">
                  <p className="text-white font-black italic text-3xl lowercase tracking-tighter">{b.nome.split(' ')[0]}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: brandYellow }}>{b.especialidade || 'master barber'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. AVALIAÇÕES */}
      <section className={`py-24 border-t ${isDarkMode ? 'bg-[#0a0a0a] border-white/5' : 'bg-white border-gray-100'}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black italic lowercase tracking-tighter">o que dizem os <span style={{ color: brandYellow }}>clientes</span></h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((_, i) => (
              <div key={i} className={`p-10 rounded-[3rem] border-2 transition-all ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-gray-50 border-gray-100 shadow-sm'}`}>
                <div className="flex gap-1 mb-6 justify-center" style={{ color: brandYellow }}>
                  {[...Array(5)].map((_, i) => <IoStar key={i} size={16} />)}
                </div>
                <p className={`text-center text-base italic mb-8 leading-relaxed ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                  "o melhor atendimento que já tive em recife. ambiente impecável e o corte do barbeiro superou minhas expectativas."
                </p>
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-black text-xs" style={{ backgroundColor: `${brandYellow}20`, color: brandYellow }}>JS</div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest">joão silva</p>
                    <p className="text-[10px] opacity-50 uppercase font-bold">cliente vip</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className={`pt-24 pb-12 transition-all ${isDarkMode ? 'bg-[#050505]' : 'bg-[#121212] text-white'}`}>
        <div className="max-w-[1400px] mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 mb-24">
            <div className="space-y-12">
              <div className="text-center lg:text-left">
                <h1 className="text-5xl font-black italic lowercase tracking-tighter mb-4 text-white">barber.<span style={{ color: brandYellow }}>flow</span></h1>
                <p className="text-md opacity-60 max-w-sm mx-auto lg:mx-0 leading-relaxed italic text-white">elevando o conceito de estética masculina no coração de recife.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 justify-center lg:justify-start" style={{ color: brandYellow }}>
                    <IoTimeOutline size={22} />
                    <p className="text-xs font-black uppercase tracking-[0.2em]">horários</p>
                  </div>
                  <div className="text-xs space-y-2 opacity-80 font-bold uppercase tracking-wider text-white text-center lg:text-left">
                    <p>seg - sex 09h - 20h</p>
                    <p>sábado 08h - 18h</p>
                    <p style={{ color: brandYellow }}>domingo fechado</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 justify-center lg:justify-start" style={{ color: brandYellow }}>
                    <IoLogoWhatsapp size={22} />
                    <p className="text-xs font-black uppercase tracking-[0.2em]">contato</p>
                  </div>
                  <div className="text-xs space-y-2 opacity-80 font-bold uppercase tracking-wider text-white text-center lg:text-left">
                    <p>(81) 98888-7777</p>
                    <p>@barber.flow.recife</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/5 border border-white/5 group cursor-pointer hover:bg-white/10 transition-all max-w-md mx-auto lg:mx-0">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-black shrink-0" style={{ backgroundColor: brandYellow }}>
                  <IoLocationOutline size={28} />
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase opacity-40 tracking-widest text-white">onde estamos</p>
                  <p className="text-lg font-bold italic text-white">Shopping Boa Vista, Recife-PE</p>
                </div>
              </div>
            </div>

            <div className="relative rounded-[4rem] overflow-hidden h-[450px] border-4 border-white/5 shadow-2xl">
              <iframe 
                title="Mapa Local"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3950.413289043236!2d-34.891829624237!3d-8.0592965805175!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x7ab18bb4092b3f1%3A0xe7c8702c28646f90!2sShopping%20Boa%20Vista!5e0!3m2!1spt-BR!2sbr!4v1700000000000!5m2!1spt-BR!2sbr" 
                width="100%" height="100%" style={{ border: 0, filter: 'grayscale(1) invert(0.9) contrast(1.2) opacity(0.7)' }} 
                allowFullScreen loading="lazy" 
              />
            </div>
          </div>
          <div className="pt-12 border-t border-white/10 text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.4em] opacity-30 text-white">© 2026 barber flow group. recife - pe</p>
          </div>
        </div>
      </footer>
    </div>
  );
}