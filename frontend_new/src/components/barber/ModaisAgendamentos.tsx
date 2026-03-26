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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-card w-full max-w-md rounded-xl p-5 shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          ✕
        </button>

        {children}
      </div>
    </div>
  );
};

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
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Novo Agendamento</h2>

          <input
            type="text"
            placeholder="Nome do cliente"
            value={novo.cliente}
            onChange={(e) =>
              setNovo({ ...novo, cliente: e.target.value })
            }
            className="w-full p-2 border rounded-lg bg-background"
          />

          <input
            type="text"
            placeholder="Serviço"
            value={novo.servico}
            onChange={(e) =>
              setNovo({ ...novo, servico: e.target.value })
            }
            className="w-full p-2 border rounded-lg bg-background"
          />

          <input
            type="number"
            placeholder="Valor"
            value={novo.valor}
            onChange={(e) =>
              setNovo({ ...novo, valor: Number(e.target.value) })
            }
            className="w-full p-2 border rounded-lg bg-background"
          />

          <select
            value={novo.barbeiroId}
            onChange={(e) =>
              setNovo({ ...novo, barbeiroId: Number(e.target.value) })
            }
            className="w-full p-2 border rounded-lg bg-background"
          >
            <option value={0}>Selecione o barbeiro</option>
            {barbeiros.map((b) => (
              <option key={b.id} value={b.id}>
                {b.nome}
              </option>
            ))}
          </select>

          <input
            type="time"
            value={novo.hora}
            onChange={(e) =>
              setNovo({ ...novo, hora: e.target.value })
            }
            className="w-full p-2 border rounded-lg bg-background"
          />

          <button
            onClick={handleSalvarNovo}
            className="w-full bg-primary text-white py-2 rounded-lg"
          >
            Salvar
          </button>
        </div>
      </ModalBase>

      {/* ==========================
          MODAL DETALHE / EDIÇÃO
      ========================== */}
      <ModalBase
        open={modalDetalheOpen}
        onClose={() => setModalDetalheOpen(false)}
      >
        {editando && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Editar Agendamento</h2>

            <input
              type="text"
              value={editando.cliente}
              onChange={(e) =>
                setEditando({ ...editando, cliente: e.target.value })
              }
              className="w-full p-2 border rounded-lg bg-background"
            />

            <input
              type="text"
              value={editando.servico}
              onChange={(e) =>
                setEditando({ ...editando, servico: e.target.value })
              }
              className="w-full p-2 border rounded-lg bg-background"
            />

            <input
              type="number"
              value={editando.valor}
              onChange={(e) =>
                setEditando({
                  ...editando,
                  valor: Number(e.target.value),
                })
              }
              className="w-full p-2 border rounded-lg bg-background"
            />

            <select
              value={editando.barbeiroId}
              onChange={(e) =>
                setEditando({
                  ...editando,
                  barbeiroId: Number(e.target.value),
                })
              }
              className="w-full p-2 border rounded-lg bg-background"
            >
              {barbeiros.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nome}
                </option>
              ))}
            </select>

            <input
              type="time"
              value={editando.hora}
              onChange={(e) =>
                setEditando({ ...editando, hora: e.target.value })
              }
              className="w-full p-2 border rounded-lg bg-background"
            />

            <select
              value={editando.status}
              onChange={(e) =>
                setEditando({
                  ...editando,
                  status: e.target.value as Agendamento["status"],
                })
              }
              className="w-full p-2 border rounded-lg bg-background"
            >
              <option value="futuro">Futuro</option>
              <option value="pendente">Pendente</option>
              <option value="concluido">Concluído</option>
            </select>

            <div className="flex gap-2">
              <button
                onClick={handleEditar}
                className="flex-1 bg-primary text-white py-2 rounded-lg"
              >
                Salvar
              </button>

              <button
                onClick={handleExcluir}
                className="flex-1 bg-destructive text-white py-2 rounded-lg"
              >
                Excluir
              </button>
            </div>
          </div>
        )}
      </ModalBase>
    </>
  );
}