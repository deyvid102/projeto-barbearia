import mongoose from "mongoose";

const ModelLogs = new mongoose.Schema({
    fk_barbearia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'barbearia',
        required: true,
        index: true
    },
    fk_barbeiro: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'barbeiro',
        required: true
    },
    fk_agendamento: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'agendamento',
        required: true
    },
    fk_cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cliente',
        required: true
    },
    // Aqui capturamos o status ('A', 'F' ou 'C') vindo do agendamento
    status_acao: {
        type: String,
        enum: ['A', 'F', 'C'],
        required: true
    },
    // Data e hora exata em que o barbeiro realizou a ação
    data_log: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

export default mongoose.model('logs', ModelLogs);