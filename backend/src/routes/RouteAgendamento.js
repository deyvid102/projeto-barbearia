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

// Rota para criar um novo agendamento (Agora com objeto cliente no body)
router.post("/agendamentos", criarAgendamento);

// Lista todos (aceita query params ?fk_barbearia=ID&data=YYYY-MM-DD)
router.get("/agendamentos", listarAgendamento); 

// Lista um agendamento específico
router.get("/agendamentos/:id", listarAgendamentoPorId);

// Lista todos os agendamentos de uma barbearia específica
router.get("/agendamentos/barbearia/:id", listarAgendamentoPorBarbearia);

// Atualiza dados ou status (dispara o financeiro se o status for para 'F')
router.put("/agendamentos/:id", atualizarAgendamento);

// Deleta o agendamento
router.delete("/agendamentos/:id", excluirAgendamento);

export default router;