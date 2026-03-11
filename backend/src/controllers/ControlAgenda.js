import Agenda from "../model/ModelAgenda.js";

const ControlAgenda = {
    // 1. Criar um registro individual (chamado pelo clique no calendário)
    async criar(req, res) {
        try {
            // O frontend agora envia fk_barbearia dentro do body
            const novaAgenda = await Agenda.create(req.body);
            return res.status(201).json(novaAgenda);
        } catch (error) {
            console.error("Erro ao criar agenda:", error);
            if (error.code === 11000) {
                return res.status(400).json({ error: "Este dia já está registrado na agenda deste barbeiro." });
            }
            return res.status(500).json({ error: "Erro ao salvar o dia na agenda." });
        }
    },

    // 2. Deletar um registro individual
    async deletar(req, res) {
        try {
            const { id } = req.params;
            const deletado = await Agenda.findByIdAndDelete(id);
            
            if (!deletado) {
                return res.status(404).json({ error: "Registro não encontrado." });
            }
            
            return res.status(200).json({ message: "Dia removido com sucesso!" });
        } catch (error) {
            console.error("Erro ao deletar agenda:", error);
            return res.status(500).json({ error: "Erro ao remover o dia da agenda." });
        }
    },

    // 3. Sincroniza toda a grade de um mês de uma vez
    async sincronizar(req, res) {
        try {
            const { fk_barbearia, mes, ano, dados } = req.body;

            if (!fk_barbearia || mes === undefined || !ano) {
                return res.status(400).json({ error: "Dados incompletos para sincronização." });
            }

            // Define o intervalo do mês em UTC para evitar problemas de fuso
            const dataInicio = new Date(Date.UTC(ano, mes, 1, 0, 0, 0));
            const dataFim = new Date(Date.UTC(ano, parseInt(mes) + 1, 0, 23, 59, 59));

            // Limpa apenas a agenda daquela barbearia específica no período
            await Agenda.deleteMany({
                fk_barbearia,
                data: { $gte: dataInicio, $lte: dataFim }
            });

            if (dados && dados.length > 0) {
                await Agenda.insertMany(dados);
            }

            return res.status(200).json({ message: "Agenda sincronizada com sucesso!" });
        } catch (error) {
            console.error("Erro na sincronização:", error);
            return res.status(500).json({ error: "Erro ao sincronizar agenda." });
        }
    },

    // 4. Busca agendas com filtros dinâmicos via Query Params
    async listar(req, res) {
        try {
            const { fk_barbearia, mes, ano, fk_barbeiro } = req.query;
            let filtro = {};

            if (fk_barbearia) filtro.fk_barbearia = fk_barbearia;
            if (fk_barbeiro) filtro.fk_barbeiro = fk_barbeiro;

            if (mes !== undefined && ano) {
                const dataInicio = new Date(Date.UTC(ano, mes, 1, 0, 0, 0));
                const dataFim = new Date(Date.UTC(ano, parseInt(mes) + 1, 0, 23, 59, 59));
                filtro.data = { $gte: dataInicio, $lte: dataFim };
            }

            const agendas = await Agenda.find(filtro).sort({ data: 1 });
            return res.json(agendas);
        } catch (error) {
            console.error("Erro ao listar agendas:", error);
            return res.status(500).json({ error: "Erro ao listar agendas." });
        }
    },

    // 5. NOVA: Busca específica por barbearia (usada pela rota /agendas/barbearia/:id)
    async listarPorBarbearia(req, res) {
        try {
            const { id } = req.params;
            const agendas = await Agenda.find({ fk_barbearia: id }).sort({ data: 1 });
            return res.json(agendas);
        } catch (error) {
            console.error("Erro ao listar por barbearia:", error);
            return res.status(500).json({ error: "Erro ao buscar dados da barbearia." });
        }
    }
};

export default ControlAgenda;