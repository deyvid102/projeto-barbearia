import Barbeiro from "../model/ModelBarbeiro.js";
import Agendamento from "../model/ModelAgendamento.js";
import mongoose from "mongoose";
import bcrypt from "bcrypt";

// CREATE
export const criarBarbeiro = async (req, res) => {
    try {
        const novo = await Barbeiro.create(req.body);
        res.status(201).json(novo);
    } catch (error) {
        console.error("Erro ao criar barbeiro:", error);
        res.status(500).json({ error: error.message });
    }
};

// LOGIN - Autenticação segura com Bcrypt
export const loginBarbeiro = async (req, res) => {
    try {
        const { email, senha } = req.body;

        if (!email || !senha) {
            return res.status(400).json({ mensagem: "e-mail e senha são obrigatórios" });
        }

        // AJUSTE AQUI: Adicionado .select('+senha') para trazer a senha oculta
        const barbeiro = await Barbeiro.findOne({ email: email.toLowerCase().trim() }).select('+senha');

        if (!barbeiro) {
            return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        }

        // Agora o compararSenha terá acesso ao 'this.senha'
        const senhaCorreta = await barbeiro.compararSenha(senha);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        }

        // Retorna os dados (a senha será removida automaticamente do objeto pela config do model)
        return res.status(200).json({
            _id: barbeiro._id,
            nome: barbeiro.nome,
            email: barbeiro.email,
            admin: barbeiro.admin,
            fk_barbearia: barbeiro.fk_barbearia
        });

    } catch (error) {
        console.error("ERRO NO LOGIN:", error);
        return res.status(500).json({ error: "Erro interno no servidor" });
    }
};

// READ - listar todos
export const listarBarbeiro = async (req, res) => {
    try {
        const barbeiros = await Barbeiro.find().lean();
        return res.status(200).json(barbeiros);
    } catch (error) {
        console.error("erro ao listar barbeiros:", error);
        return res.status(500).json({ error: error.message });
    }
};

// READ - buscar por ID
export const listarBarbeiroPorId = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID do barbeiro em formato inválido" });
        }

        const barbeiro = await Barbeiro.findById(id).populate('fk_barbearia');
        
        if (!barbeiro) {
            return res.status(404).json({ message: "barbeiro não encontrado" });
        }

        res.status(200).json(barbeiro);
    } catch (error) {
        console.error("ERRO NO LISTAR POR ID:", error);
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
export const atualizarBarbeiro = async (req, res) => {
    try {
        const barbeiroId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(barbeiroId)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        const dadosAtualizados = req.body;
        const barbeiro = await Barbeiro.findById(barbeiroId).select('+senha');
        
        if (!barbeiro) {
            return res.status(404).json({ message: "barbeiro não encontrado" });
        }

        Object.assign(barbeiro, dadosAtualizados);
        await barbeiro.save();

        res.status(200).json(barbeiro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE
export const excluirBarbeiro = async (req, res) => {
    try {
        const barbeiroId = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(barbeiroId)) {
            return res.status(400).json({ message: "ID inválido" });
        }

        await Agendamento.deleteMany({ fk_barbeiro: barbeiroId });
        const excluido = await Barbeiro.findByIdAndDelete(barbeiroId);

        if (!excluido) {
            return res.status(404).json({ message: "barbeiro não encontrado" });
        }

        res.status(200).json({ 
            message: "barbeiro e seus agendamentos excluídos com sucesso", 
            excluido 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};