import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";

// Carrega as variáveis do .env que está na raiz
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());

// Conexão com o banco
const connectDB = async () => {
    try {
        const uri = process.env.MONGO_URI;
        if (!uri) {
            console.error("❌ ERRO: MONGO_URI não encontrada no arquivo .env");
            return;
        }
        await mongoose.connect(uri);
        console.log('✅ Conectado ao mongoDB com sucesso!');
    } catch (error) {
        console.error('❌ ERRO ao conectar com mongoDB:', error.message);
    }
};

connectDB();

app.get("/", (req, res) => {
    res.send("Servidor da Barbearia rodando corretamente via pasta src!");
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em: http://localhost:${PORT}`);
});