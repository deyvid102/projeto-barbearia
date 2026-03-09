import mongoose from "mongoose";

const ModelFinanceiro = new mongoose.Schema({
    fk_agendamento: { type: mongoose.Schema.Types.ObjectId, ref: 'agendamento', required: true },
    fk_barbeiro: { type: mongoose.Schema.Types.ObjectId, ref: 'barbeiro', required: true },
    fk_barbearia: { type: mongoose.Schema.Types.ObjectId, ref: 'barbearia', required: true },
    valor_total: { type: Number, required: true },
    porcentagem_aplicada: { type: Number, required: true },
    valor_barbeiro: { type: Number, required: true },
    valor_barbearia: { type: Number, required: true }
}, { 
    timestamps: true,
    collection: 'financeiro'
});

export default mongoose.model('financeiro', ModelFinanceiro);