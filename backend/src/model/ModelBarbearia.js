import mongoose from "mongoose";

const ModelBarbearia = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true 
    },
    servicos: [{
        nome: { type: String, required: true },
        valor: { type: Number, max: 999.99, required: true },
        tempo: { type: Number, required: true } 
    }],
    // Horário padrão da barbearia (opcional, serve como base/sugestão)
    horarios_padrao: [{
        // Sugestão adicionada: min e max para garantir que é um dia da semana válido
        dia: { type: Number, required: true, min: 0, max: 6 }, // 0=Domingo, 6=Sábado
        ativo: { type: Boolean, default: true },
        abertura: { type: String, default: "08:00" },
        fechamento: { type: String, default: "18:00" }
    }]
}, { 
    timestamps: true,
    collection: 'barbearias' 
});

export default mongoose.model('barbearia', ModelBarbearia);