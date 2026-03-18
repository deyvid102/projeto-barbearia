import React, { useState, useEffect } from "react";

export default function ScheduleGrid() {

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(1);
    const [dataSelecionada, setDataSelecionada] = useState(new Date());

    useEffect(() => {

        const handleResize = () => {
        const mobile = window.innerWidth < 768;
        setIsMobile(mobile);
        };

        window.addEventListener("resize", handleResize);

        return () => window.removeEventListener("resize", handleResize);

    }, []);

    const barbeiros = [
    { id: 1, nome: "João" },
    { id: 2, nome: "Pedro" },
    { id: 3, nome: "Carlos" },
    ];

    const agendamentos = [
      { id: 1, cliente: "Gabriel", barbeiroId: 1, hora: "09:00", data: "2026-03-18", servico: "Corte", valor: 30 },
    ];

    const horarios = [];
    for (let i = 8; i <= 18; i++) {
      const hora = i < 10 ? `0${i}` : i;
    
      horarios.push(`${hora}:00`);
    
      if (i !== 18) {
        horarios.push(`${hora}:30`);
      }
    }

    const barbeirosVisiveis = isMobile
    ? barbeiros.filter(b => b.id === barbeiroSelecionado)
    : barbeiros;

    const handleNovoAgendamento = (barbeiroId, hora) => {
      console.log("Novo agendamento:", barbeiroId, hora);
    
      // futuro:
      // abrir modal
    };
    
    const handleAbrirModal = (agendamento) => {
      console.log("Abrir modal:", agendamento);
    
      // futuro:
      // setModalOpen(true)
      // setAgendamentoSelecionado(agendamento)
    };

    const diasParaMostrar = 15;

    const datas = [];

    for (let i = 0; i < diasParaMostrar; i++) {
      const data = new Date();
      data.setDate(data.getDate() + i);

      datas.push(data);
    }

    const formatarData = (data) => {
      return data.toLocaleDateString("pt-BR", {
        weekday: "short",
        day: "2-digit",
        month: "2-digit",
      });
    };
        
    return (
        <div className="w-full">

          <div className="flex gap-2 overflow-x-auto mb-4 pb-2 snap-x snap-mandatory">
            {datas.map((data, index) => {

              const isSelected =
                data.toDateString() === dataSelecionada.toDateString();

              return (
                <button
                  key={index}
                  onClick={() => setDataSelecionada(data)}
                  className={`
                    min-w-[80px] px-3 py-2 rounded-lg text-xs text-center
                    border transition
                    ${isSelected
                      ? "bg-primary text-white border-primary"
                      : "bg-background border-border hover:bg-muted"}
                  `}
                >
                  {index === 0 ? "Hoje" : formatarData(data)}
                </button>
              );
            })}
          </div>
      
          {/* SELECT MOBILE */}
          {isMobile && (
            <div className="mb-4">
              <select
                value={barbeiroSelecionado}
                onChange={(e) => setBarbeiroSelecionado(Number(e.target.value))}
                className="w-full p-2 rounded-lg border border-border bg-background text-sm"
              >
                {barbeiros.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.nome}
                  </option>
                ))}
              </select>
            </div>
          )}
      
          <div className="overflow-x-auto">
      
            <table
              className={`w-full table-fixed border border-border rounded-xl overflow-hidden ${
                !isMobile ? "min-w-[700px]" : ""
              }`}
            >
      
              {/* CABEÇALHO */}
              <thead className="bg-muted/40">
                <tr>
      
                  <th className="w-20 text-xs p-3 font-bold text-muted-foreground border-r border-border">
                    Hora
                  </th>
      
                  {barbeirosVisiveis.map((b) => (
                    <th
                      key={b.id}
                      className="p-3 text-xs font-bold text-foreground border-r border-border"
                    >
                      {b.nome}
                    </th>
                  ))}
      
                </tr>
              </thead>
      
              {/* CORPO */}
              <tbody>
      
                {horarios.map((hora) => (
                  <tr key={hora} className="border-t border-border">
      
                    <td className="text-center text-xs font-semibold text-muted-foreground border-r border-border py-4">
                      {hora}
                    </td>
      
                    {barbeirosVisiveis.map((barbeiro) => {
      
                      const dataFormatada = dataSelecionada.toISOString().split("T")[0];

                      const agendamento = agendamentos.find(
                        (a) =>
                          a.barbeiroId === barbeiro.id &&
                          a.hora === hora &&
                          a.data === dataFormatada
                      );
      
                      return (
                        <td
                          key={barbeiro.id}
                          className="p-2 border-r border-border align-top"
                        >
      
                          {agendamento ? (
                            <button
                              onClick={() => handleAbrirModal(agendamento)}
                              className="
                                w-full text-left
                                bg-primary/15 border border-primary/20 text-foreground
                                rounded-lg p-2 text-xs space-y-1
                                hover:bg-primary/25
                                transition
                                active:scale-[0.98]
                              ">
      
                              <p className="font-semibold truncate">
                                {agendamento.cliente}
                              </p>
      
                              <p className="text-[11px] text-muted-foreground">
                                {agendamento.servico}
                              </p>
      
                              <p className="text-[11px] font-bold text-primary">
                                R$ {agendamento.valor}
                              </p>
                            </button>
                          ) : (
                            <button
                              onClick={() => handleNovoAgendamento(barbeiro.id, hora)}
                              className="w-full text-[10px] py-2 rounded-lg border border-dashed border-border hover:bg-muted transition"
                            > + Agendar
                            </button>
                          )}
      
                        </td>
                      );
      
                    })}
      
                  </tr>
                ))}
      
              </tbody>
      
            </table>
      
          </div>
      
        </div>
      );
}