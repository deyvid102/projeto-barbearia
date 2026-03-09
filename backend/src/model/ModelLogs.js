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
    // ALTERADO: Removido required: true pois o cliente agora é um objeto no agendamento
    // Mantemos o campo caso você ainda use para clientes cadastrados no futuro
    fk_cliente: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'cliente',
        required: false 
    },
    // NOVO: Para salvar o nome do cliente que vem do objeto simples do agendamento
    cliente_nome: {
        type: String
    },
    status_acao: {
        type: String,
        enum: ['A', 'F', 'C'],
        required: true
    },
    canceladoPor: {
        type: String,
        default: null
    },
    finalizadoPor: {
        type: String,
        default: null
    },
    data_log: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: true });

export default mongoose.model('logs', ModelLogs);