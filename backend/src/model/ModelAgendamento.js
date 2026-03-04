import mongoose from "mongoose";

const ModelAgendamento = new mongoose.Schema({
    tipoCorte: {
        type: String,
        required: true
    },
    // Data e hora de INÍCIO do agendamento
    datahora: {
        type: Date,
        required: true,
        index: true
    },
    // Data e hora de FIM (importante para evitar sobreposição)
    datahora_fim: {
        type: Date,
        required: true
    },
    // Tempo estimado para o serviço (em minutos)
    tempo_estimado: {
        type: Number, 
        required: true
    },
    valor: {
        type: Number,
        max: 999.99, 
        set: v => parseFloat(v.toFixed(2)) 
    },
    // Status sincronizado com o ModelLogs (A: Agendado, F: Finalizado, C: Cancelado)
    status: {
        type: String,
        enum: ['A', 'F', 'C'], 
        default: 'A',
    },
    fk_cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "cliente",
        required: true
    },
    fk_barbeiro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "barbeiro",
        required: true
    },
    fk_barbearia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'barbearia',
        required: true
    }
}, { 
    timestamps: true,
    collection: 'agendamentos'
});

// Índice para busca rápida de conflitos e agenda
ModelAgendamento.index({ fk_barbeiro: 1, datahora: 1 });

export default mongoose.model('agendamento', ModelAgendamento);