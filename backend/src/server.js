import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Importação das Rotas
import rotaClientes from "./routes/RouteCliente.js";
import rotaAgendamento from "./routes/RouteAgendamento.js";
import rotaBarbeiro from "./routes/routeBarbeiro.js";
import RouteBarbearia from "./routes/RouteBarbearia.js";
import RouteLogs from "./routes/RouteLogs.js"; 
import RouteAgenda from "./routes/RouteAgenda.js"; // 1. Nova importação da rota de Agenda

// Carrega as variáveis do .env
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Configuração das Rotas no Express
app.use("/", rotaClientes);
app.use("/", rotaBarbeiro);
app.use("/", rotaAgendamento);
app.use("/", RouteBarbearia);
app.use("/", RouteLogs);
app.use("/", RouteAgenda); // 2. Registro da nova rota de Agenda

// Conexão com o banco
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("❌ erro: MONGO_URI não encontrada no arquivo .env");
            return;
        }
        await mongoose.connect(uri);
        console.log('✅ conectado ao mongoDB com sucesso!');
    } catch (error) {
        console.error('❌ erro ao conectar com mongoDB:', error.message);
    }
};

connectDB();

app.get("/", (req, res) => {
    res.send("servidor da barbearia rodando corretamente via pasta src!");
});

app.listen(PORT, () => {
    console.log(`🚀 servidor rodando em: http://localhost:${PORT}`);
});