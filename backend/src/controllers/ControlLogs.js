import ModelLogs from "../model/ModelLogs.js";

/**
 * Busca todos os logs de uma barbearia específica
 */
export const buscarLogsPorBarbearia = async (req, res) => {
    try {
        const { id_barbearia } = req.params;

        // Filtra pelo fk_barbearia e traz dados relacionados
        const logs = await ModelLogs.find({ fk_barbearia: id_barbearia })
            .populate('fk_barbeiro', 'nome email')
            .populate({
                path: 'fk_agendamento',
                // Buscamos todas as variações possíveis de campos de nome no agendamento
                select: 'tipoCorte valor datahora nome_cliente cliente_nome clienteNome nome' 
            })
            .sort({ data_log: -1 });

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
 */
export const registrarLogAcao = async (dados) => {
    try {
        await ModelLogs.create({
            ...dados,
            data_log: new Date()
        });
        
        console.log(`Log registrado: ${dados.status_acao} por ${dados.finalizadoPor || dados.canceladoPor || 'Sistema'}`);
    } catch (error) {
        console.error("Falha ao gravar log no banco:", error);
    }
};