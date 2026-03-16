import React from 'react';
import { IoCutOutline, IoCashOutline, IoPersonOutline } from 'react-icons/io5';

const ALTURA_LINHA = 20;
const ALTURA_CABECALHO = 48;

export default function ScheduleGrid({
  barbeiros,
  agendamentos,
  isDarkMode,
  configLimites, // { inicio, fim }
  currentTime,
  getNomeExibicao,
  getHourFromDate,
  formatHourLabel,
  onCardClick,
  getNomeBarbeiro, // opcional: se passado, mostra nome do barbeiro no card
  disableOthersForId = null, // opcional: id do barbeiro "ativo" (outros ficam bloqueados)
}) {
  const getEscopoHorarios = () => {
    const escopo = [];
    const inicio = Number(configLimites?.inicio ?? 8);
    const fim = Number(configLimites?.fim ?? 18);
    for (let i = inicio; i <= fim; i++) {
      escopo.push({ hora: `${i < 10 ? '0' + i : i}:00`, hInt: i });
    }
    return escopo;
  };

  const getTimelinePositionPercentage = (horaCard) => {
    const currentHour = currentTime.getHours();
    const [cardHour] = horaCard.split(':');
    if (currentHour === parseInt(cardHour, 10)) {
      const minutes = currentTime.getMinutes();
      return (minutes / 60) * 100;
    }
    return null;
  };

  return (
    <div
      className={`relative flex-1 rounded-[2rem] border overflow-hidden mb-10 ${
        isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-xl'
      }`}
    >
      <div className="overflow-x-auto min-h-fit custom-scrollbar">
        <table className="w-full border-collapse md:min-w-[1200px] table-fixed">
          <thead>
            <tr style={{ height: `${ALTURA_CABECALHO}px` }}>
              <th
                className={`md:sticky md:left-0 md:z-40 w-20 p-2 border-b border-r text-[9px] font-black uppercase tracking-widest ${
                  isDarkMode
                    ? 'bg-[#111] border-white/5 text-gray-400'
                    : 'bg-slate-50 border-slate-100 text-slate-500'
                }`}
              >
                Hora
              </th>
              {barbeiros.map((b) => (
                <th
                  key={b._id}
                  className={`p-2 border-b border-r text-[10px] font-black uppercase tracking-wider ${
                    isDarkMode
                      ? 'border-white/5 text-white/80'
                      : 'border-slate-100 text-slate-700'
                  }`}
                >
                  {b.nome.split(' ')[0]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {getEscopoHorarios().map(({ hora, hInt }) => {
              const posLinha = getTimelinePositionPercentage(hora);

              return (
                <tr
                  key={hora}
                  className="relative group/row"
                  style={{ height: `${ALTURA_LINHA}px` }}
                >
                  <td
                    className={`sticky left-0 z-20 p-2 border-b border-r text-center font-mono text-[10px] font-black transition-colors ${
                      isDarkMode
                        ? 'bg-[#111] border-white/5 text-gray-500 group-hover/row:text-[#e6b32a]'
                        : 'bg-slate-50 border-slate-100 text-slate-400 group-hover/row:text-black'
                    }`}
                  >
                    {hora}
                    {posLinha !== null && (
                      <div
                        className="absolute left-0 w-[2000px] z-50 pointer-events-none flex items-center"
                        style={{ top: `${posLinha}%` }}
                      >
                        <div className="w-full h-[1.5px] bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.4)]" />
                      </div>
                    )}
                  </td>

                  {barbeiros.map((b) => {
                    const isDisabled =
                      disableOthersForId &&
                      String(b._id) !== String(disableOthersForId);

                    const ags = agendamentos.filter((a) => {
                      const barbeiroId = String(
                        a.fk_barbeiro?._id || a.fk_barbeiro || ''
                      ).trim();
                      return (
                        barbeiroId === String(b._id).trim() &&
                        getHourFromDate(a.datahora) === hInt
                      );
                    });

                    return (
                      <td
                        key={b._id}
                        className={`p-1 border-b border-r align-top relative ${
                          isDarkMode ? 'border-white/5' : 'border-slate-100'
                        }`}
                      >
                        <div
                          className={`grid gap-1 h-full ${
                            ags.length > 1 ? 'grid-cols-2' : 'grid-cols-1'
                          }`}
                        >
                          {ags.map((ag) => (
                            <button
                              key={ag._id}
                              onClick={() => !isDisabled && onCardClick(ag)}
                              className={`group w-full p-1.5 rounded-lg text-left border shadow-sm transition-all h-fit relative z-10
                                ${
                                  isDisabled
                                    ? 'opacity-40 grayscale pointer-events-none'
                                    : 'hover:scale-[1.02] active:scale-95'
                                }
                                ${
                                  ag.status === 'F'
                                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500'
                                    : ag.status === 'C'
                                    ? 'bg-red-500/10 border-red-500/20 text-red-500'
                                    : 'bg-[#e6b32a] text-black border-[#e6b32a]'
                                }`}
                            >
                              <div className="flex flex-col">
                                <div className="flex justify-between items-start gap-1">
                                  <p className="text-[8px] font-black uppercase truncate max-w-[70%]">
                                    {getNomeExibicao(ag)}
                                  </p>
                                  <span className="text-[7px] font-black opacity-70">
                                    {formatHourLabel(ag)}
                                  </span>
                                </div>
                                <div className="mt-1 border-t border-black/5 pt-1">
                                  <div className="flex justify-between items-end">
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1 opacity-80">
                                        <IoCutOutline size={8} />
                                        <p className="text-[7px] font-bold uppercase truncate">
                                          {ag.tipoCorte || 'Serviço'}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-1">
                                        <IoCashOutline size={8} />
                                        <p className="text-[8px] font-black">
                                          R$ {ag.valor || '0,00'}
                                        </p>
                                      </div>
                                    </div>
                                    {getNomeBarbeiro && (
                                      <div className="flex items-center gap-1 text-right">
                                        <p className="text-[9px] font-black uppercase truncate text-black/60 dark:text-black/80">
                                          {getNomeBarbeiro(ag)}
                                        </p>
                                        <IoPersonOutline
                                          size={9}
                                          className="opacity-50"
                                        />
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

