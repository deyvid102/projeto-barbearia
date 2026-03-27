import Agenda from "../model/ModelAgenda.js";

const ControlAgenda = {
    // 1. Criar ou Atualizar um dia da semana (Upsert)
    // Agora faz mais sentido usar um "save" que atualiza se o dia já existir
    async salvarDia(req, res) {
        try {
            const { fk_barbearia, fk_barbeiro, dia_semana } = req.body;

            // Busca e atualiza ou cria um novo (upsert)
            const agenda = await Agenda.findOneAndUpdate(
                { fk_barbearia, fk_barbeiro, dia_semana },
                req.body,
                { new: true, upsert: true }
            );

            return res.status(200).json(agenda);
        } catch (error) {
            console.error("Erro ao salvar dia na escala:", error);
            return res.status(500).json({ error: "Erro ao salvar o dia na escala semanal." });
        }
    },

    // 2. Deletar uma configuração de dia específico
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const deletado = await Agenda.findByIdAndDelete(id);
            
            if (!deletado) {
                return res.status(404).json({ error: "Configuração não encontrada." });
            }
            
            return res.status(200).json({ message: "Dia removido da escala com sucesso!" });
        } catch (error) {
            console.error("Erro ao deletar agenda:", error);
            return res.status(500).json({ error: "Erro ao remover o dia da escala." });
        }
    },

    // 3. Sincroniza a escala semanal completa de um barbeiro
    // Útil quando o barbeiro salva a tela de "Configurações de Horário" de uma vez
    async sincronizarEscala(req, res) {
        try {
            const { fk_barbearia, fk_barbeiro, dados } = req.body;

            if (!fk_barbearia || !fk_barbeiro || !Array.isArray(dados)) {
                return res.status(400).json({ error: "Dados incompletos para sincronização." });
            }

            // Remove a escala antiga desse barbeiro para inserir a nova
            await Agenda.deleteMany({ fk_barbearia, fk_barbeiro });

            const novaEscala = await Agenda.insertMany(dados);

            return res.status(200).json({ message: "Escala semanal atualizada!", novaEscala });
        } catch (error) {
            console.error("Erro na sincronização da escala:", error);
            return res.status(500).json({ error: "Erro ao sincronizar escala semanal." });
        }
    },

    // 4. Lista a escala semanal (Filtra por barbeiro ou barbearia)
    async listar(req, res) {
        try {
            const { fk_barbearia, fk_barbeiro } = req.query;
            let filtro = {};

            if (fk_barbearia) filtro.fk_barbearia = fk_barbearia;
            if (fk_barbeiro) filtro.fk_barbeiro = fk_barbeiro;

            // Ordena pelo dia da semana (0 a 6)
            const agendas = await Agenda.find(filtro).sort({ dia_semana: 1 });
            return res.json(agendas);
        } catch (error) {
            console.error("Erro ao listar escala:", error);
            return res.status(500).json({ error: "Erro ao listar escala semanal." });
        }
    },

    // 5. Busca escala completa de uma barbearia (Todos os barbeiros)
    async listarPorBarbearia(req, res) {
        try {
            const { id } = req.params;
            const agendas = await Agenda.find({ fk_barbearia: id }).sort({ dia_semana: 1 });
            return res.json(agendas);
        } catch (error) {
            console.error("Erro ao listar por barbearia:", error);
            return res.status(500).json({ error: "Erro ao buscar dados da barbearia." });
        }
    },

    // 6. Resetar escala de um barbeiro (Limpar tudo)
    async limparEscalaBarbeiro(req, res) {
        try {
            const { fk_barbearia, fk_barbeiro } = req.query;

            if (!fk_barbearia || !fk_barbeiro) {
                return res.status(400).json({ error: "Barbearia e Barbeiro são obrigatórios." });
            }

            await Agenda.deleteMany({ fk_barbearia, fk_barbeiro });

            return res.status(200).json({ message: "Toda a escala semanal foi removida." });
        } catch (error) {
            console.error("Erro ao limpar escala:", error);
            return res.status(500).json({ error: "Erro interno ao limpar escala." });
        }
    }
};

export default ControlAgenda;