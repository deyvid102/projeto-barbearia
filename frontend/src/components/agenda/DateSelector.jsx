import React from "react";

export default function DateSelector({ selectedDate, setSelectedDate, isDarkMode }) {

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

    return date.toLocaleDateString("pt-BR", {
      weekday: "short",
    });
  };

  return (
    <div
      className={`w-full flex gap-2 mb-4 p-2 rounded-2xl border overflow-x-auto whitespace-nowrap custom-scrollbar
      ${isDarkMode
        ? "bg-[#111] border-white/5"
        : "bg-white border-slate-200 shadow-sm"}
    `}
    >
      {getNextDays().map((date, index) => {
        const isSelected =
          date.toDateString() === selectedDate.toDateString();

        return (
          <button
            key={date.toISOString()}
            onClick={() => setSelectedDate(date)}
            className={`
              min-w-[60px] md:min-w-[80px]
              flex flex-col items-center justify-center
              px-3 py-2 md:px-4 md:py-3
              rounded-xl transition-all border
              flex-shrink-0
              ${
                isSelected
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

            <span className="text-xl font-black">
              {date.getDate()}
            </span>

            <span className="text-[10px] opacity-70">
              {date.toLocaleDateString("pt-BR", { month: "short" })}
            </span>
          </button>
        );
      })}
    </div>
  );
}