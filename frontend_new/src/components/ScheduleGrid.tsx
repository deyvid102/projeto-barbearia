import React, { useState, useEffect } from "react";

export default function ScheduleGrid() {

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(1);

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
    { id: 1, cliente: "Gabriel", barbeiroId: 1, hora: "09:00", servico: "Corte", valor: 30 },
    { id: 2, cliente: "Lucas", barbeiroId: 2, hora: "10:00", servico: "Barba", valor: 20 },
    { id: 3, cliente: "Rafael", barbeiroId: 3, hora: "11:00", servico: "Corte + Barba", valor: 50 },
    ];

    const horarios = [];
    for (let i = 8; i <= 18; i++) {
    horarios.push(`${i < 10 ? "0" + i : i}:00`);
    }

    const barbeirosVisiveis = isMobile
    ? barbeiros.filter(b => b.id === barbeiroSelecionado)
    : barbeiros;

    return (
        <div className="w-full">
      
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
      
                      const agendamento = agendamentos.find(
                        (a) =>
                          a.barbeiroId === barbeiro.id &&
                          a.hora === hora
                      );
      
                      return (
                        <td
                          key={barbeiro.id}
                          className="p-2 border-r border-border align-top"
                        >
      
                          {agendamento ? (
                            <div className="bg-primary/15 border border-primary/20 text-foreground rounded-lg p-2 text-xs">
      
                              <p className="font-semibold truncate">
                                {agendamento.cliente}
                              </p>
      
                              <p className="text-[11px] text-muted-foreground">
                                {agendamento.servico}
                              </p>
      
                              <p className="text-[11px] font-bold text-primary">
                                R$ {agendamento.valor}
                              </p>
      
                            </div>
                          ) : (
                            <div className="text-[10px] text-muted-foreground text-center opacity-40">
                              Livre
                            </div>
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