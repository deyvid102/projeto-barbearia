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
    // Agora o horário é fixo e direto na raiz do objeto
    abertura: { type: String, default: "08:00" },
    fechamento: { type: String, default: "18:00" }
}, { 
    timestamps: true,
    collection: 'barbearias' 
});

export default mongoose.model('barbearia', ModelBarbearia);