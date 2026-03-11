import express from "express";
import ControlAgenda from "../controllers/ControlAgenda.js";

const router = express.Router();

// --- LISTAGEM ---

// Busca todas as agendas (Geral)
router.get("/agendas", ControlAgenda.listar);

// NOVA ROTA: Busca agendas filtradas por uma barbearia específica
// Opcional: Você também pode tratar isso dentro do ControlAgenda.listar via query params (?fk_barbearia=ID)
router.get("/agendas/barbearia/:id", ControlAgenda.listarPorBarbearia);


// --- OPERAÇÕES ---

// Cria um novo registro de agenda (O frontend envia data, horários e FKs no body)
router.post("/agendas", ControlAgenda.criar); 

// Deleta um registro específico da agenda pelo ID
router.delete("/agendas/:id", ControlAgenda.deletar);


// --- SINCRONIZAÇÃO E MASSA ---

// Rota de sincronização em massa (usada para automação de múltiplos dias)
router.post("/agendas/sincronizar", ControlAgenda.sincronizar);

// Rota para limpar/resetar agenda de uma barbearia em um período (útil para re-processar automação)
router.delete("/agendas/barbearia/:id/limpar", ControlAgenda.limparPeriodo);

export default router;