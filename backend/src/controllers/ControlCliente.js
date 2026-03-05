import Cliente from "../model/ModelCliente.js";
import Agendamento from "../model/ModelAgendamento.js";
import Logs from "../model/ModelLogs.js";

// CREATE
export const criarCliente = async (req, res) => {
    try {
        const dados = req.body;

        // Se não vier e-mail (cliente avulso), geramos um para não dar erro de duplicate key no MongoDB
        if (!dados.email) {
            const timestamp = Date.now();
            dados.email = `avulso_${timestamp}@sistema.com`;
        }

        // Se não vier senha, definimos uma padrão (ou mude seu Model para não ser obrigatória)
        if (!dados.senha) {
            dados.senha = "123456"; 
        }

        const novo = await Cliente.create(dados);
        res.status(201).json(novo);
    } catch (error) {
        // Se ainda assim der erro de chave duplicada (E11000), enviamos um 400 mais claro
        if (error.code === 11000) {
            return res.status(400).json({ error: "Este e-mail já está cadastrado no sistema." });
        }
        res.status(500).json({ error: error.message });
    }
};

// LOGIN
export const loginCliente = async (req, res) => {
    try {
        const { email, senha } = req.body;
        const cliente = await Cliente.findOne({ email });
        
        if (!cliente) return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        
        const senhaCorreta = await cliente.compararSenha(senha);
        if (!senhaCorreta) return res.status(401).json({ mensagem: "e-mail ou senha inválidos" });
        
        return res.status(200).json({
            _id: cliente._id,
            nome: cliente.nome,
            email: cliente.email,
            numero: cliente.numero // Certifique-se que o campo no model é 'numero'
        });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};

// FINALIZAR AGENDAMENTO (LOG AS CLIENTE)
export const finalizarAgendamentoCliente = async (req, res) => {
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
            finalizadoPor: 'Cliente'
        });

        res.status(200).json({ message: "Finalizado pelo Cliente", agendamento });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// CANCELAR AGENDAMENTO (LOG AS CLIENTE)
export const cancelarAgendamentoCliente = async (req, res) => {
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
            canceladoPor: 'Cliente'
        });

        res.status(200).json({ message: "Cancelado pelo Cliente", agendamento });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ - Listar todos
export const listarCliente = async (req, res) => {
    try {
        const clientes = await Cliente.find().sort({ createdAt: -1 });
        res.status(200).json(clientes);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// READ - Buscar por ID
export const listarClientePorId = async (req, res) => {
    try {
        const cliente = await Cliente.findById(req.params.id);
        if (!cliente) return res.status(404).json({ message: "cliente não encontrado" });
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// UPDATE
export const atualizarCliente = async (req, res) => {
    try {
        const { id } = req.params;
        const cliente = await Cliente.findById(id);
        if (!cliente) return res.status(404).json({ message: "cliente não encontrado" });
        
        Object.assign(cliente, req.body);
        await cliente.save();
        res.status(200).json(cliente);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// DELETE
export const excluirCliente = async (req, res) => {
    try {
        const excluido = await Cliente.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "cliente excluído com sucesso", excluido });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};