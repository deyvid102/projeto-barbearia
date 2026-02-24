import mongoose from "mongoose";

const ModelBarbearia = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true 
    },
    // Array de objetos para armazenar os serviços da unidade
    servicos: [{
        nome: { type: String, required: true },
        valor: { type: Number,max: 999.99,  required: true }
    }]
}, { 
    timestamps: true,
    collection: 'barbearias' 
});

export default mongoose.model('barbearia', ModelBarbearia);