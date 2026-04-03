import React, { useRef, useMemo } from "react";
// Se estiver usando Lucide Icons (comum em projetos React modernos)
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function DateSelector({ selectedDate, setSelectedDate, isDarkMode }) {
  const scrollRef = useRef(null);

  // useMemo evita que a lista seja recalculada a cada render desnecessariamente
  const days = useMemo(() => {
    const list = [];
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      list.push(d);
    }
    return list;
  }, []);

  const getLabel = (date, index) => {
    if (index === 0) return "Hoje";
    if (index === 1) return "Amanhã";
    // Abreviação de 3 letras sem o ponto
    return date.toLocaleDateString("pt-BR", { weekday: "short" }).slice(0, 3);
  };

  // Função para scroll manual via botões
  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 150; // Ajustado para o novo tamanho compacto
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative flex items-center group w-full">
      {/* Seta Esquerda - Mantida menor e nas bordas */}
      <button
        onClick={() => scroll("left")}
        className={`absolute left-[-10px] z-10 p-1 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 
          ${isDarkMode ? "bg-zinc-800 text-white border border-white/10" : "bg-white text-slate-600 border border-slate-200"}`}
      >
        <ChevronLeft size={16} />
      </button>

      {/* Container de Datas - Fundo e padding originais restaurados, altura compacta mantida */}
      <div
        ref={scrollRef}
        className={`w-full flex gap-0.5 mb-4 p-2 rounded-2xl border overflow-x-auto whitespace-nowrap no-scrollbar
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

        {days.map((date, index) => {
          const isSelected = date.toDateString() === selectedDate.toDateString();
          // Lógica para mostrar o divisor: não mostra no último item, nem antes/depois do selecionado
          const showDivider = index < days.length - 1 && !isSelected && 
                              (days[index + 1].toDateString() !== selectedDate.toDateString());

          return (
            <React.Fragment key={date.toISOString()}>
              <button
                onClick={() => setSelectedDate(date)}
                className={`
                  min-w-[45px] md:min-w-[55px]
                  flex flex-col items-center justify-center
                  py-1.5 px-2
                  rounded-lg transition-all border
                  flex-shrink-0
                  ${isSelected
                      ? "bg-[#e6b32a] text-black border-[#e6b32a] scale-[0.98]"
                      : isDarkMode
                      ? "bg-transparent border-transparent text-gray-500 hover:text-gray-300"
                      : "bg-transparent border-transparent text-slate-500 hover:bg-slate-200/50"
                  }
                `}
              >
                <span className="text-[10px] font-medium uppercase tracking-tighter">
                  {getLabel(date, index)}
                </span>
                <span className="text-base font-bold leading-none mt-0.5">{date.getDate()}</span>
              </button>
              
              {/* Linha Divisória Vertical */}
              {showDivider && (
                <div className={`w-[1px] h-6 self-center flex-shrink-0 ${isDarkMode ? 'bg-white/5' : 'bg-slate-100'}`} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Seta Direita */}
      <button
        onClick={() => scroll("right")}
        className={`absolute right-[-10px] z-10 p-1 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100 
          ${isDarkMode ? "bg-zinc-800 text-white border border-white/10" : "bg-white text-slate-600 border border-slate-200"}`}
      >
        <ChevronRight size={16} />
      </button>
    </div>
  );
}