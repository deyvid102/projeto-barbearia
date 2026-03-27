import Agendamento from "../model/ModelAgendamento.js";
import ModelLogs from "../model/ModelLogs.js";
import mongoose from "mongoose";

// CREATE
export const criarAgendamento = async (req, res) => {
    try {
        const { datahora, datahora_fim, fk_barbeiro, fk_barbearia, cliente } = req.body;

        if (!mongoose.Types.ObjectId.isValid(fk_barbeiro) || !mongoose.Types.ObjectId.isValid(fk_barbearia)) {
            return res.status(400).json({ message: "ID de barbeiro ou barbearia inválido." });
        }

        if (!cliente || !cliente.nome) {
            return res.status(400).json({ message: "O nome do cliente é obrigatório." });
        }

        const inicioSolicitado = new Date(datahora);
        const fimSolicitado = new Date(datahora_fim);

        const conflito = await Agendamento.findOne({ 
            fk_barbeiro: fk_barbeiro, 
            status: 'A',
            $or: [
                { 
                    datahora: { $lt: fimSolicitado }, 
                    datahora_fim: { $gt: inicioSolicitado } 
                }
            ]
        });

        if (conflito) {
            return res.status(400).json({ 
                message: `Conflito de horário: O barbeiro já possui um agendamento das ${conflito.datahora.toLocaleTimeString()} às ${conflito.datahora_fim.toLocaleTimeString()}` 
            });
        }

        const novo = await Agendamento.create(req.body);

        try {
            await ModelLogs.create({
                fk_barbearia: novo.fk_barbearia,
                fk_barbeiro: novo.fk_barbeiro,
                fk_agendamento: novo._id,
                cliente_nome: novo.cliente.nome,
                status_acao: novo.status 
            });
        } catch (logErr) {
            console.error("Erro ao gerar log:", logErr.message);
        }

        res.status(201).json(novo);
    } catch (error) {
        console.error("ERRO NO CREATE:", error);
        res.status(400).json({ error: error.message });
    }
};

// READ - Listar com filtros
export const listarAgendamento = async (req, res) => {
    try {
        const { fk_barbeiro, fk_barbearia, data } = req.query;
        const filtro = {};
        
        if (fk_barbearia && mongoose.Types.ObjectId.isValid(fk_barbearia)) filtro.fk_barbearia = fk_barbearia;
        if (fk_barbeiro && mongoose.Types.ObjectId.isValid(fk_barbeiro)) filtro.fk_barbeiro = fk_barbeiro;

        if (data) {
            const inicio = new Date(data); inicio.setHours(0,0,0,0);
            const fim = new Date(data); fim.setHours(23,59,59,999);
            filtro.datahora = { $gte: inicio, $lte: fim };
        }

        const agendamentos = await Agendamento.find(filtro)
            .populate('fk_barbeiro', 'nome')
            .sort({ datahora: 1 });

        res.status(200).json(agendamentos);
    } catch (error) {
        res.status(500).json({ error: "Erro interno ao buscar agendamentos." });
    }
};

// READ - Por ID (A função que estava faltando o export)
export const listarAgendamentoPorId = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({ message: "ID inválido" });
        }
        const agendamento = await Agendamento.findById(req.params.id).populate('fk_barbeiro', 'nome');
        if (!agendamento) return res.status(404).json({ message: "Agendamento não encontrado" });
        res.status(200).json(agendamento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ - Por Barbearia
export const listarAgendamentoPorBarbearia = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID da barbearia inválido" });
        }
        const agendamentos = await Agendamento.find({ fk_barbearia: id }).populate('fk_barbeiro', 'nome').sort({ datahora: 1 });
        res.status(200).json(agendamentos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
export const atualizarAgendamento = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ message: "ID inválido" });

        const agendamento = await Agendamento.findById(id);
        if (!agendamento) return res.status(404).json({ message: "Agendamento não encontrado" });

        Object.assign(agendamento, req.body);
        await agendamento.save();

        if (req.body.status) {
            await ModelLogs.create({
                fk_barbearia: agendamento.fk_barbearia,
                fk_barbeiro: agendamento.fk_barbeiro,
                fk_agendamento: agendamento._id,
                cliente_nome: agendamento.cliente.nome,
                status_acao: agendamento.status
            });
        }

        res.status(200).json(agendamento);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// DELETE
export const excluirAgendamento = async (req, res) => {
    try {
        const agendamento = await Agendamento.findById(req.params.id);
        if (agendamento) {
            await ModelLogs.create({
                fk_barbearia: agendamento.fk_barbearia,
                fk_barbeiro: agendamento.fk_barbeiro,
                fk_agendamento: agendamento._id,
                cliente_nome: agendamento.cliente.nome,
                status_acao: 'C', 
                canceladoPor: 'Sistema (Exclusão)'
            });
        }
        await Agendamento.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Excluído com sucesso" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};