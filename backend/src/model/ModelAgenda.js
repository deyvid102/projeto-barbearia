import mongoose from "mongoose";

const ModelAgenda = new mongoose.Schema({
    // FK da barbearia (obrigatório conforme seu padrão)
    fk_barbearia: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'barbearia', 
        required: true 
    },
    // FK do barbeiro que está abrindo a agenda
    fk_barbeiro: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'barbeiro', 
        required: true 
    },
    // Data que o barbeiro vai trabalhar (ex: 2026-03-10)
    data: { 
        type: Date, 
        required: true 
    },
    // Horário de início e fim do turno dele
    abertura: { 
        type: String, 
        required: true, 
        default: "08:00" 
    },
    fechamento: { 
        type: String, 
        required: true, 
        default: "18:00" 
    },
    // Sugestão adicionada: Horários de intervalo (almoço/pausa)
    intervalo_inicio: {
        type: String,
        default: "12:00"
    },
    intervalo_fim: {
        type: String,
        default: "13:00"
    },
    // Status do dia (ex: 'A' para Aberto, 'F' para Fechado/Folga)
    status: {
        type: String,
        enum: ['A', 'F'],
        default: 'A'
    }
}, { 
    timestamps: true,
    collection: 'agendas' 
});

// Índice único para evitar duplicidade: Um barbeiro não pode ter duas agendas no mesmo dia na mesma barbearia
ModelAgenda.index({ fk_barbearia: 1, fk_barbeiro: 1, data: 1 }, { unique: true });

export default mongoose.model('agenda', ModelAgenda);