import mongoose from "mongoose";

const ModelBarbearia = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true 
    },
    // Array de objetos para armazenar os serviços da unidade
    servicos: [{
        nome: { type: String, required: true },
        valor: { type: Number, max: 999.99, required: true }
    }],
    // Horários padrão de funcionamento
    horarios: [{
        dia: { type: Number, required: true }, // 0 (Dom) a 6 (Sab)
        ativo: { type: Boolean, default: true },
        abertura: { type: String, default: "08:00" },
        fechamento: { type: String, default: "18:00" }
    }],
    // --- ADICIONADO PARA O FUNCIONAMENTO DA AGENDA MENSAL ---
    agenda_detalhada: {
        mes: { type: Number },
        ano: { type: Number },
        grade: { type: Array, default: [] } 
    }
    // -------------------------------------------------------
}, { 
    timestamps: true,
    collection: 'barbearias' 
});

export default mongoose.model('barbearia', ModelBarbearia);