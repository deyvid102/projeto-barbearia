import express from "express";
import { 
    criarAgendamento, 
    listarAgendamento, 
    listarAgendamentoPorId, 
    listarAgendamentoPorBarbearia, // Nova função importada
    atualizarAgendamento, 
    excluirAgendamento 
} from "../controllers/ControlAgendamento.js";

const router = express.Router();

// CREATE
router.post("/agendamentos", criarAgendamento);

// READ
router.get("/agendamentos", listarAgendamento); // Suporta query params: ?fk_barbearia=ID&data=YYYY-MM-DD
router.get("/agendamentos/:id", listarAgendamentoPorId);
router.get("/agendamentos/barbearia/:id", listarAgendamentoPorBarbearia); // Rota específica para o Admin

// UPDATE
router.put("/agendamentos/:id", atualizarAgendamento);

// DELETE
router.delete("/agendamentos/:id", excluirAgendamento);

export default router;