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

// LOGIN - Autenticação segura para o cliente
export const loginCliente = async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Busca o cliente pelo e-mail
        const cliente = await Cliente.findOne({ email });

        if (!cliente) {
            return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        }

        // 2. Compara a senha usando o método do Model
        const senhaCorreta = await cliente.compararSenha(senha);

        if (!senhaCorreta) {
            return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        }

        // 3. Retorna os dados (sem a senha)
        return res.status(200).json({
            _id: cliente._id,
            nome: cliente.nome,
            email: cliente.email,
            numero: cliente.numero
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
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

// UPDATE - Ajustado para disparar o middleware de criptografia
export const atualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const dados = req.body;

        // Buscamos o documento para usar o .save() e garantir o hash da senha
        const cliente = await Cliente.findById(id);
        
        if (!cliente) {
            return res.status(404).json({ message: "cliente não encontrado" });
        }

        // Atualiza os campos enviados
        Object.assign(cliente, dados);
        await cliente.save();

        res.status(200).json(cliente);
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