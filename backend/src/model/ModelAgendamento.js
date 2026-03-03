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
    // Sugestão adicionada: Data e hora de FIM (facilita muito a query de checagem de conflitos)
    datahora_fim: {
        type: Date,
        required: true
    },
    // Tempo estimado para o serviço (vindo do ModelBarbearia.servicos.tempo)
    tempo_estimado: {
        type: Number, // em minutos
        required: true
    },
    valor: {
        type: Number,
        max: 999.99, 
        set: v => parseFloat(v.toFixed(2)) 
    },
    status: {
        type: String,
        enum: ['A', 'F', 'C'], // A: Agendado, F: Finalizado, C: Cancelado
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

// Sugestão adicionada: Índice para buscar a agenda do barbeiro de forma rápida
ModelAgendamento.index({ fk_barbeiro: 1, datahora: 1 });

export default mongoose.model('agendamento', ModelAgendamento);