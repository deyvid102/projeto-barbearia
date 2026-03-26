import React, { useState, useEffect } from "react";
import ModalAgendamento from "./ModaisAgendamentos";

export default function ScheduleGrid() {

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [barbeiroSelecionado, setBarbeiroSelecionado] = useState(1);
    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const [modalDetalheOpen, setModalDetalheOpen] = useState(false);
    const [modalNovoOpen, setModalNovoOpen] = useState(false);
    const [agendamentoSelecionado, setAgendamentoSelecionado] = useState(null);

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
      { id: 1, cliente: "Gabriel", barbeiroId: 1, hora: "09:00", data: "2026-03-25", servico: "Corte", valor: 30, status: "concluido"},
      { id: 1, cliente: "José", barbeiroId: 2, hora: "10:00", data: "2026-03-25", servico: "Corte", valor: 30, status: "concluido"},
      { id: 1, cliente: "Deyvid", barbeiroId: 3, hora: "11:00", data: "2026-03-25", servico: "Corte", valor: 30, status: "pendente"},
      { id: 1, cliente: "Miguel", barbeiroId: 1, hora: "12:00", data: "2026-03-25", servico: "Corte", valor: 30, status: "futuro"},
      { id: 1, cliente: "Pedro", barbeiroId: 2, hora: "13:00", data: "2026-03-25", servico: "Corte", valor: 30, status: "futuro"},
      { id: 1, cliente: "Ruan", barbeiroId: 3, hora: "14:00", data: "2026-03-25", servico: "Corte", valor: 30, status: "futuro"},
      { id: 1, cliente: "Helder", barbeiroId: 2, hora: "15:00", data: "2026-03-25", servico: "Corte", valor: 30, status: "futuro"},
    ];

    const statusStyles = {
      futuro: `
        bg-[hsl(var(--info)/0.15)]
        border border-[hsl(var(--info)/0.3)]
        hover:bg-[hsl(var(--info)/0.25)]
      `,
    
      pendente: `
        bg-[hsl(var(--warning)/0.15)]
        border border-[hsl(var(--warning)/0.3)]
        hover:bg-[hsl(var(--warning)/0.25)]
      `,
    
      concluido: `
        bg-[hsl(var(--success)/0.15)]
        border border-[hsl(var(--success)/0.3)]
        hover:bg-[hsl(var(--success)/0.25)]
      `,
    };

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
      setAgendamentoSelecionado({
        cliente: "",
        servico: "",
        valor: 0,
        hora,
        barbeiroId,
        status: "futuro",
      });
    
      setModalNovoOpen(true);
    };
    
    const handleAbrirModal = (agendamento) => {
      setAgendamentoSelecionado(agendamento);
      setModalDetalheOpen(true);
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

    const dataFormatada = dataSelecionada.toISOString().split("T")[0];

        
    return (
        <div className="w-full">
          <h3 className="font-display font-semibold mb-4">Agenda</h3>

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
      
          <div className="overflow-x-auto border rounded-xl p-1 border-border bg-card">
      
            <table
              className={`w-full table-fixed border border-border rounded-lg overflow-hidden ${
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

                {horarios.map((hora) => {

                  // verifica se existe agendamento nesse horário
                  const temAgendamentoNoHorario = agendamentos.some(
                    (a) => a.hora === hora && a.data === dataFormatada
                  );

                  return (
                    <tr
                      key={hora}
                      className={`border-t border-border ${
                        temAgendamentoNoHorario ? "h-16" : "h-6"
                      }`}
                    >

                      {/* COLUNA HORA */}
                      <td
                        className={`text-center border-r border-border ${
                          temAgendamentoNoHorario
                            ? "py-3 text-xs font-semibold text-muted-foreground"
                            : "py-1 text-[10px] text-muted-foreground/50"
                        }`}
                      >
                        {hora}
                      </td>

                      {barbeirosVisiveis.map((barbeiro) => {

                        const agendamento = agendamentos.find(
                          (a) =>
                            a.barbeiroId === barbeiro.id &&
                            a.hora === hora &&
                            a.data === dataFormatada
                        );

                        return (
                          <td
                            key={barbeiro.id}
                            className={`border-r border-border relative ${
                              agendamento ? "p-2 align-top" : "p-0"
                            }`}
                          >

                            {agendamento ? (
                              <button
                              onClick={() => handleAbrirModal(agendamento)}
                              className={`
                                w-full text-left
                                ${statusStyles[agendamento.status]}
                                text-foreground
                                rounded-md px-2 py-1.5
                                text-[11px]
                                transition
                                active:scale-[0.98]
                              `}
                            >
                              <div className="flex items-center justify-between">
                                <p className="font-semibold truncate">
                                  {agendamento.cliente}
                                </p>
                            
                                <span className="text-foreground font-semibold text-[10px]">
                                  R$ {agendamento.valor}
                                </span>
                              </div>
                            
                              <p className="text text-muted-foreground truncate">
                                {agendamento.servico}
                              </p>
                            </button>
                            ) : (
                              <button
                                onClick={() => handleNovoAgendamento(barbeiro.id, hora)}
                                className="
                                  absolute inset-0
                                  flex items-center justify-center
                                  text-muted-foreground/30
                                  hover:text-primary
                                  transition
                                "
                              >
                                <span className="text-[clamp(10px,2vh,18px)] leading-none">
                                  +
                                </span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* 👇 AQUI (FORA DA TABELA) */}
          <ModalAgendamento
              barbeiros={barbeiros}
              modalDetalheOpen={modalDetalheOpen}
              setModalDetalheOpen={setModalDetalheOpen}
              modalNovoOpen={modalNovoOpen}
              setModalNovoOpen={setModalNovoOpen}
              agendamentoSelecionado={agendamentoSelecionado}
              setAgendamentoSelecionado={setAgendamentoSelecionado}
              onSalvarNovo={(novo) => {
                console.log("novo", novo);
              }}
              onEditar={(editado) => {
                console.log("editado", editado);
              }}
              onExcluir={(a) => {
                console.log("excluir", a);
              }}
            />
        </div>
        
      );
}