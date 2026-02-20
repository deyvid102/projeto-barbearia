import express from "express";
import { 
    criarCliente, 
    listarCliente, 
    listarClientePorId, 
    atualizarCliente, 
    excluirCliente 
} from "../controllers/ControlCliente.js";

const router = express.Router();

router.post("/clientes", criarCliente);
router.get("/clientes", listarCliente);
router.get("/clientes/:id", listarClientePorId);
router.put("/clientes/:id", atualizarCliente);
router.delete("/clientes/:id", excluirCliente);

export default router;