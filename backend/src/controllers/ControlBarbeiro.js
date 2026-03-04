import Barbeiro from "../model/ModelBarbeiro.js";
import Agendamento from "../model/ModelAgendamento.js";
import Logs from "../model/ModelLogs.js"; 
import mongoose from "mongoose";

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

// LOGIN
export const loginBarbeiro = async (req, res) => {
    try {
        const { email, senha } = req.body;
        if (!email || !senha) {
            return res.status(400).json({ mensagem: "e-mail e senha são obrigatórios" });
        }
        const barbeiro = await Barbeiro.findOne({ email: email.toLowerCase().trim() }).select('+senha');
        if (!barbeiro) {
            return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        }
        const senhaCorreta = await barbeiro.compararSenha(senha);
        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        }
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

// NOVO: Buscar apenas a FK da barbearia vinculada ao barbeiro
export const buscarBarbeariaPorBarbeiro = async (req, res) => {
    try {
        const { id } = req.params;
        const barbeiro = await Barbeiro.findById(id).select('fk_barbearia');
        
        if (!barbeiro) {
            return res.status(404).json({ message: "Barbeiro não encontrado" });
        }

        res.status(200).json({ fk_barbearia: barbeiro.fk_barbearia });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// FINALIZAR AGENDAMENTO
export const finalizarAgendamentoBarbeiro = async (req, res) => {
    try {
        const { idAgendamento } = req.params;
        const agendamento = await Agendamento.findByIdAndUpdate(idAgendamento, { status: 'F' }, { new: true });
        if (!agendamento) return res.status(404).json({ message: "Agendamento não encontrado" });

        await Logs.create({
            fk_barbearia: agendamento.fk_barbearia,
            fk_barbeiro: agendamento.fk_barbeiro,
            fk_agendamento: agendamento._id,
            fk_cliente: agendamento.fk_cliente,
            status_acao: 'F',
            finalizadoPor: 'Barbeiro'
        });

        res.status(200).json({ message: "Finalizado pelo Barbeiro", agendamento });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CANCELAR AGENDAMENTO
export const cancelarAgendamentoBarbeiro = async (req, res) => {
    try {
        const { idAgendamento } = req.params;
        const agendamento = await Agendamento.findByIdAndUpdate(idAgendamento, { status: 'C' }, { new: true });
        if (!agendamento) return res.status(404).json({ message: "Agendamento não encontrado" });

        await Logs.create({
            fk_barbearia: agendamento.fk_barbearia,
            fk_barbeiro: agendamento.fk_barbeiro,
            fk_agendamento: agendamento._id,
            fk_cliente: agendamento.fk_cliente,
            status_acao: 'C',
            canceladoPor: 'Barbeiro'
        });

        res.status(200).json({ message: "Cancelado pelo Barbeiro", agendamento });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ - listar todos
export const listarBarbeiro = async (req, res) => {
    try {
        const barbeiros = await Barbeiro.find().lean();
        return res.status(200).json(barbeiros);
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// READ - buscar por ID
export const listarBarbeiroPorId = async (req, res) => {
    try {
        const { id } = req.params;
        const barbeiro = await Barbeiro.findById(id).populate('fk_barbearia');
        if (!barbeiro) return res.status(404).json({ message: "barbeiro not found" });
        res.status(200).json(barbeiro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
export const atualizarBarbeiro = async (req, res) => {
    try {
        const barbeiroId = req.params.id;
        const dadosAtualizados = req.body;
        const barbeiro = await Barbeiro.findById(barbeiroId).select('+senha');
        if (!barbeiro) return res.status(404).json({ message: "não encontrado" });
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
        await Agendamento.deleteMany({ fk_barbeiro: barbeiroId });
        const excluido = await Barbeiro.findByIdAndDelete(barbeiroId);
        res.status(200).json({ message: "excluído", excluido });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};