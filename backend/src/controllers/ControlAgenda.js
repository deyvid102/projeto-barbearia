import Agenda from "../model/ModelAgenda.js";

const ControlAgenda = {
    // 1. Criar um registro individual
    async criar(req, res) {
        try {
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

            const dataInicio = new Date(Date.UTC(ano, mes, 1, 0, 0, 0));
            const dataFim = new Date(Date.UTC(ano, parseInt(mes) + 1, 0, 23, 59, 59));

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

    // 4. Busca agendas com filtros dinâmicos
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

    // 5. Busca específica por barbearia
    async listarPorBarbearia(req, res) {
        try {
            const { id } = req.params;
            const agendas = await Agenda.find({ fk_barbearia: id }).sort({ data: 1 });
            return res.json(agendas);
        } catch (error) {
            console.error("Erro ao listar por barbearia:", error);
            return res.status(500).json({ error: "Erro ao buscar dados da barbearia." });
        }
    },

    // 6. Função que faltava: Limpar agenda por período
    async limparPeriodo(req, res) {
        try {
            const { id } = req.params; // ID da barbearia
            const { inicio, fim } = req.query; // Espera datas no formato YYYY-MM-DD

            if (!inicio || !fim) {
                return res.status(400).json({ error: "Datas de início e fim são obrigatórias." });
            }

            await Agenda.deleteMany({
                fk_barbearia: id,
                data: { 
                    $gte: new Date(inicio), 
                    $lte: new Date(fim) 
                }
            });

            return res.status(200).json({ message: "Agenda do período limpa com sucesso." });
        } catch (error) {
            console.error("Erro ao limpar período:", error);
            return res.status(500).json({ error: "Erro interno ao limpar agenda." });
        }
    }
};

export default ControlAgenda;