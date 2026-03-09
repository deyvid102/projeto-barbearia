import Agendamento from "../model/ModelAgendamento.js";
import ModelLogs from "../model/ModelLogs.js";
import mongoose from "mongoose";

// CREATE
export const criarAgendamento = async (req, res) => {
    try {
        const { datahora, fk_barbeiro, fk_barbearia, cliente } = req.body;

        // 1. Validação básica de IDs
        if (!mongoose.Types.ObjectId.isValid(fk_barbeiro) || !mongoose.Types.ObjectId.isValid(fk_barbearia)) {
            return res.status(400).json({ message: "ID de barbeiro ou barbearia inválido." });
        }

        // 2. Validação do cliente (APENAS NOME É OBRIGATÓRIO AGORA)
        if (!cliente || !cliente.nome) {
            return res.status(400).json({ message: "O nome do cliente é obrigatório." });
        }

        // 3. Verificação de conflito de horário (Melhorada)
        // Convertemos para Date para garantir que a comparação no MongoDB seja precisa
        const dataBusca = new Date(datahora);
        const conflito = await Agendamento.findOne({ 
            datahora: dataBusca, 
            fk_barbeiro: fk_barbeiro, 
            status: 'A' 
        });

        if (conflito) {
            return res.status(400).json({ message: "Este barbeiro já possui um agendamento exatamente neste horário." });
        }

        // 4. Criação
        const novo = await Agendamento.create(req.body);

        // 5. Registro de Log (com tratamento de erro para não travar o agendamento se o log falhar)
        try {
            await ModelLogs.create({
                fk_barbearia: novo.fk_barbearia,
                fk_barbeiro: novo.fk_barbeiro,
                fk_agendamento: novo._id,
                cliente_nome: novo.cliente.nome,
                status_acao: novo.status 
            });
        } catch (logErr) {
            console.error("Erro ao gerar log (agendamento seguiu):", logErr.message);
        }

        res.status(201).json(novo);
    } catch (error) {
        console.error("ERRO NO CREATE:", error);
        res.status(500).json({ error: error.message });
    }
};

// READ - Listar com filtros
export const listarAgendamento = async (req, res) => {
    try {
        const { fk_barbeiro, fk_barbearia, data } = req.query;
        const filtro = {};
        
        if (fk_barbearia && mongoose.Types.ObjectId.isValid(fk_barbearia)) {
            filtro.fk_barbearia = fk_barbearia;
        }

        if (fk_barbeiro && mongoose.Types.ObjectId.isValid(fk_barbeiro)) {
            filtro.fk_barbeiro = fk_barbeiro;
        }

        if (data) {
            const inicio = new Date(data); inicio.setHours(0,0,0,0);
            const fim = new Date(data); fim.setHours(23,59,59,999);
            filtro.datahora = { $gte: inicio, $lte: fim };
        }

        const agendamentos = await Agendamento.find(filtro)
            .populate('fk_barbeiro', 'nome')
            .populate('fk_barbearia', 'nome')
            .sort({ datahora: 1 });

        res.status(200).json(agendamentos);
    } catch (error) {
        console.error("ERRO NO LISTAR:", error);
        res.status(500).json({ error: "Erro interno ao buscar agendamentos." });
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
            .populate('fk_barbeiro', 'nome')
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
        const agendamento = await Agendamento.findById(req.params.id).populate('fk_barbeiro', 'nome');
        if (!agendamento) return res.status(404).json({ message: "não encontrado" });
        res.status(200).json(agendamento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
export const atualizarAgendamento = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "id inválido" });
        }

        const agendamento = await Agendamento.findById(id);
        if (!agendamento) return res.status(404).json({ message: "agendamento não encontrado" });

        Object.assign(agendamento, req.body);
        await agendamento.save();

        if (status) {
            await ModelLogs.create({
                fk_barbearia: agendamento.fk_barbearia,
                fk_barbeiro: agendamento.fk_barbeiro,
                fk_agendamento: agendamento._id,
                cliente_nome: agendamento.cliente.nome, // Mantendo consistência no log
                status_acao: agendamento.status
            });
        }

        res.status(200).json(agendamento);
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
        res.status(200).json({ message: "excluído com sucesso" });
    } catch (error) {
        console.error("ERRO NO DELETE:", error);
        res.status(500).json({ error: error.message });
    }
};