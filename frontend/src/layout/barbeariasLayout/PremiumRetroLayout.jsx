import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  IoTimeOutline, 
  IoLogInOutline, 
  IoEyeOutline, 
  IoEyeOffOutline, 
  IoArrowBackOutline 
} from 'react-icons/io5';

const retroGold = '#C5A059'; 
const retroDark = '#1a1a1a';
const retroCream = '#f4f1ea';

export default function PremiumRetroLayout({ 
  barbearia, 
  barbeiros,
  view = 'home',
  children, // Renderiza o conteúdo do NovoAgendamento
  email, setEmail,
  senha, setSenha,
  showPassword, setShowPassword,
  loadingLogin,
  handleLogin,
  handleVoltar
}) {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    const barbeariaPath = barbearia?.nome?.toLowerCase().replace(/\s+/g, '-');
    navigate(`/barbeiro/login/${barbeariaPath}`);
  };

  const handleAgendarClick = () => {
    const barbeariaPath = barbearia?.nome?.toLowerCase().replace(/\s+/g, '-');
    navigate(`/agendar/${barbeariaPath}`);
  };

  const formatarExibicaoZap = (val) => {
    if (!val) return "";
    const nums = val.replace(/\D/g, "");
    if (nums.length === 13) return `+${nums.substring(0, 2)} (${nums.substring(2, 4)}) ${nums.substring(4, 5)} ${nums.substring(5, 9)}-${nums.substring(9)}`;
    if (nums.length === 11) return `(${nums.substring(0, 2)}) ${nums.substring(2, 3)} ${nums.substring(3, 7)}-${nums.substring(7)}`;
    return val;
  };

  const whatsappLimpo = barbearia?.whatsapp?.replace(/\D/g, '');

  /* ==========================================================
     VIEW DE LOGIN (PREMIUM RETRO)
     ========================================================== */
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#f4f1ea] flex items-center justify-center font-serif p-6">
        <div className="w-full max-w-md border-[4px] border-double border-[#1a1a1a] p-1 bg-[#1a1a1a] shadow-2xl">
          <div className="bg-[#f4f1ea] p-10 border border-[#C5A059]">
            <div className="text-center mb-10">
              <p className="uppercase text-[9px] tracking-[4px] mb-2 text-[#1a1a1a]/60">Professional Access</p>
              <h2 className="text-4xl font-bold italic uppercase border-b-2 border-[#C5A059] inline-block pb-2 text-[#1a1a1a]">
                {barbearia?.nome || 'Barber'}
              </h2>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              <input 
                type="email" placeholder="EMAIL ADDRESS" required 
                className="w-full bg-transparent border-b-2 border-[#1a1a1a]/20 p-3 outline-none focus:border-[#C5A059] transition-all uppercase text-xs tracking-widest text-[#1a1a1a]"
                value={email} onChange={(e) => setEmail(e.target.value)}
              />
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} placeholder="PASSWORD" required 
                  className="w-full bg-transparent border-b-2 border-[#1a1a1a]/20 p-3 outline-none focus:border-[#C5A059] transition-all uppercase text-xs tracking-widest text-[#1a1a1a]"
                  value={senha} onChange={(e) => setSenha(e.target.value)}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-0 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40">
                  {showPassword ? <IoEyeOffOutline size={16}/> : <IoEyeOutline size={16}/>}
                </button>
              </div>
              <button className="w-full py-4 bg-[#1a1a1a] text-[#C5A059] font-bold uppercase text-[10px] tracking-[4px] hover:bg-[#C5A059] hover:text-[#1a1a1a] transition-all border border-[#C5A059]">
                {loadingLogin ? 'Verifying...' : 'Authorize Access'}
              </button>
            </form>

            {/* Botão de Voltar Refinado para Mobile */}
<button 
  type="button"
  onClick={handleVoltar} 
  className="mt-10 w-full py-3 flex items-center justify-center gap-2 group transition-all active:scale-95"
>
  <div className="flex items-center gap-2 px-4 py-2 border border-[#1a1a1a]/10 rounded-lg group-hover:bg-[#1a1a1a]/5 transition-colors">
    <IoArrowBackOutline size={14} className="text-[#1a1a1a]/60" />
    <span className="text-[10px] uppercase tracking-[3px] font-bold text-[#1a1a1a]/60 group-hover:text-[#1a1a1a]">
      Voltar para a Unidade
    </span>
  </div>
</button>
          </div>
        </div>
      </div>
    );
  }

  /* ==========================================================
     VIEW DE AGENDAMENTO (NOVO!)
     ========================================================== */
  if (view === 'agendamento') {
    return (
      <div className="min-h-screen bg-[#f4f1ea] font-serif text-[#1a1a1a]">
        {/* Header Vintage Compacto */}
        <header className="sticky top-0 z-50 bg-[#1a1a1a] border-b-4 border-double border-[#C5A059] shadow-lg">
          <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
            <button 
              onClick={handleVoltar}
              className="p-2 border border-[#C5A059]/40 text-[#C5A059] hover:bg-[#C5A059] hover:text-[#1a1a1a] transition-all"
            >
              <IoArrowBackOutline size={22} />
            </button>

            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-bold uppercase italic tracking-tight text-[#C5A059]">
                {barbearia?.nome}
              </h2>
              <p className="text-[8px] uppercase tracking-[3px] opacity-60 text-white">Traditional Booking</p>
            </div>

            <div className="w-10" />
          </div>
        </header>

        {/* Content Wrapper com textura de papel leve */}
        <main className="max-w-4xl mx-auto py-8 px-4">
          <div className="border border-[#1a1a1a]/10 p-2 bg-white/50 shadow-inner">
            <div className="border-2 border-[#C5A059]/20 p-4 md:p-8 bg-white">
              {children}
            </div>
          </div>
        </main>
      </div>
    );
  }

  /* ==========================================================
     VIEW HOME (PREMIUM RETRO)
     ========================================================== */
  return (
    <div className="min-h-screen font-serif bg-[#f4f1ea] text-[#1a1a1a] overflow-x-hidden">
      
      <button 
        onClick={handleLoginClick}
        className="fixed top-6 right-6 z-[100] p-3 rounded-md transition-all border-2 shadow-xl hover:scale-110 flex items-center justify-center active:scale-90"
        style={{ backgroundColor: retroDark, borderColor: retroGold, color: retroGold }}
      >
        <IoLogInOutline size={24} />
      </button>

      <header className="py-12 border-b-4 border-double border-[#C5A059] text-center bg-[#1a1a1a] text-[#C5A059]">
        <p className="uppercase tracking-[0.5em] text-[10px] mb-4 opacity-80">Established 2026</p>
        <h1 className="text-5xl md:text-8xl font-bold uppercase tracking-tighter italic px-4">{barbearia?.nome}</h1>
        <div className="mt-8 px-6">
          <button 
            onClick={handleAgendarClick} 
            className="w-full md:w-auto px-12 py-4 border-2 border-[#C5A059] text-[#C5A059] font-black uppercase text-xs tracking-[0.3em] hover:bg-[#C5A059] hover:text-[#1a1a1a] transition-all duration-500"
          >
            Agendar Horário
          </button>
        </div>
      </header>

      <section className="p-6 md:p-12">
        <div className="max-w-6xl mx-auto border-[10px] border-[#1a1a1a] p-2 bg-[#1a1a1a] shadow-2xl overflow-hidden">
           <img 
            src={barbearia?.fotos?.[0] || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1'} 
            className="w-full h-[350px] md:h-[600px] object-cover grayscale sepia-[.3] hover:grayscale-0 transition-all duration-1000"
            alt="Main Look" 
           />
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold italic text-[#1a1a1a] border-b-2 border-[#C5A059] inline-block pb-2 lowercase">menu de serviços_</h2>
        </div>
        <div className="space-y-6 md:space-y-8">
          {barbearia?.servicos?.map((s, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#C5A059]/30 pb-4 group cursor-pointer" onClick={handleAgendarClick}>
              <div className="flex-1">
                <h3 className="text-xl md:text-2xl font-bold uppercase tracking-tight group-hover:text-[#C5A059] transition-colors">{s.nome}</h3>
                <div className="flex items-center gap-2 opacity-60 text-[10px] md:text-xs italic mt-1">
                  <IoTimeOutline /> {s.tempo} minutos de barbearia
                </div>
              </div>
              <div className="text-xl md:text-2xl font-bold text-[#C5A059] md:ml-4 mt-2 md:mt-0">R$ {s.valor?.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="py-20 px-6 bg-[#edeae1]">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold italic border-b-2 border-[#C5A059] inline-block mb-12 pb-2 lowercase">the craftsmen_</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-12">
            {barbeiros?.map((b, i) => (
              <div key={i} className="group cursor-pointer" onClick={handleAgendarClick}>
                <div className="relative border-[3px] md:border-4 border-[#1a1a1a] p-1 md:p-2 bg-white shadow-lg transition-all duration-500 group-hover:-rotate-2 group-hover:scale-105">
                  <img 
                    src={b.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.nome)}&background=1a1a1a&color=C5A059`} 
                    className="w-full h-[200px] md:h-[400px] object-cover grayscale sepia-[0.2]" 
                    alt={b.nome} 
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1621605815971-fbc98d665033?q=80&w=400&h=600&auto=format&fit=crop'; }}
                  />
                </div>
                <h4 className="mt-4 text-sm md:text-2xl font-bold uppercase tracking-widest">{b.nome}</h4>
                <p className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em] md:tracking-[0.4em] opacity-40 mt-1 italic">{b.especialidade || 'Master Barber'}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-[#1a1a1a] text-[#C5A059] pt-16 pb-10 border-t-4 border-double border-[#C5A059]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="flex flex-col lg:flex-row gap-12 items-center lg:items-start">
            <div className="flex-1 space-y-10 order-2 lg:order-1 text-center lg:text-left w-full">
              <div>
                <h3 className="text-[#C5A059] font-bold italic text-4xl mb-8 uppercase tracking-widest leading-none">{barbearia?.nome}</h3>
                <div className="space-y-8">
                  <div className="block">
                    <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40">Location</p>
                    <p className="text-sm mt-1 opacity-80 font-serif italic">{barbearia?.endereco || "Endereço não informado"}</p>
                  </div>
                  <a href={`https://wa.me/${whatsappLimpo}`} target="_blank" rel="noopener noreferrer" className="block group">
                    <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40 group-hover:text-white transition-colors">WhatsApp</p>
                    <p className="text-lg mt-1 font-bold tracking-[2px]">{formatarExibicaoZap(barbearia?.whatsapp)}</p>
                  </a>
                  <a href={`https://instagram.com/${barbearia?.instagram?.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="block group">
                    <p className="text-[10px] font-black uppercase tracking-[3px] opacity-40 group-hover:text-white transition-colors">Social Journal</p>
                    <p className="text-sm mt-1 lowercase font-black tracking-[4px] border-b border-transparent group-hover:border-[#C5A059] transition-all inline-block">@{barbearia?.instagram?.replace('@', '') || 'barberflow'}</p>
                  </a>
                </div>
              </div>
            </div>
            <div className="flex-1 order-1 lg:order-2 w-full">
              <div className="h-[280px] md:h-[400px] w-full border-4 border-[#C5A059] p-1 bg-[#C5A059] overflow-hidden shadow-2xl">
                <iframe 
                  title="Localização" 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(barbearia?.endereco || 'Brasil')}&t=&z=15&ie=UTF8&iwloc=&output=embed`} 
                  style={{ filter: 'grayscale(1) sepia(0.5) contrast(1.2) invert(0.9)' }}
                ></iframe>
              </div>
            </div>
          </div>
          <div className="mt-20 pt-8 border-t border-[#C5A059]/20 flex flex-col md:flex-row justify-between items-center gap-4 text-[9px] font-bold uppercase tracking-[5px] opacity-30 text-center">
            <p>© {new Date().getFullYear()} {barbearia?.nome}</p>
            <p>Premium Vintage Experience • BarberFlow</p>
          </div>
        </div>
      </footer>
    </div>
  );
}