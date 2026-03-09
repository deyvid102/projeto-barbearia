import mongoose from "mongoose";
import bcrypt from "bcrypt";

const ModelBarbeiro = new mongoose.Schema({
    nome: { type: String, required: true, trim: true },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^\S+@\S+\.\S+$/, 'Por favor, insira um email válido']
    },
    senha: { type: String, required: true, select: false },
    foto: { type: String, default: null },
    admin: { type: Boolean, default: false },
    // Adicionado: Porcentagem de comissão (ex: 40 para 40%)
    porcentagem_comissao: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
        default: 0
    },
    status: {
        type: String,
        enum: ['A', 'S', 'C'],
        default: 'A',
    },
    fk_barbearia: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'barbearia',
        required: true
    }
}, { 
    timestamps: true,
    collection: 'barbeiros' 
});

ModelBarbeiro.pre('save', async function (next) {
    if (!this.isModified('senha')) return next();
    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (error) {
        next(error);
    }
});

ModelBarbeiro.methods.compararSenha = async function (senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
};

export default mongoose.model('barbeiro', ModelBarbeiro);