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
            status_acao: novo.status // Pega o status inicial 'A'
        });

        res.status(201).json(novo);
    } catch (error) {
        console.error("ERRO NO CREATE:", error);
        res.status(500).json({ error: error.message });
    }
};

// READ - Listar
export const listarAgendamento = async (req, res) => {
    try {
        const { fk_barbeiro, fk_cliente, data } = req.query;
        const filtro = {};
        
        if (fk_barbeiro && mongoose.Types.ObjectId.isValid(fk_barbeiro)) {
            filtro.fk_barbeiro = fk_barbeiro;
        }

        if (fk_cliente && mongoose.Types.ObjectId.isValid(fk_cliente)) {
            filtro.fk_cliente = fk_cliente;
        } else if (fk_cliente === 'undefined' || (fk_cliente && !mongoose.Types.ObjectId.isValid(fk_cliente))) {
            return res.status(200).json([]);
        }

        if (data) {
            const inicio = new Date(data); inicio.setHours(0,0,0,0);
            const fim = new Date(data); fim.setHours(23,59,59,999);
            filtro.datahora = { $gte: inicio, $lte: fim };
        }

        const agendamentos = await Agendamento.find(filtro)
            .populate('fk_barbeiro')
            .populate('fk_cliente')
            .sort({ datahora: 1 });

        res.status(200).json(agendamentos);
    } catch (error) {
        console.error("ERRO NO LISTAR:", error);
        res.status(500).json({ error: "erro interno ao buscar agendamentos." });
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

// UPDATE
export const atualizarAgendamento = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "id inválido" });
        }

        const atualizado = await Agendamento.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        if (!atualizado) {
            return res.status(404).json({ message: "agendamento não encontrado" });
        }

        // REGISTRO DE LOG: Sempre que o status for alterado (Finalizado ou Cancelado)
        // Se o body contiver status, gravamos a ação no log
        if (req.body.status) {
            await ModelLogs.create({
                fk_barbearia: atualizado.fk_barbearia,
                fk_barbeiro: atualizado.fk_barbeiro,
                fk_agendamento: atualizado._id,
                fk_cliente: atualizado.fk_cliente,
                status_acao: atualizado.status // Salva o novo status ('F' ou 'C')
            });
        }

        res.status(200).json(atualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE
export const excluirAgendamento = async (req, res) => {
    try {
        const agendamento = await Agendamento.findById(req.params.id);
        
        if (agendamento) {
            // REGISTRO DE LOG: Opcional, registrar que um agendamento foi deletado do sistema
            await ModelLogs.create({
                fk_barbearia: agendamento.fk_barbearia,
                fk_barbeiro: agendamento.fk_barbeiro,
                fk_agendamento: agendamento._id,
                fk_cliente: agendamento.fk_cliente,
                status_acao: 'C' // Tratamos exclusão como cancelamento no log
            });
        }

        await Agendamento.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "excluído" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};