import mongoose from "mongoose";
import bcrypt from "bcrypt";

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
        required: true,
        unique: true 
    },
    senha: {
        type: String,
        required: true
    },
    
        fk_barbearia: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'barbearia',
            required: true
        }

}, 
{ 
    timestamps: true 
});

// Middleware: Criptografa a senha do cliente antes de salvar
ModelCliente.pre('save', async function (next) {
    // Se a senha não foi modificada, pula o processo de hash
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

// Método para verificar a senha durante o login do cliente
ModelCliente.methods.compararSenha = async function (senhaDigitada) {
    return await bcrypt.compare(senhaDigitada, this.senha);
};

export default mongoose.model('cliente', ModelCliente);