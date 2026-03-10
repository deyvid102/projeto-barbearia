import mongoose from "mongoose";
import ModelBarbeiro from "./ModelBarbeiro.js";
import ModelFinanceiro from "./ModelFinanceiro.js";

const ModelAgendamento = new mongoose.Schema({
    tipoCorte: { type: String, required: true },

    cliente: {
        nome: { type: String, required: true },
        numero: { type: String}
    },
    datahora: { type: Date, required: true, index: true },
    datahora_fim: { type: Date, required: true },
    tempo_estimado: { type: Number, required: true },
    valor: { 
        type: Number, 
        required: true,
        set: v => parseFloat(v.toFixed(2)) 
    },
    status: {
        type: String,
        enum: ['A', 'F', 'C'], // A: Agendado, F: Finalizado, C: Cancelado
        default: 'A',
    },
    fk_barbeiro: { type: mongoose.Schema.Types.ObjectId, ref: "barbeiro", required: true },
    fk_barbearia: { type: mongoose.Schema.Types.ObjectId, ref: 'barbearia', required: true }

}, {  timestamps: true,
    collection: 'agendamentos'
});

// MIDDLEWARE POST-SAVE: Dispara quando o agendamento é atualizado
ModelAgendamento.post('save', async function (doc) {
    // Só cria o financeiro se o status for 'F' (Finalizado)
    if (doc.status === 'F') {
        try {
            // 1. Busca os dados do barbeiro para pegar a porcentagem
            const barbeiro = await mongoose.model('barbeiro').findById(doc.fk_barbeiro);
            
            if (barbeiro) {
                const porcentagem = barbeiro.porcentagem_comissao || 0;
                const valorBarbeiro = parseFloat((doc.valor * (porcentagem / 100)).toFixed(2));
                const valorBarbearia = parseFloat((doc.valor - valorBarbeiro).toFixed(2));

                // 2. Verifica se já não existe um registro financeiro para este agendamento (evita duplicidade)
                const jaExiste = await mongoose.model('financeiro').findOne({ fk_agendamento: doc._id });

                if (!jaExiste) {
                    await mongoose.model('financeiro').create({
                        fk_agendamento: doc._id,
                        fk_barbeiro: doc.fk_barbeiro,
                        fk_barbearia: doc.fk_barbearia,
                        valor_total: doc.valor,
                        porcentagem_aplicada: porcentagem,
                        valor_barbeiro: valorBarbeiro,
                        valor_barbearia: valorBarbearia
                    });
                }
            }
        } catch (error) {
            console.error("Erro ao gerar registro financeiro:", error);
        }
    }
});

export default mongoose.model('agendamento', ModelAgendamento);