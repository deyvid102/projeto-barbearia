import mongoose from "mongoose";

const ModelBarbeariaSchema = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true 
    },
    // Identificador do Layout (Ex: 'padrao', 'retro', 'moderno', 'premium_1')
    layout_key: {
        type: String,
        default: "padrao",
        trim: true
    },
    whatsapp: {
        type: String,
        trim: true
    },
    endereco: {
        type: String,
        trim: true
    },
    instagram: {
        type: String,
        trim: true
    },
    fotos: {
        type: [String],
        validate: {
            validator: function(v) {
                return v.length <= 3;
            },
            message: 'O limite máximo é de 3 fotos.'
        },
        default: []
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