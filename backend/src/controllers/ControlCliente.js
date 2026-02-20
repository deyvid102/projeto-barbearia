import Cliente from "../model/ModelCliente.js";

// CREATE
export const criarCliente = async (req, res) => {
    try {
        const novo = await Cliente.create(req.body);
        res.status(201).json(novo);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ - Listar todos
export const listarCliente = async (req, res) => {
    try {
        const clientes = await Cliente.find();
        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ - Buscar por ID
export const listarClientePorId = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) {
            return res.status(404).json({ message: "cliente não encontrado" });
        }
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
export const atualizarCliente = async (req, res) => {
    try {
        const atualizado = await Cliente.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!atualizado) {
            return res.status(404).json({ message: "cliente não encontrado" });
        }
        res.status(200).json(atualizado);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE - Exclusão em cascata
export const excluirCliente = async (req, res) => {
    try {
        const clienteId = req.params.id;

        const excluido = await Cliente.findByIdAndDelete(clienteId);

        if (!excluido) {
            return res.status(404).json({ message: "cliente não encontrado" });
        }

        res.status(200).json({ 
            message: "cliente excluído com sucesso", 
            excluido 
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};