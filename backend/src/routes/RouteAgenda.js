import express from "express";
import ControlAgenda from "../controllers/ControlAgenda.js";

const router = express.Router();

// --- 1. CONSULTAS DE DISPONIBILIDADE (Prioridade Alta) ---

// Esta rota deve vir antes de rotas com :id para evitar conflitos de nomenclatura
router.get("/agendas/disponibilidade", ControlAgenda.obterDisponibilidade);

// --- 2. GESTÃO DA GRADE (Criação e Replicação) ---

// Salva ou atualiza a grade completa (UPSERT)
router.post("/agendas", ControlAgenda.salvarGrade);

// Replicar uma grade para a barbearia toda
router.post("/agendas/replicar", ControlAgenda.replicarGradeGeral);

// --- 3. LISTAGEM E BUSCA ---

// Busca a grade de um barbeiro específico
router.get("/agendas/barbeiro/:idBarbeiro", ControlAgenda.buscarPorBarbeiro);

// Busca todas as grades de uma barbearia
router.get("/agendas/barbearia/:idBarbearia", ControlAgenda.listarPorBarbearia);

// --- 4. ATUALIZAÇÕES PONTUAIS E REMOÇÃO ---

// Alterna apenas o status (ativo/fechado) de um dia
router.patch("/agendas/status-dia", ControlAgenda.alternarStatusDia);

// Remove a configuração de agenda completa por ID do documento
router.delete("/agendas/:id", ControlAgenda.excluirAgenda);

export default router;