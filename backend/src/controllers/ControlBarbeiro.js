import Barbeiro from "../model/ModelBarbeiro.js";
import Agendamento from "../model/ModelAgendamento.js";
import mongoose from "mongoose"; // Importado para validar o ID

// CREATE
export const criarBarbeiro = async (req, res) => {
    try {
        const novo = await Barbeiro.create(req.body);
        res.status(201).json(novo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// LOGIN - Autenticação segura com Bcrypt
export const loginBarbeiro = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Busca o barbeiro pelo e-mail
        const barbeiro = await Barbeiro.findOne({ email });

        if (!barbeiro) {
            return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        }

        // 2. Compara a senha digitada com o hash do banco
        const senhaCorreta = await barbeiro.compararSenha(senha);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        }

        // 3. Retorna os dados (sem a senha por segurança)
        // Padronizado para usar fk_barbearia
        return res.status(200).json({
            _id: barbeiro._id,
            nome: barbeiro.nome,
            email: barbeiro.email,
            admin: barbeiro.admin,
            fk_barbearia: barbeiro.fk_barbearia || barbeiro.barbearia_id
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// READ - listar todos
export const listarBarbeiro = async (req, res) => {
    try {
        const barbeiros = await Barbeiro.find().lean();
        return res.status(200).json(barbeiros); // Simplificado o envio de JSON
    } catch (error) {
        console.error("erro ao listar barbeiros:", error);
        return res.status(500).json({ error: error.message });
    }
};

// READ - buscar por ID (trazendo dados da barbearia vinculada)
export const listarBarbeiroPorId = async (req, res) => {
    try {
        const { id } = req.params;

        // Validação de ID para evitar erro de Cast (500)
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID do barbeiro em formato inválido" });
        }

        // Tenta popular fk_barbearia (padronizado)
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
        const barbeiro = await Barbeiro.findById(barbeiroId);
        
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

// DELETE - exclusão em cascata
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