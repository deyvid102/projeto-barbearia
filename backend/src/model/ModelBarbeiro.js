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
        unique: true 
    },
    senha: {
        type: String,
        required: true
    },
    admin: {
        type: Boolean,
        default: false,
    },
    status: {
        type: String,
        enum: ['A', 'S', 'C'], // A: Ativo, S: Suspenso, C: Cancelado
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

// Middleware: Criptografa a senha usando bcrypt antes de salvar
ModelBarbeiro.pre('save', async function (next) {
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

// Método para comparar senhas durante o login
ModelBarbeiro.methods.compararSenha = async function (senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
};

// O nome 'barbeiro' deve coincidir com o ref usado no ModelBarbearia
export default mongoose.model('barbeiro', ModelBarbeiro);