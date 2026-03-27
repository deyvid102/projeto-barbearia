import express from "express";
import { 
    criarAgendamento, 
    listarAgendamento, 
    listarAgendamentoPorId, 
    listarAgendamentoPorBarbearia, 
    atualizarAgendamento, 
    excluirAgendamento 
} from "../controllers/ControlAgendamento.js";

const router = express.Router();

// Cria novo agendamento (Valida automaticamente conflitos e escala semanal)
router.post("/agendamentos", criarAgendamento);

// Lista com filtros (Ex: ?fk_barbeiro=ID&data=2026-03-27)
router.get("/agendamentos", listarAgendamento); 

// Busca detalhes de um agendamento específico
router.get("/agendamentos/:id", listarAgendamentoPorId);

// Lista todos os agendamentos de uma barbearia (Visão do dono)
router.get("/agendamentos/barbearia/:id", listarAgendamentoPorBarbearia);

// Atualiza agendamento (Se mudar status para 'F', gera comissão automaticamente)
router.put("/agendamentos/:id", atualizarAgendamento);

// Remove agendamento e gera log de cancelamento
router.delete("/agendamentos/:id", excluirAgendamento);

export default router;