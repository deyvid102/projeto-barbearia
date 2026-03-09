import mongoose from "mongoose";

const ModelBarbeariaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true 
    },
    servicos: [{
        nome: { type: String, required: true },
        valor: { type: Number, max: 999.99, required: true },
        tempo: { type: Number, required: true } 
    }],
    abertura: { type: String, default: "08:00" },
    fechamento: { type: String, default: "18:00" }
}, { 
    timestamps: true,
    collection: 'barbearias' 
});

export default mongoose.model('barbearia', ModelBarbeariaSchema);