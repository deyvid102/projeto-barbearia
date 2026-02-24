import { Router } from "express";
import { 
    criarBarbeiro, 
    listarBarbeiro, 
    listarBarbeiroPorId, 
    atualizarBarbeiro, 
    excluirBarbeiro,
    loginBarbeiro // Adicione esta importação
} from "../controllers/ControlBarbeiro.js"; // Verifique se o nome do arquivo está correto

const router = Router();

router.post("/barbeiros", criarBarbeiro);
router.get("/barbeiros", listarBarbeiro);
router.get("/barbeiros/:id", listarBarbeiroPorId);
router.put("/barbeiros/:id", atualizarBarbeiro);
router.delete("/barbeiros/:id", excluirBarbeiro);

// Nova rota de login
router.post("/barbeiros/login", loginBarbeiro);

export default router;