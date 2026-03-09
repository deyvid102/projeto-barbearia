import ModelFinanceiro from "../model/ModelFinanceiro.js";

class ControlFinanceiro {
    // Listar todos os registros financeiros de uma barbearia
    async listarPorBarbearia(req, res) {
        try {
            const { fk_barbearia } = req.params;
            const financeiro = await ModelFinanceiro.find({ fk_barbearia })
                .populate('fk_barbeiro', 'nome')
                .populate('fk_agendamento', 'tipoCorte cliente')
                .sort({ createdAt: -1 });
            
            return res.status(200).json(financeiro);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao buscar registros financeiros." });
        }
    }

    // Resumo de ganhos (Soma total)
    async obterResumo(req, res) {
        try {
            const { fk_barbearia } = req.params;
            
            const resumo = await ModelFinanceiro.aggregate([
                { $match: { fk_barbearia: new mongoose.Types.ObjectId(fk_barbearia) } },
                { 
                    $group: { 
                        _id: null, 
                        total_bruto: { $sum: "$valor_total" },
                        total_barbeiros: { $sum: "$valor_barbeiro" },
                        total_lucro_casa: { $sum: "$valor_barbearia" }
                    } 
                }
            ]);

            return res.status(200).json(resumo[0] || { total_bruto: 0, total_barbeiros: 0, total_lucro_casa: 0 });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao calcular resumo financeiro." });
        }
    }
}

export default new ControlFinanceiro();