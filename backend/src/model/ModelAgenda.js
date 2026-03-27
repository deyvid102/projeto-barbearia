import mongoose from "mongoose";

const ModelAgenda = new mongoose.Schema({
    // FK da barbearia
    fk_barbearia: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'barbearia', 
        required: true 
    },
    // FK do barbeiro
    fk_barbeiro: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'barbeiro', 
        required: true 
    },
    // Dia da semana (0 = Domingo, 1 = Segunda, etc.)
    dia_semana: { 
        type: Number, 
        required: true,
        min: 0,
        max: 6
    },
    // Horário de funcionamento do barbeiro no dia
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
    // Configuração de intervalo
    tem_intervalo: {
        type: Boolean,
        default: true
    },
    intervalo_inicio: {
        type: String,
        default: "12:00"
    },
    intervalo_fim: {
        type: String,
        default: "13:00"
    },
    // Status para permitir desativar um dia específico da escala
    status: {
        type: String,
        enum: ['A', 'F'], // A = Ativo, F = Folga/Inativo
        default: 'A'
    }
}, { 
    timestamps: true,
    collection: 'agendas' 
});

// Índice único: Um barbeiro só pode ter UMA configuração de horário para cada dia da semana naquela barbearia
ModelAgenda.index({ fk_barbearia: 1, fk_barbeiro: 1, dia_semana: 1 }, { unique: true });

export default mongoose.model('agenda', ModelAgenda);