import mongoose from "mongoose";

const ModelBarbeiro = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    senha: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false,
    }
}, { 
    timestamps: true,
    // Isso aqui ignora a pluralização automática do Mongoose e foca na coleção real
    collection: 'barbeiros' 
});

// Use o nome no singular aqui, pois a linha 'collection' acima já manda no banco
export default mongoose.model('barbeiro', ModelBarbeiro);