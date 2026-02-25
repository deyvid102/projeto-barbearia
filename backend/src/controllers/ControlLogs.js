// src/controllers/ControlLogs.js

import ModelLogs from "../model/ModelLogs.js"; // Note: verifique se a pasta é 'model' ou 'models'

export const buscarLogsPorBarbearia = async (req, res) => {
    try {
        const { id_barbearia } = req.params;

        const logs = await ModelLogs.find({ fk_barbearia: id_barbearia })
            .populate('fk_barbeiro', 'nome email')
            .populate('fk_cliente', 'nome telefone')
            .populate('fk_agendamento', 'tipoCorte valor datahora')
            .sort({ data_log: -1 });

        if (!logs || logs.length === 0) {
            return res.status(200).json([]); // Retornar vazio em vez de 404 evita erros no frontend
        }

        return res.status(200).json(logs);
    } catch (error) {
        console.error("erro ao buscar logs:", error);
        return res.status(500).json({ error: "erro interno ao buscar logs." });
    }
};

export const registrarLogAcao = async (dados) => {
    try {
        await ModelLogs.create({
            fk_barbearia: dados.fk_barbearia,
            fk_barbeiro: dados.fk_barbeiro,
            fk_agendamento: dados.fk_agendamento,
            fk_cliente: dados.fk_cliente,
            status_acao: dados.status_acao
        });
    } catch (error) {
        console.error("falha ao gravar log:", error);
    }
};