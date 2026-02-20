import express from "express";
import { 
    criarBarbeiro, 
    listarBarbeiro, 
    listarBarbeiroPorId, 
    atualizarBarbeiro, 
    excluirBarbeiro 
} from "../controllers/ControlBarbeiro.js";

const router = express.Router();

// Rotas para a coleção de barbeiros
// Verifique se o frontend está chamando exatamente estas URLs
router.post("/barbeiros", criarBarbeiro);
router.get("/barbeiros", listarBarbeiro); // Esta é a rota que popula o seu select
router.get("/barbeiros/:id", listarBarbeiroPorId);
router.put("/barbeiros/:id", atualizarBarbeiro);
router.delete("/barbeiros/:id", excluirBarbeiro);

export default router;