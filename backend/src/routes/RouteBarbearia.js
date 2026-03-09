import { Router } from "express";
import ControlBarbearia from "../controllers/ControlBarbearia.js";

const RouteBarbearia = new Router();

// Rota de criação
RouteBarbearia.post("/barbearias", ControlBarbearia.criar);

// Rota de listagem total
RouteBarbearia.get("/barbearias", ControlBarbearia.listar);

// Rota de perfil - DEVE vir antes das rotas com :id
// Agora o frontend pode chamar /barbearias/perfil/barbeariaadmin 
RouteBarbearia.get("/barbearias/perfil/:perfil", ControlBarbearia.listarPorPerfil);

// Rotas por ID
RouteBarbearia.get("/barbearias/:id", ControlBarbearia.listarPorId);
RouteBarbearia.put("/barbearias/:id", ControlBarbearia.atualizar);
RouteBarbearia.delete("/barbearias/:id", ControlBarbearia.deletar);

export default RouteBarbearia;