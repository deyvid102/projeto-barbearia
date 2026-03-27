import { React, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../../components/ThemeContext';
import { 
  IoChevronForwardOutline, 
  IoLogInOutline,
  IoMenu,
  IoClose,
  IoEyeOutline,
  IoEyeOffOutline,
  IoArrowBackOutline,
  IoSunnyOutline,
  IoMoonOutline 
} from 'react-icons/io5';

import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
// import { Swiper, SwiperSlide } from 'swiper/react';
// import { Autoplay, EffectFade } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/effect-fade';

import barbearia1 from '../../assets/barbearia1.jpg';
import logo from '../../assets/logo_nome.png';

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
  const { isDarkMode, toggleTheme} = useTheme();

  const [menuOpen, setMenuOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [servico, setServico] = useState(null);
  const [barbeiro, setBarbeiro] = useState(null);
  const [hora, setHora] = useState(null);
  const [nome, setNome] = useState("");
  const [telefone, setTelefone] = useState("");

  const scrollToSection = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMenuOpen(false);
  };

  const handleLoginClick = () => {
    const barbeariaPath = barbearia?.nome?.toLowerCase().replace(/\s+/g, '-');
    navigate(`/barbeiro/login/${barbeariaPath}`);
  };

  const handleAgendarClick = () => {
    const barbeariaPath = barbearia?.nome?.toLowerCase().replace(/\s+/g, '-');
    navigate(`/agendar/${barbeariaPath}`);
  };

  // const fotosExibicao = barbearia?.fotos?.length > 0 ? barbearia.fotos : [barbearia1, barbearia2, barbearia3];

  const formatarExibicaoZap = (val) => {
    if (!val) return "";
    const nums = val.replace(/\D/g, "");
    if (nums.length === 13) return `+${nums.substring(0, 2)} (${nums.substring(2, 4)}) ${nums.substring(4, 5)} ${nums.substring(5, 9)}-${nums.substring(9)}`;
    if (nums.length === 11) return `(${nums.substring(0, 2)}) ${nums.substring(2, 3)} ${nums.substring(3, 7)}-${nums.substring(7)}`;
    return val;
  };

  console.log("Barbeiros: ", barbeiros)

  const whatsappLimpo = barbearia?.whatsapp?.replace(/\D/g, '');

  /* ==========================================================
      VIEW DE LOGIN
     ========================================================== */
  if (view === 'login') {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-slate-50'}`}>
        <div className={`w-full max-w-sm p-8 md:p-10 rounded-[2.5rem] md:rounded-[3rem] border shadow-2xl transition-all ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
          <div className="text-center mb-8 space-y-2">
            <h2 className={`text-2xl md:text-3xl font-black italic tracking-tighter ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
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
  // if (view === 'agendamento') {
  //   return (
  //     <div className={`min-h-screen transition-colors duration-500 ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-slate-900'}`}>
  //       <header className={`sticky top-0 z-50 backdrop-blur-md border-b transition-colors ${isDarkMode ? 'bg-black/80 border-white/5' : 'bg-white/80 border-slate-100'}`}>
  //         <div className="max-w-6xl mx-auto p-4 flex items-center justify-between">
  //           <button 
  //             onClick={handleVoltar} 
  //             className={`p-3 rounded-2xl border transition-all active:scale-95 ${isDarkMode ? 'bg-[#111] border-white/10' : 'bg-slate-50 border-slate-200'}`}
  //           >
  //             <IoArrowBackOutline size={20} />
  //           </button>
            
  //           <div className="text-center flex-1 px-2">
  //             <h2 className="text-base md:text-lg font-black italic tracking-tighter leading-none line-clamp-1">{barbearia?.nome}</h2>
  //             <p className="text-[8px] uppercase font-black tracking-[2px] text-[#EAB308]">novo agendamento</p>
  //           </div>

  //           <div className="w-10 md:w-12" /> 
  //         </div>
  //       </header>

  //       {/* Padding responsivo: Menor no mobile (px-2) para não apertar o agendamento */}
  //       <main className="w-full max-w-4xl mx-auto py-4 md:py-8 px-2 md:px-4">
  //         {children}
  //       </main>
  //     </div>
  //   );
  // }

  /* ==========================================================
      VIEW HOME
     ========================================================== */
  return (
    <div className={`min-h-screen font-sans transition-colors duration-500 overflow-x-hidden ${isDarkMode ? 'bg-[#0a0a0a] text-white' : 'bg-white text-black'}`}>
      
      <header className="fixed top-0 left-0 w-full z-50 backdrop-blur-xl border-b transition-all
        bg-black/70 border-white/10">

        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* <button 
            onClick={handleLoginClick}
            className="fixed top-4 right-4 z-[100] p-3 rounded-full transition-all border backdrop-blur-md shadow-2xl hover:scale-110 active:scale-90"
            style={{ backgroundColor: `${brandYellow}ee`, borderColor: 'rgba(255,255,255,0.3)' }}
          >
            <IoLogInOutline size={22} color="#000" />
          </button> */}

          <div className="flex items-center gap-2">
            <img 
              src={logo} 
              alt="BarberFlow" 
              className="h-8 w-auto object-contain"
            />
            <span className="font-black italic text-sm md:text-base tracking-tighter text-white">
              Barber<span style={{ color: brandYellow }}>MAX</span>
            </span>
          </div>

          {/* MENU DESKTOP */}
          <nav className="hidden md:flex items-center gap-8 text-xs uppercase font-bold tracking-widest text-white/70">
            <button onClick={() => scrollToSection('servicos')} className="hover:text-white transition">
              Serviços
            </button>
            <button onClick={() => scrollToSection('equipe')} className="hover:text-white transition">
              Equipe
            </button>
            <button onClick={() => scrollToSection('contato')} className="hover:text-white transition">
              Contato
            </button>
          </nav>


          {/* AÇÕES DESKTOP */}
          <div className="hidden md:flex items-center gap-3">
            {/* TOGGLE TEMA */}
            <button
                onClick={toggleTheme}
                className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
              >
                {isDarkMode ? (
                  <IoSunnyOutline size={18} className="text-yellow-400" />
                ) : (
                  <IoMoonOutline size={18} className="text-white" />
                )}
            </button>
            <button 
              onClick={handleLoginClick}
              className="flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-white/70  hover:text-yellow-400 transition-all hover:scale-105"
            >
              <IoLogInOutline size={18} />
              entrar
            </button>
            
          </div>

          {/* MOBILE */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
            >
              {isDarkMode ? (
                <IoSunnyOutline size={18} className="text-yellow-400" />
              ) : (
                <IoMoonOutline size={18} className="text-white" />
              )}
            </button>

            <button 
              className="md:hidden text-white"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <IoClose size={24}/> : <IoMenu size={24}/>}
            </button>
          </div>
        </div>

        {/* MENU MOBILE */}
        {menuOpen && (
          <div className="md:hidden bg-black/95 backdrop-blur-xl border-t border-white/10 px-6 py-4 space-y-2">
            <button 
              onClick={() => scrollToSection('servicos')}
              className="block w-full text-left text-sm uppercase font-bold transition text-white/70 hover:text-white transition"
            >
              Serviços
            </button>

            <button 
              onClick={() => scrollToSection('equipe')}
              className="block w-full text-left text-sm uppercase font-bold text-white/70 hover:text-white transition"
            >
              Equipe
            </button>

            <button 
              onClick={() => scrollToSection('contato')}
              className="block w-full text-left text-sm uppercase font-bold text-white/70 hover:text-white transition"
            >
              Contato
            </button>

            {/* ENTRAR (PADRONIZADO) */}
            <button 
              onClick={handleLoginClick}
              className="block w-full text-left text-sm uppercase font-bold tracking-widest text-white/70 hover:text-yellow-400 transition-all"
            >
              <span className="inline-flex items-center gap-2">
                <IoLogInOutline size={16}/>
                Entrar
              </span>
            </button>
          </div>
        )}
      </header>

      <section className="relative h-[75vh] md:h-[85vh] flex items-center justify-center overflow-hidden">

        {/* IMAGEM */}
        <div className="absolute inset-0">
          <img 
            src={barbearia?.fotoCapa || barbearia1}
            className="w-full h-full object-cover scale-105"
            alt="Barbearia"
          />

          {/* OVERLAY */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-black/90" /></div>

          {/* CONTEÚDO */}
          <div className="relative z-10 text-center space-y-5 px-6 max-w-4xl mt-10">

            {/* NOME */}
            <h1 className="font-black italic tracking-tight leading-[0.95] text-white text-4xl md:text-7xl">
              {barbearia?.nome}
            </h1>

            {/* TEXTO */}
            <p className="text-white/80 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
              Estilo, precisão e atendimento de alto nível. 
              Agende seu horário com profissionais qualificados e transforme seu visual com quem entende do assunto.
            </p>

            {/* BOTÃO */}
            <button 
              onClick={handleAgendarClick} 
              className="w-full md:w-auto px-10 py-4 text-black font-black uppercase text-xs tracking-widest rounded-full hover:scale-105 hover:shadow-2xl transition-all mt-6"
              style={{ backgroundColor: brandYellow }}
            >
              agendar agora
            </button>
          </div>
      </section>

      <section id="servicos" className={`py-12 md:py-20 ${isDarkMode ? 'bg-[#0e0e0e]' : 'bg-gray-50'}`}>
        <div className="max-w-[1200px] mx-auto px-6">

          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12 md:mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter">
              Nossos <span style={{ color: brandYellow }}>Serviços</span>
            </h2>

            <p className="text-sm opacity-60 mt-3 max-w-md mx-auto">
              Cada serviço é pensado pra elevar sua experiência ao máximo.
            </p>
          </motion.div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 md:gap-6">
            {barbearia?.servicos?.map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className={`p-6 md:p-7 rounded-3xl border transition-all text-center hover:scale-[1.02] ${
                  isDarkMode 
                    ? 'bg-[#121212] border-white/5' 
                    : 'bg-white border-gray-100 shadow-lg'
                }`}
              >

                {/* Nome */}
                <h3 className="font-black italic text-lg md:text-xl uppercase tracking-tighter mb-3">
                  {s.nome}
                </h3>

                {/* Descrição (opcional) */}
                {s.descricao && (
                  <p className="text-sm opacity-60 mb-4 leading-relaxed">
                    {s.descricao}
                  </p>
                )}

                {/* Tempo (agora separado e bonito) */}
                <div className="flex items-center justify-center gap-1 text-xs opacity-60 uppercase font-bold tracking-widest mb-4">
                  <Clock className="w-4 h-4" />
                  {s.tempo} min
                </div>

                {/* Preço (destaque principal) */}
                <div 
                  className="text-3xl font-bold mb-6"
                  style={{ color: brandYellow }}
                >
                  R$ {s.valor?.toFixed(2)}
                </div>

                {/* Botão */}
                <button 
                  onClick={handleAgendarClick}
                  className="w-full py-4 rounded-2xl border text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-105 hover:bg-yellow-500/10"
                  style={{ borderColor: `${brandYellow}50`, color: brandYellow }}
                >
                  Agendar <IoChevronForwardOutline />
                </button>

              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Profissionais */}
      <section id="equipe" className={`py-12 md:py-20 ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
        <div className="max-w-[1100px] mx-auto px-6">
          
          <h2 className="text-2xl md:text-3xl font-black italic mb-8 md:mb-10 tracking-tighter">
            Profissionais
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {barbeiros?.map((b, i) => (
              <div 
                key={i} 
                className="group cursor-pointer text-center"
                onClick={handleAgendarClick}
              >

                {b.foto ? (
                  // ✅ COM FOTO (circular estilo rede social)
                  <>
                    <div className="w-24 h-24 md:w-28 md:h-28 mx-auto mb-3 rounded-full overflow-hidden border border-white/10 shadow-lg">
                      <img 
                        src={b.foto}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        alt={b.nome}
                      />
                    </div>

                    <h4 className="font-bold italic uppercase text-xs md:text-sm tracking-tight">
                      {b.nome}
                    </h4>

                    {b.especialidade && (
                      <p className="text-[9px] opacity-40 uppercase font-black tracking-widest mt-1">
                        {b.especialidade}
                      </p>
                    )}
                  </>
                ) : (
                  // ❌ SEM FOTO (card com nome apenas)
                  <div className="aspect-[3/4] flex items-center justify-center rounded-2xl border border-white/10 bg-neutral-900 shadow-lg px-3">
                    <span className="text-white text-xs md:text-sm font-bold uppercase tracking-wide text-center">
                      {b.nome}
                    </span>
                  </div>
                )}

              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AGENDAMENTO */}
      <section
        id="agendamento"
        className={`py-16 md:py-24 ${
          isDarkMode ? "bg-[#0e0e0e]" : "bg-gray-50"
        }`}
      >
        <div className="max-w-4xl mx-auto px-6">

          {/* TÍTULO */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-black italic tracking-tighter">
              Agende seu horário
            </h2>
          </div>

          {/* STEPPER */}
          <div className="flex justify-between items-center mb-10">
            {["Serviço", "Barbeiro", "Horário", "Confirmar"].map((label, i) => (
              <div key={i} className="flex-1 text-center">
                <div
                  className={`w-10 h-10 mx-auto rounded-full flex items-center justify-center text-xs font-bold transition-all
                  ${
                    i <= step
                      ? "bg-yellow-400 text-black"
                      : "bg-white/10 text-white/40"
                  }`}
                >
                  {i + 1}
                </div>
                <p className="text-[10px] mt-2 uppercase opacity-60">
                  {label}
                </p>
              </div>
            ))}
          </div>

          {/* CARD */}
          <div className={`rounded-3xl p-6 md:p-8 border shadow-xl ${
            isDarkMode
              ? "bg-[#121212] border-white/5"
              : "bg-white border-gray-200"
          }`}>

            {/* STEP 1 - SERVIÇOS */}
            {step === 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {barbearia?.servicos?.map((s, i) => (
                  <button
                    key={i}
                    onClick={() => setServico(s)}
                    className={`p-4 rounded-2xl border text-left transition-all ${
                      servico === s
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-white/10 hover:border-yellow-400/30"
                    }`}
                  >
                    <p className="font-bold">{s.nome}</p>
                    <p className="text-sm opacity-60">
                      {s.tempo} min • R$ {s.valor}
                    </p>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 2 - BARBEIRO */}
            {step === 1 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {barbeiros?.map((b, i) => (
                  <button
                    key={i}
                    onClick={() => setBarbeiro(b)}
                    className={`p-4 rounded-2xl text-center border transition ${
                      barbeiro === b
                        ? "border-yellow-400 bg-yellow-400/10"
                        : "border-white/10"
                    }`}
                  >
                    <img
                      src={b.foto}
                      className="w-14 h-14 rounded-full mx-auto mb-2 object-cover"
                    />
                    <p className="text-sm font-bold">{b.nome}</p>
                  </button>
                ))}
              </div>
            )}

            {/* STEP 3 - HORÁRIOS */}
            {step === 2 && (
              <div>
                <p className="mb-4 text-sm opacity-60">
                  Escolha um horário:
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {["09:00", "10:00", "11:00", "14:00", "15:00"].map((h) => (
                    <button
                      key={h}
                      onClick={() => setHora(h)}
                      className={`py-2 rounded-xl border text-sm ${
                        hora === h
                          ? "bg-yellow-400 text-black"
                          : "border-white/10"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* STEP 4 - CONFIRMAÇÃO */}
            {step === 3 && (
              <div className="space-y-4">
                <input
                  placeholder="Seu nome"
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-transparent"
                />
                <input
                  placeholder="Telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  className="w-full p-3 rounded-xl border bg-transparent"
                />

                <div className="text-sm opacity-60">
                  {servico?.nome} com {barbeiro?.nome} às {hora}
                </div>
              </div>
            )}
          </div>

          {/* BOTÕES */}
          <div className="flex justify-between mt-6">
            <button
              onClick={() => setStep(step - 1)}
              disabled={step === 0}
              className="text-sm opacity-50"
            >
              Voltar
            </button>

            <button
              onClick={() =>
                step === 3 ? alert("Agendado!") : setStep(step + 1)
              }
              className="px-6 py-3 rounded-full font-bold text-black bg-yellow-400"
            >
              {step === 3 ? "Confirmar" : "Próximo"}
            </button>
          </div>

        </div>
      </section>

      {/* Footer Responsivo */}
      <footer id="contato" className="bg-[#050505] text-white pt-16 pb-10 border-t border-white/5">
        <div className="max-w-[1200px] mx-auto px-6 text-center lg:text-left">
          <div className="flex flex-col lg:flex-row gap-12 lg:items-start">
            <div className="flex-1 space-y-10 order-2 lg:order-1">
              <h3 className="font-black italic text-3xl md:text-4xl tracking-tighter" style={{ color: brandYellow }}>{barbearia?.nome}</h3>
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