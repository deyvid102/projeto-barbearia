import ModelBarbearia from "../model/ModelBarbearia.js";

class ControlBarbearia {
    // Criar nova barbearia
    async criar(req, res) {
        try {
            const { nome, servicos, horarios, agenda_detalhada } = req.body;
            if (!nome) {
                return res.status(400).json({ mensagem: "o nome da barbearia é obrigatório." });
            }
            
            const novaBarbearia = await ModelBarbearia.create({ 
                nome, 
                servicos, 
                horarios, 
                agenda_detalhada // Adicionado aqui para permitir criação já com agenda
            });
            return res.status(201).json(novaBarbearia);
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao criar barbearia", erro: error.message });
        }
    }

    // Listar todas as barbearias
    async listar(req, res) {
        try {
            const barbearias = await ModelBarbearia.find();
            return res.status(200).json(barbearias);
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao buscar barbearias", erro: error.message });
        }
    }

    // Buscar por ID
    async listarPorId(req, res) {
        try {
            const { id } = req.params;
            const barbearia = await ModelBarbearia.findById(id);
            
            if (!barbearia) {
                return res.status(404).json({ mensagem: "barbearia não encontrada" });
            }
            
            return res.status(200).json(barbearia);
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao buscar barbearia", erro: error.message });
        }
    }

    // Atualizar barbearia (Melhorado para suportar agenda_detalhada)
    async atualizar(req, res) {
        try {
            const { id } = req.params;
            const dadosAtualizados = req.body; 

            // Usamos o $set explicitamente para garantir que o MongoDB 
            // substitua o objeto da agenda em vez de tentar mesclar errado
            const barbearia = await ModelBarbearia.findByIdAndUpdate(
                id, 
                { $set: dadosAtualizados }, 
                { new: true, runValidators: true }
            );

            if (!barbearia) {
                return res.status(404).json({ mensagem: "barbearia não encontrada" });
            }

            return res.status(200).json(barbearia);
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao atualizar", erro: error.message });
        }
    }

    // Deletar barbearia
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const barbeariaExcluida = await ModelBarbearia.findByIdAndDelete(id);

            if (!barbeariaExcluida) {
                return res.status(404).json({ mensagem: "barbearia não encontrada" });
            }

            return res.status(200).json({ mensagem: "barbearia removida com sucesso" });
        } catch (error) {
            return res.status(500).json({ mensagem: "erro ao deletar", erro: error.message });
        }
    }
}

export default new ControlBarbearia();