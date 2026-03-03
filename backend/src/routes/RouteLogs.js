import express from "express";
import { buscarLogsPorBarbearia } from "../controllers/ControlLogs.js";

const router = express.Router();

// Mudamos de "/logs/:id_barbearia" para "/logs/barbearia/:id_barbearia"
router.get("/logs/barbearia/:id_barbearia", buscarLogsPorBarbearia);

export default router;