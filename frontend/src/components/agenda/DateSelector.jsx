import React, { useRef } from "react";
// Se estiver usando Lucide Icons (comum em projetos React modernos)
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateSelector({ selectedDate, setSelectedDate, isDarkMode }) {
  const scrollRef = useRef(null);

  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      days.push(d);
    }
    return days;
  };

  const getLabel = (date, index) => {
    if (index === 0) return "Hoje";
    if (index === 1) return "Amanhã";
    return date.toLocaleDateString("pt-BR", { weekday: "short" });
  };

  // Função para scroll manual via botões
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 200; // Ajuste a velocidade/distância aqui
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex items-center group">
      {/* Seta Esquerda */}
      <button
        onClick={() => scroll("left")}
        className={`absolute left-0 z-10 p-1 m-1 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 
          ${isDarkMode ? "bg-zinc-800 text-white" : "bg-white text-slate-600"}`}
      >
        <ChevronLeft size={20} />
      </button>

      {/* Container de Datas */}
      <div
        ref={scrollRef}
        className={`w-full flex gap-2 mb-4 p-2 rounded-2xl border overflow-x-auto whitespace-nowrap no-scrollbar
          ${isDarkMode 
            ? "bg-[#111] border-white/5" 
            : "bg-white border-slate-200 shadow-sm"}
        `}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }} // Esconde no Firefox/IE
      >
        {/* CSS inline para esconder scroll no Chrome/Safari */}
        <style>{`
          .no-scrollbar::-webkit-scrollbar { display: none; }
        `}</style>

        {getNextDays().map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();

          return (
            <button
              key={date.toISOString()}
              onClick={() => setSelectedDate(date)}
              className={`
                min-w-[50px] md:min-w-[70px]
                flex flex-col items-center justify-center
                px-3 py-2 md:px-4 md:py-1
                rounded-lg transition-all border
                flex-shrink-0
                ${isSelected
                    ? "bg-[#e6b32a] text-black border-[#e6b32a]"
                    : isDarkMode
                    ? "bg-transparent border-white/10 text-gray-400 hover:bg-white/5"
                    : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
                }
              `}
            >
              <span className="text-xs font-semibold uppercase tracking-wide">
                {getLabel(date, index)}
              </span>
              <span className="text-xl font-black">{date.getDate()}</span>
              <span className="text-[10px] opacity-70">
                {date.toLocaleDateString("pt-BR", { month: "short" })}
              </span>
            </button>
          );
        })}
      </div>

      {/* Seta Direita */}
      <button
        onClick={() => scroll("right")}
        className={`absolute right-0 z-10 p-1 m-1 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 
          ${isDarkMode ? "bg-zinc-800 text-white" : "bg-white text-slate-600"}`}
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}