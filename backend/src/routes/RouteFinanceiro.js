import express from "express";
import ControlFinanceiro from "../controllers/ControlFinanceiro.js";

const router = express.Router();

// Rota para ver todos os ganhos da barbearia
router.get("/financeiro/:fk_barbearia", ControlFinanceiro.listarPorBarbearia);

// Rota para ver o total somado (útil para o Dashboard)
router.get("/financeiro/resumo/:fk_barbearia", ControlFinanceiro.obterResumo);

export default router;