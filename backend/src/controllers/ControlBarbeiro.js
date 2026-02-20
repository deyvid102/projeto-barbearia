import Barbeiro from "../model/ModelBarbeiro.js";
import Agendamento from "../model/ModelAgendamento.js";

// CREATE
export const criarBarbeiro = async (req, res) => {
    try {
        const novo = await Barbeiro.create(req.body);
        res.status(201).json(novo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ - listar todos
export const listarBarbeiro = async (req, res) => {
    try {
        const barbeiros = await Barbeiro.find().lean(); // .lean() torna o objeto mais leve/puro
        
        // Garante que o header seja JSON e o status 200
        res.setHeader('Content-Type', 'application/json');
        return res.status(200).send(JSON.stringify(barbeiros));
    } catch (error) {
        console.error("erro ao listar barbeiros:", error);
        return res.status(500).json({ error: error.message });
    }
};

// READ - buscar por ID
export const listarBarbeiroPorId = async (req, res) => {
    try {
        const barbeiro = await Barbeiro.findById(req.params.id);
        if (!barbeiro) {
            return res.status(404).json({ message: "barbeiro não encontrado" });
        }
        res.status(200).json(barbeiro);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
export const atualizarBarbeiro = async (req, res) => {
    try {
        const atualizado = await Barbeiro.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        res.status(200).json(atualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE - exclusão em cascata (remove agendamentos do barbeiro)
export const excluirBarbeiro = async (req, res) => {
    try {
        const barbeiroId = req.params.id;

        // 1. remove todos os agendamentos vinculados a este barbeiro
        await Agendamento.deleteMany({ fk_barbeiro: barbeiroId });

        // 2. remove o barbeiro
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