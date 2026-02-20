import Agendamento from "../model/ModelAgendamento.js";
import mongoose from "mongoose";

// CREATE
export const criarAgendamento = async (req, res) => {
    try {
        const { datahora, fk_barbeiro, fk_cliente } = req.body;

        // Validação básica de IDs para evitar erro de Cast do Mongoose
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
        res.status(201).json(novo);
    } catch (error) {
        console.error("ERRO NO CREATE:", error);
        res.status(500).json({ error: error.message });
    }
};

// READ - Listar com proteção contra IDs undefined
export const listarAgendamento = async (req, res) => {
    try {
        const { fk_barbeiro, fk_cliente, data } = req.query;
        const filtro = {};
        
        // Só adiciona ao filtro se o ID for um ObjectId válido
        if (fk_barbeiro && mongoose.Types.ObjectId.isValid(fk_barbeiro)) {
            filtro.fk_barbeiro = fk_barbeiro;
        }

        if (fk_cliente && mongoose.Types.ObjectId.isValid(fk_cliente)) {
            filtro.fk_cliente = fk_cliente;
        } else if (fk_cliente === 'undefined' || (fk_cliente && !mongoose.Types.ObjectId.isValid(fk_cliente))) {
            // Se o ID for inválido ou string 'undefined', retorna vazio em vez de erro 500
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
        res.status(200).json(atualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE
export const excluirAgendamento = async (req, res) => {
    try {
        await Agendamento.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "excluído" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};