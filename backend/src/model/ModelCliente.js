
import mongoose from "mongoose";

const ModelCliente = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    numero: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    }
    
}, { timestamps: true });

export default mongoose.model('cliente', ModelCliente);
