import React, { useState } from "react";

// ==========================
// TYPES
// ==========================
export type Agendamento = {
  id?: number;
  cliente: string;
  servico: string;
  valor: number;
  hora: string;
  barbeiroId: number;
  status: "futuro" | "pendente" | "concluido";
};

type Barbeiro = {
  id: number;
  nome: string;
};

type Props = {
  barbeiros: Barbeiro[];

  modalDetalheOpen: boolean;
  setModalDetalheOpen: (v: boolean) => void;

  modalNovoOpen: boolean;
  setModalNovoOpen: (v: boolean) => void;

  agendamentoSelecionado: Agendamento | null;
  setAgendamentoSelecionado: (a: Agendamento | null) => void;

  onSalvarNovo: (novo: Agendamento) => void;
  onEditar: (editado: Agendamento) => void;
  onExcluir: (agendamento: Agendamento) => void;
};

// ==========================
// MODAL BASE
// ==========================
const ModalBase = ({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-2xl p-6 animate-in fade-in zoom-in-95">

        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

const inputClass =
  "w-full h-10 px-3 rounded-lg border border-border bg-background/70 focus:outline-none focus:ring-2 focus:ring-primary text-sm";

// ==========================
// COMPONENTE PRINCIPAL
// ==========================
export default function ModalAgendamento({
  barbeiros,
  modalDetalheOpen,
  setModalDetalheOpen,
  modalNovoOpen,
  setModalNovoOpen,
  agendamentoSelecionado,
  setAgendamentoSelecionado,
  onSalvarNovo,
  onEditar,
  onExcluir,
}: Props) {
  // ==========================
  // STATE - NOVO
  // ==========================
  const [novo, setNovo] = useState<Agendamento>({
    cliente: "",
    servico: "",
    valor: 0,
    hora: "",
    barbeiroId: 0,
    status: "futuro",
  });

  // ==========================
  // STATE - EDIÇÃO
  // ==========================
  const [editando, setEditando] = useState<Agendamento | null>(null);
  const [modoEdicao, setModoEdicao] = useState(false);

  // ==========================
  // ABRIR EDIÇÃO
  // ==========================
  React.useEffect(() => {
    if (agendamentoSelecionado) {
      setEditando(agendamentoSelecionado);
    }
  }, [agendamentoSelecionado]);

  // ==========================
  // HANDLERS
  // ==========================
  const handleSalvarNovo = () => {
    onSalvarNovo(novo);
    setModalNovoOpen(false);

    setNovo({
      cliente: "",
      servico: "",
      valor: 0,
      hora: "",
      barbeiroId: 0,
      status: "futuro",
    });
  };

  const handleEditar = () => {
    if (!editando) return;

    onEditar(editando);
    setModalDetalheOpen(false);
  };

  const handleExcluir = () => {
    if (!editando) return;

    onExcluir(editando);
    setModalDetalheOpen(false);
  };

  // ==========================
  // JSX
  // ==========================
  return (
    <>
      {/* ==========================
          MODAL NOVO
      ========================== */}
      <ModalBase open={modalNovoOpen} onClose={() => setModalNovoOpen(false)}>
        <div className="space-y-5">

          {/* Header */}
          <div>
            <h2 className="text-xl font-semibold">Novo Agendamento</h2>
            <p className="text-sm text-muted-foreground">
              Preencha os dados do cliente
            </p>
          </div>

          {/* Inputs */}
          <div className="space-y-3">

            <input
              type="text"
              placeholder="Nome do cliente"
              value={novo.cliente}
              onChange={(e) => setNovo({ ...novo, cliente: e.target.value })}
              className={inputClass}
            />

            <input
              type="text"
              placeholder="Serviço"
              value={novo.servico}
              onChange={(e) => setNovo({ ...novo, servico: e.target.value })}
              className={inputClass}
            />

            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Valor"
                value={novo.valor}
                onChange={(e) =>
                  setNovo({ ...novo, valor: Number(e.target.value) })
                }
                className={inputClass}
              />

              <input
                type="time"
                value={novo.hora}
                onChange={(e) =>
                  setNovo({ ...novo, hora: e.target.value })
                }
                className={inputClass}
              />
            </div>

            <select
              value={novo.barbeiroId}
              onChange={(e) =>
                setNovo({ ...novo, barbeiroId: Number(e.target.value) })
              }
              className={inputClass}
            >
              <option value={0}>Selecione o barbeiro</option>
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Footer */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={() => setModalNovoOpen(false)}
              className="flex-1 h-10 rounded-lg border border-border text-sm hover:bg-muted transition"
            >
              Cancelar
            </button>

            <button
              onClick={handleSalvarNovo}
              className="flex-1 h-10 rounded-lg bg-primary text-white text-sm font-medium hover:opacity-90 transition"
            >
              Salvar
            </button>
          </div>
        </div>
      </ModalBase>

      {/* ==========================
          MODAL DETALHE / EDIÇÃO
      ========================== */}
      <ModalBase
        open={modalDetalheOpen}
        onClose={() => {
          setModoEdicao(false);
          setModalDetalheOpen(false);
        }}
      >
        {editando && (
          <div className="space-y-5">

            {/* HEADER */}
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">
                {modoEdicao ? "Editar Agendamento" : "Detalhes do Agendamento"}
              </h2>

              {/* STATUS */}
              <span
                className={`
                  px-3 py-1 rounded-full text-xs font-medium
                  ${editando.status === "futuro" && "bg-blue-500/20 text-blue-500"}
                  ${editando.status === "pendente" && "bg-yellow-500/20 text-yellow-500"}
                  ${editando.status === "concluido" && "bg-green-500/20 text-green-500"}
                `}
              >
                {editando.status}
              </span>
            </div>

            {/* =========================
                VISUALIZAÇÃO
            ========================= */}
            {!modoEdicao && (
              <div className="space-y-3 text-sm">

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Cliente</span>
                  <span className="font-medium">{editando.cliente}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Serviço</span>
                  <span className="font-medium">{editando.servico}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Valor</span>
                  <span className="font-semibold text-primary">
                    R$ {editando.valor}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Horário</span>
                  <span className="font-medium">{editando.hora}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-muted-foreground">Barbeiro</span>
                  <span className="font-medium">
                    {barbeiros.find(b => b.id === editando.barbeiroId)?.nome}
                  </span>
                </div>
              </div>
            )}

            {/* =========================
                EDIÇÃO
            ========================= */}
            {modoEdicao && (
              <div className="space-y-3">

                <input
                  type="text"
                  value={editando.cliente}
                  onChange={(e) =>
                    setEditando({ ...editando, cliente: e.target.value })
                  }
                  className={inputClass}
                />

                <input
                  type="text"
                  value={editando.servico}
                  onChange={(e) =>
                    setEditando({ ...editando, servico: e.target.value })
                  }
                  className={inputClass}
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    value={editando.valor}
                    onChange={(e) =>
                      setEditando({
                        ...editando,
                        valor: Number(e.target.value),
                      })
                    }
                    className={inputClass}
                  />

                  <input
                    type="time"
                    value={editando.hora}
                    onChange={(e) =>
                      setEditando({ ...editando, hora: e.target.value })
                    }
                    className={inputClass}
                  />
                </div>

                <select
                  value={editando.barbeiroId}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      barbeiroId: Number(e.target.value),
                    })
                  }
                  className={inputClass}
                >
                  {barbeiros.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.nome}
                    </option>
                  ))}
                </select>

                <select
                  value={editando.status}
                  onChange={(e) =>
                    setEditando({
                      ...editando,
                      status: e.target.value as Agendamento["status"],
                    })
                  }
                  className={inputClass}
                >
                  <option value="futuro">Futuro</option>
                  <option value="pendente">Pendente</option>
                  <option value="concluido">Concluído</option>
                </select>
              </div>
            )}

            {/* =========================
                FOOTER
            ========================= */}
            <div className="flex gap-2 pt-3">

              {!modoEdicao ? (
                <>
                  {/* WhatsApp */}
                  <button
                    onClick={() => {
                      console.log("Enviar mensagem futuramente");
                    }}
                    className="flex-1 h-10 rounded-lg border bg-green-800 text-sm hover:bg-muted"
                  >
                    💬 Mensagem
                  </button>

                  {/* Excluir */}
                  <button
                    onClick={handleExcluir}
                    className="flex-1 h-10 rounded-lg bg-destructive text-white text-sm"
                  >
                    Excluir
                  </button>

                  {/* Editar */}
                  <button
                    onClick={() => setModoEdicao(true)}
                    className="flex-1 h-10 rounded-lg bg-primary text-white text-sm"
                  >
                    Editar
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setModoEdicao(false)}
                    className="flex-1 h-10 rounded-lg border border-border text-sm"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={() => {
                      handleEditar();
                      setModoEdicao(false);
                    }}
                    className="flex-1 h-10 rounded-lg bg-primary text-white text-sm"
                  >
                    Salvar
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </ModalBase>
    </>
  );
}