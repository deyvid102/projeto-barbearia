// src/controllers/ControlLogs.js

import ModelLogs from "../model/ModelLogs.js";

/**
 * Busca todos os logs de uma barbearia específica
 */
export const buscarLogsPorBarbearia = async (req, res) => {
    try {
        const { id_barbearia } = req.params;

        // Filtra estritamente pelo fk_barbearia para garantir o isolamento dos dados
        const logs = await ModelLogs.find({ fk_barbearia: id_barbearia })
            .populate('fk_barbeiro', 'nome email')
            .populate('fk_cliente', 'nome telefone')
            .populate('fk_agendamento', 'tipoCorte valor datahora')
            .sort({ data_log: -1 }); // Mais recentes primeiro

        // Retorna array vazio se não houver registros, mantendo o padrão do frontend
        if (!logs) {
            return res.status(200).json([]); 
        }

        return res.status(200).json(logs);
    } catch (error) {
        console.error("Erro ao buscar logs:", error);
        return res.status(500).json({ error: "Erro interno ao buscar logs." });
    }
};

/**
 * Função interna para registrar ações
 * Pode ser chamada dentro de outros controllers (Barbeiro/Cliente)
 */
export const registrarLogAcao = async (dados) => {
    try {
        // Usamos o spread operator para pegar todos os campos (fk_barbearia, status_acao, etc)
        // e garantimos que os novos campos canceladoPor e finalizadoPor sejam persistidos
        await ModelLogs.create({
            ...dados,
            data_log: new Date() // Garante a timestamp da ação
        });
        
        console.log(`Log registrado: ${dados.status_acao} por ${dados.finalizadoPor || dados.canceladoPor || 'Sistema'}`);
    } catch (error) {
        console.error("Falha ao gravar log no banco:", error);
        // Não lançamos erro aqui para não travar a execução principal do agendamento
    }
};