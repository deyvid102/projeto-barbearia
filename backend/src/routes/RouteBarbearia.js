import { Router } from "express";
import ControlBarbearia from "../controllers/ControlBarbearia.js";

const RouteBarbearia = new Router();

RouteBarbearia.post("/barbearias", ControlBarbearia.criar);
RouteBarbearia.get("/barbearias", ControlBarbearia.listar);
RouteBarbearia.get("/barbearias/:id", ControlBarbearia.listarPorId);
RouteBarbearia.put("/barbearias/:id", ControlBarbearia.atualizar);
RouteBarbearia.delete("/barbearias/:id", ControlBarbearia.deletar);

export default RouteBarbearia;