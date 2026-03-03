import Agendamento from "../model/ModelAgendamento.js";
import ModelLogs from "../model/ModelLogs.js"; // Importando o model de logs
import mongoose from "mongoose";

// CREATE
export const criarAgendamento = async (req, res) => {
    try {
        const { datahora, fk_barbeiro, fk_cliente, fk_barbearia } = req.body;

        // Validação básica de IDs
        if (!mongoose.Types.ObjectId.isValid(fk_barbeiro) || !mongoose.Types.ObjectId.isValid(fk_cliente)) {
            return res.status(400).json({ message: "ids de barbeiro ou cliente inválidos." });
        }

        const conflito = await Agendamento.findOne({ 
            datahora, 
            fk_barbeiro, 
            status: 'A' 
        });

        if (conflito) {
            return res.status(400).json({ message: "este barbeiro já possui agendamento neste horário." });
        }

        const novo = await Agendamento.create(req.body);

        // REGISTRO DE LOG: Criação de agendamento
        await ModelLogs.create({
            fk_barbearia: novo.fk_barbearia,
            fk_barbeiro: novo.fk_barbeiro,
            fk_agendamento: novo._id,
            fk_cliente: novo.fk_cliente,
            status_acao: novo.status // 'A'
        });

        res.status(201).json(novo);
    } catch (error) {
        console.error("ERRO NO CREATE:", error);
        res.status(500).json({ error: error.message });
    }
};

// READ - Listar com filtros genéricos (Melhorado para Admin)
export const listarAgendamento = async (req, res) => {
    try {
        const { fk_barbeiro, fk_cliente, fk_barbearia, data } = req.query;
        const filtro = {};
        
        if (fk_barbearia && mongoose.Types.ObjectId.isValid(fk_barbearia)) {
            filtro.fk_barbearia = fk_barbearia;
        }

        if (fk_barbeiro && mongoose.Types.ObjectId.isValid(fk_barbeiro)) {
            filtro.fk_barbeiro = fk_barbeiro;
        }

        if (fk_cliente && mongoose.Types.ObjectId.isValid(fk_cliente)) {
            filtro.fk_cliente = fk_cliente;
        }

        if (data) {
            const inicio = new Date(data); inicio.setHours(0,0,0,0);
            const fim = new Date(data); fim.setHours(23,59,59,999);
            filtro.datahora = { $gte: inicio, $lte: fim };
        }

        const agendamentos = await Agendamento.find(filtro)
            .populate('fk_barbeiro')
            .populate('fk_cliente')
            .populate('fk_barbearia')
            .sort({ datahora: 1 });

        res.status(200).json(agendamentos);
    } catch (error) {
        console.error("ERRO NO LISTAR:", error);
        res.status(500).json({ error: "erro interno ao buscar agendamentos." });
    }
};

// READ - Por Barbearia
export const listarAgendamentoPorBarbearia = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID da barbearia inválido" });
        }

        const agendamentos = await Agendamento.find({ fk_barbearia: id })
            .populate('fk_barbeiro')
            .populate('fk_cliente')
            .sort({ datahora: 1 });

        res.status(200).json(agendamentos);
    } catch (error) {
        console.error("ERRO LISTAR POR BARBEARIA:", error);
        res.status(500).json({ error: error.message });
    }
};

// READ - Por ID
export const listarAgendamentoPorId = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "id inválido" });
        }
        const agendamento = await Agendamento.findById(req.params.id).populate('fk_barbeiro fk_cliente');
        if (!agendamento) return res.status(404).json({ message: "não encontrado" });
        res.status(200).json(agendamento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE (Ajustado para Logs detalhados)
export const atualizarAgendamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, canceladoPor, finalizadoPor } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "id inválido" });
        }

        const atualizado = await Agendamento.findByIdAndUpdate(
            id,
            { $set: req.body },
            { new: true }
        );

        if (!atualizado) {
            return res.status(404).json({ message: "agendamento não encontrado" });
        }

        // Se o status foi alterado, registramos o Log com o autor da ação
        if (status) {
            await ModelLogs.create({
                fk_barbearia: atualizado.fk_barbearia,
                fk_barbeiro: atualizado.fk_barbeiro,
                fk_agendamento: atualizado._id,
                fk_cliente: atualizado.fk_cliente,
                status_acao: atualizado.status,
                // Captura quem cancelou ou finalizou do body da requisição
                canceladoPor: canceladoPor || (status === 'C' ? 'Cliente' : null),
                finalizadoPor: finalizadoPor || null
            });
        }

        res.status(200).json(atualizado);
    } catch (error) {
        console.error("ERRO NO UPDATE:", error);
        res.status(500).json({ error: error.message });
    }
};

// DELETE
export const excluirAgendamento = async (req, res) => {
    try {
        const agendamento = await Agendamento.findById(req.params.id);
        
        if (agendamento) {
            // Se deletar fisicamente, registramos como cancelamento 'C' no log por segurança
            await ModelLogs.create({
                fk_barbearia: agendamento.fk_barbearia,
                fk_barbeiro: agendamento.fk_barbeiro,
                fk_agendamento: agendamento._id,
                fk_cliente: agendamento.fk_cliente,
                status_acao: 'C',
                canceladoPor: 'Sistema (Exclusão)'
            });
        }

        await Agendamento.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "excluído" });
    } catch (error) {
        console.error("ERRO NO DELETE:", error);
        res.status(500).json({ error: error.message });
    }
};