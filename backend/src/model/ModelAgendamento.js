
import mongoose from "mongoose";

const ModelAgendamento = new mongoose.Schema({
    tipoCorte: {
        type: String,
        required:true
    },
    datahora: {
        type: Date,
        required: true,
        index: true
    },
    valor: {
    type: Number,
    max: 999.99, 
    set: v => parseFloat(v.toFixed(2)) 
    },
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
    
}, { timestamps: true });

export default mongoose.model('agendamento', ModelAgendamento);
