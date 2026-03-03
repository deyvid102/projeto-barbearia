import express from "express";
import ControlAgenda from "../controllers/ControlAgenda.js";

const router = express.Router();

// Busca as agendas (já existente)
router.get("/agendas", ControlAgenda.listar);

// Rota que o seu frontend está chamando (api.post("/agendas"))
router.post("/agendas", ControlAgenda.criar); 

// Rota para deletar um dia da agenda
router.delete("/agendas/:id", ControlAgenda.deletar);

// Rota de sincronização em massa (já existente)
router.post("/agendas/sincronizar", ControlAgenda.sincronizar);

export default router;