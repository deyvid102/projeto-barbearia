import Agenda from "../model/ModelAgenda.js";

const ControlAgenda = {
    // 1. Criar um registro individual (chamado pelo clique no calendário)
    async criar(req, res) {
        try {
            // O Mongoose já valida o Schema e o índice único aqui
            const novaAgenda = await Agenda.create(req.body);
            return res.status(201).json(novaAgenda);
        } catch (error) {
            console.error("Erro ao criar agenda:", error);
            // Verifica se é erro de duplicidade (dia já registrado para aquele barbeiro)
            if (error.code === 11000) {
                return res.status(400).json({ error: "Este dia já está registrado na agenda deste barbeiro." });
            }
            return res.status(500).json({ error: "Erro ao salvar o dia na agenda." });
        }
    },

    // 2. Deletar um registro individual (chamado pela lixeira no calendário)
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

    // 3. Sincroniza toda a grade de um mês de uma vez (seu método original)
    async sincronizar(req, res) {
        try {
            const { fk_barbearia, mes, ano, dados } = req.body;

            if (!fk_barbearia || mes === undefined || !ano) {
                return res.status(400).json({ error: "Dados incompletos para sincronização." });
            }

            const dataInicio = new Date(ano, mes, 1);
            const dataFim = new Date(ano, mes + 1, 0, 23, 59, 59);

            await Agenda.deleteMany({
                fk_barbearia,
                data: { $gte: dataInicio, $lte: dataFim }
            });

            if (dados && dados.length > 0) {
                await Agenda.insertMany(dados);
            }

            return res.status(200).json({ message: "Agenda sincronizada com sucesso!" });
        } catch (error) {
            console.error(error);
            return res.status(500).json({ error: "Erro ao sincronizar agenda." });
        }
    },

    // 4. Busca agendas para o Admin ou para o Cliente filtrar
    async listar(req, res) {
        try {
            const { fk_barbearia, mes, ano, fk_barbeiro } = req.query;
            let filtro = {};

            // Ajuste: Só adiciona ao filtro se o parâmetro existir
            if (fk_barbearia) filtro.fk_barbearia = fk_barbearia;
            if (fk_barbeiro) filtro.fk_barbeiro = fk_barbeiro;

            if (mes !== undefined && ano) {
                // Criar datas considerando o fuso para cobrir o mês inteiro
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
    }
};

export default ControlAgenda;