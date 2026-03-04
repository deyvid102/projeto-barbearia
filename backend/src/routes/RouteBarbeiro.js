import { Router } from "express";
import { 
    criarBarbeiro, 
    listarBarbeiro, 
    listarBarbeiroPorId, 
    atualizarBarbeiro, 
    excluirBarbeiro,
    loginBarbeiro,
    buscarBarbeariaPorBarbeiro // Importação da nova função
} from "../controllers/ControlBarbeiro.js";

const router = Router();

router.post("/barbeiros", criarBarbeiro);
router.get("/barbeiros", listarBarbeiro);
router.get("/barbeiros/:id", listarBarbeiroPorId);
router.put("/barbeiros/:id", atualizarBarbeiro);
router.delete("/barbeiros/:id", excluirBarbeiro);

// Rota para pegar o ID da barbearia através do ID do barbeiro
router.get("/barbeiros/:id/barbearia", buscarBarbeariaPorBarbeiro);

// Nova rota de login
router.post("/barbeiros/login", loginBarbeiro);

export default router;