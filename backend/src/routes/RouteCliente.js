import express from "express";
import { 
    criarCliente, 
    listarCliente, 
    listarClientePorId, 
    atualizarCliente, 
    excluirCliente,
    loginCliente // Importação da nova função de login
} from "../controllers/ControlCliente.js";

const router = express.Router();

// Rota de autenticação (Login)
router.post("/clientes/login", loginCliente);

// Rotas de CRUD
router.post("/clientes", criarCliente);
router.get("/clientes", listarCliente);
router.get("/clientes/:id", listarClientePorId);
router.put("/clientes/:id", atualizarCliente);
router.delete("/clientes/:id", excluirCliente);

export default router;