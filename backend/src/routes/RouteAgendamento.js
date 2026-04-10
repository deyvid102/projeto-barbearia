import express from "express";
import ControlAgendamento from "../controllers/ControlAgendamento.js";

const router = express.Router();

// --- 1. CONSULTAS ESPECÍFICAS (Sempre antes das rotas com :id) ---

// Busca horários livres (15 em 15 min)
router.get("/agendamentos/disponibilidade", ControlAgendamento.obterDisponibilidade);

// Lista agendamentos do dia para o calendário
router.get("/agendamentos/:id", ControlAgendamento.listarPorData); 

// --- 2. OPERAÇÕES CRUD ---

// Cria novo agendamento
router.post("/agendamentos", ControlAgendamento.criar);

// Busca detalhes de um ID específico
router.get("/agendamentos/:id", ControlAgendamento.buscarPorId);

// Atualiza dados completos
router.put("/agendamentos/:id", ControlAgendamento.atualizar);

// Altera apenas status (Patch é mais semântico para isso)
router.patch("/agendamentos/:id/status", ControlAgendamento.alterarStatus);

// Remove do banco
router.delete("/agendamentos/:id", ControlAgendamento.deletar);

export default router;