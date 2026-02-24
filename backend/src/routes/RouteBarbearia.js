import { Router } from "express";
import ControlBarbearia from "../controllers/ControlBarbearia.js";

const RouteBarbearia = new Router();

// CRIAR
RouteBarbearia.post("/barbearias", ControlBarbearia.criar);

// LISTAR TODAS
RouteBarbearia.get("/barbearias", ControlBarbearia.listar);

// BUSCAR POR ID (Essencial para carregar os serviços de uma unidade específica)
RouteBarbearia.get("/barbearias/:id", ControlBarbearia.listarPorId);

// ATUALIZAR (Usada para salvar o array de serviços dentro da barbearia)
RouteBarbearia.put("/barbearias/:id", ControlBarbearia.atualizar);

// DELETAR
RouteBarbearia.delete("/barbearias/:id", ControlBarbearia.deletar);

export default RouteBarbearia;