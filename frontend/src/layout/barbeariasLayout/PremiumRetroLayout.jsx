import React from 'react';
import { useNavigate } from 'react-router-dom';
import { IoStar, IoLogoWhatsapp, IoTimeOutline } from 'react-icons/io5';

// Cores para o tema Vintage
const retroGold = '#C5A059'; 
const retroDark = '#1a1a1a';
const retroPaper = '#f4f1ea';

export default function PremiumRetroLayout({ barbearia, barbeiros }) {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen font-serif bg-[#f4f1ea] text-[#1a1a1a]">
      {/* Header Vintage */}
      <header className="py-12 border-b-4 border-double border-[#C5A059] text-center bg-[#1a1a1a] text-[#C5A059]">
        <p className="uppercase tracking-[0.5em] text-[10px] mb-4">Established 2026</p>
        <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter italic">
          {barbearia?.nome}
        </h1>
        <div className="mt-4 flex justify-center items-center gap-4 opacity-70">
          <span className="w-12 h-[1px] bg-[#C5A059]"></span>
          <p className="text-xs uppercase font-bold italic">Gentlemen's Grooming</p>
          <span className="w-12 h-[1px] bg-[#C5A059]"></span>
        </div>
      </header>

      {/* Hero Section - Estilo Moldura de Quadro */}
      <section className="p-6 md:p-12">
        <div className="max-w-6xl mx-auto border-[10px] border-[#1a1a1a] p-2 bg-[#1a1a1a] shadow-2xl overflow-hidden">
           <img 
            src={barbearia?.fotos?.[0] || 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1'} 
            className="w-full h-[500px] object-cover grayscale sepia-[.3] hover:grayscale-0 transition-all duration-1000"
            alt="Main Look" 
           />
        </div>
      </section>

      {/* Serviços - Estilo Menu de Restaurante Antigo */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold italic text-[#1a1a1a] border-b-2 border-[#C5A059] inline-block pb-2">Menu de Serviços</h2>
        </div>
        
        <div className="space-y-8">
          {barbearia?.servicos?.map((s, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-end justify-between border-b border-[#C5A059]/30 pb-4 group">
              <div className="flex-1">
                <h3 className="text-2xl font-bold uppercase tracking-tight group-hover:text-[#C5A059] transition-colors">
                  {s.nome}
                </h3>
                <div className="flex items-center gap-2 opacity-60 text-xs italic mt-1">
                   <IoTimeOutline /> {s.tempo} minutos de experiência
                </div>
              </div>
              <div className="text-2xl font-bold text-[#C5A059] md:ml-4">
                R$ {s.valor?.toFixed(2)}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Final */}
      <section className="bg-[#1a1a1a] text-[#C5A059] py-20 text-center">
        <div className="border-2 border-[#C5A059] inline-block p-8 m-6">
          <h2 className="text-3xl font-bold italic mb-6">Pronto para o próximo nível?</h2>
          <button 
            onClick={() => navigate(`/agendar/${barbearia?.nome?.toLowerCase().replace(/\s+/g, '-')}`)}
            className="px-12 py-4 bg-[#C5A059] text-[#1a1a1a] font-black uppercase text-sm tracking-[0.2em] hover:bg-white transition-all"
          >
            Reservar Horário
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center opacity-40 text-[10px] uppercase font-bold tracking-widest">
        {barbearia?.endereco} • {barbearia?.whatsapp}
      </footer>
    </div>
  );
}