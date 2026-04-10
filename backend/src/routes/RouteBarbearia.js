import { Router } from "express";
import ControlBarbearia from "../controllers/ControlBarbearia.js";

const RouteBarbearia = new Router();

// Rota de criação
RouteBarbearia.post("/barbearias", ControlBarbearia.criar);

// Rota de listagem total
RouteBarbearia.get("/barbearias", ControlBarbearia.listar);

// Rota de perfil
RouteBarbearia.get("/barbearias/perfil/:perfil", ControlBarbearia.listarPorPerfil);

// Rotas por ID
RouteBarbearia.get("/barbearias/:id", ControlBarbearia.listarPorId);

// ROTA PARA BUSCAR OS BARBEIROS DA BARBEARIA PELO ID DELA
RouteBarbearia.get("/barbearias/:id/barbeiros", ControlBarbearia.listarBarbeiros);

RouteBarbearia.put("/barbearias/:id", ControlBarbearia.atualizar);
RouteBarbearia.delete("/barbearias/:id", ControlBarbearia.deletar);

export default RouteBarbearia;