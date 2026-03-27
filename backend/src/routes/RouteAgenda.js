import express from "express";
import ControlAgenda from "../controllers/ControlAgenda.js";

const router = express.Router();

// --- GESTÃO DA ESCALA SEMANAL ---

// Salva ou atualiza um dia específico na escala (segunda, terça, etc.)
router.post("/agendas", ControlAgenda.salvarDia);

// Sincroniza a escala semanal completa de um barbeiro (substitui todos os dias de uma vez)
router.post("/agendas/sincronizar", ControlAgenda.sincronizarEscala);

// --- LISTAGEM ---

// Lista a escala (aceita query params ?fk_barbearia=ID&fk_barbeiro=ID)
router.get("/agendas", ControlAgenda.listar);

// Busca toda a escala de uma barbearia específica (todos os barbeiros)
router.get("/agendas/barbearia/:id", ControlAgenda.listarPorBarbearia);

// --- REMOÇÃO ---

// Remove um dia específico da escala pelo ID do registro
router.delete("/agendas/:id", ControlAgenda.deletar);

// Limpa toda a escala semanal de um barbeiro específico
router.delete("/agendas/limpar", ControlAgenda.limparEscalaBarbeiro);

export default router;