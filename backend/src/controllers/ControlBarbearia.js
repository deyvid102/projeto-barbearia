import ModelBarbearia from "../model/ModelBarbearia.js";

class ControlBarbearia {
    // Criar nova barbearia
    async criar(req, res) {
        try {
            const { nome, servicos, abertura, fechamento } = req.body;
            if (!nome) {
                return res.status(400).json({ mensagem: "o nome da barbearia é obrigatório." });
            }
            const novaBarbearia = await ModelBarbearia.create({ nome, servicos, abertura, fechamento });
            return res.status(201).json(novaBarbearia);
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao criar", erro: error.message });
        }
    }

    // Listar por Perfil (Nome da URL com Case-Insensitive)
    async listarPorPerfil(req, res) {
        try {
            const { perfil } = req.params;
            
            // O segredo está aqui: busca o nome ignorando maiúsculas/minúsculas
            const barbearia = await ModelBarbearia.findOne({ 
                nome: { $regex: new RegExp("^" + perfil + "$", "i") } 
            });

            if (!barbearia) {
                return res.status(404).json({ mensagem: "barbearia não encontrada pelo perfil informado" });
            }

            return res.status(200).json(barbearia);
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao buscar perfil", erro: error.message });
        }
    }

    // Listar Todas
    async listar(req, res) {
        try {
            const barbearias = await ModelBarbearia.find();
            return res.status(200).json(barbearias);
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao buscar", erro: error.message });
        }
    }

    // Listar por ID
    async listarPorId(req, res) {
        try {
            const { id } = req.params;
            const barbearia = await ModelBarbearia.findById(id);
            if (!barbearia) return res.status(404).json({ mensagem: "não encontrada" });
            return res.status(200).json(barbearia);
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao buscar id", erro: error.message });
        }
    }

    // Atualizar
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const barbearia = await ModelBarbearia.findByIdAndUpdate(id, { $set: req.body }, { new: true });
            return res.status(200).json(barbearia);
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao atualizar", erro: error.message });
        }
    }

    // Deletar
    async deletar(req, res) {
        try {
            const { id } = req.params;
            await ModelBarbearia.findByIdAndDelete(id);
            return res.status(200).json({ mensagem: "removida" });
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao deletar", erro: error.message });
        }
    }
}

export default new ControlBarbearia();