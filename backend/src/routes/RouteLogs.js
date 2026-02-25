import express from "express";
import { buscarLogsPorBarbearia } from "../controllers/ControlLogs.js";

const router = express.Router();

// Rota para o admin visualizar todos os logs de uma barbearia específica
router.get("/logs/:id_barbearia", buscarLogsPorBarbearia);

export default router;