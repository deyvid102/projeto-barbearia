import mongoose from "mongoose";
import bcrypt from "bcrypt";

const ModelBarbeiro = new mongoose.Schema({
    nome: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true // Recomendado para evitar e-mails duplicados
    },
    senha: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false,
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

// Middleware: Criptografa a senha antes de salvar no banco de dados
ModelBarbeiro.pre('save', async function (next) {
    // Se a senha não foi modificada (ex: atualizou apenas o nome), pula a criptografia
    if (!this.isModified('senha')) {
        return next();
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.senha = await bcrypt.hash(this.senha, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Método customizado para comparar senhas (usado no login)
ModelBarbeiro.methods.compararSenha = async function (senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
};

export default mongoose.model('barbeiro', ModelBarbeiro);