import express from "express";
import { 
    criarAgendamento, 
    listarAgendamento, 
    listarAgendamentoPorId, 
    atualizarAgendamento, 
    excluirAgendamento 
} from "../controllers/ControlAgendamento.js";

const router = express.Router();

router.post("/agendamentos", criarAgendamento);
router.get("/agendamentos", listarAgendamento);
router.get("/agendamentos/:id", listarAgendamentoPorId);
router.put("/agendamentos/:id", atualizarAgendamento);
router.delete("/agendamentos/:id", excluirAgendamento);

export default router;