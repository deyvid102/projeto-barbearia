import mongoose from "mongoose";
// Certifique-se de que o ModelAgenda está importado corretamente para a validação
import "./ModelAgenda.js"; 

const ModelAgendamento = new mongoose.Schema({
    tipoCorte: { type: String, required: true },
    cliente: {
        nome: { type: String, required: true },
        numero: { type: String }
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
}, { 
    timestamps: true,
    collection: 'agendamentos'
});

// --- NOVO MIDDLEWARE PRE-SAVE: Valida se o horário está dentro da escala semanal ---
ModelAgendamento.pre('save', async function (next) {
    if (this.isNew || this.isModified('datahora')) {
        const data = new Date(this.datahora);
        const diaSemana = data.getDay(); // 0 (Dom) a 6 (Sab)
        const horaMinutos = data.toTimeString().slice(0, 5); // Ex: "14:30"

        try {
            const agendaBarbeiro = await mongoose.model('agenda').findOne({
                fk_barbeiro: this.fk_barbeiro,
                dia_semana: diaSemana,
                status: 'A'
            });

            if (!agendaBarbeiro) {
                return next(new Error('O barbeiro não atende neste dia da semana.'));
            }

            // Validação de horário (Abertura/Fechamento)
            if (horaMinutos < agendaBarbeiro.abertura || horaMinutos > agendaBarbeiro.fechamento) {
                return next(new Error(`Fora do horário de atendimento (${agendaBarbeiro.abertura} - ${agendaBarbeiro.fechamento})`));
            }

            // Validação de intervalo
            if (agendaBarbeiro.tem_intervalo) {
                if (horaMinutos >= agendaBarbeiro.intervalo_inicio && horaMinutos < agendaBarbeiro.intervalo_fim) {
                    return next(new Error('Horário selecionado coincide com o intervalo do barbeiro.'));
                }
            }
        } catch (error) {
            return next(error);
        }
    }
    next();
});

// --- MIDDLEWARE POST-SAVE: Financeiro (Mantido conforme original) ---
ModelAgendamento.post('save', async function (doc) {
    if (doc.status === 'F') {
        try {
            const barbeiro = await mongoose.model('barbeiro').findById(doc.fk_barbeiro);
            
            if (barbeiro) {
                const porcentagem = barbeiro.porcentagem_comissao || 0;
                const valorBarbeiro = parseFloat((doc.valor * (porcentagem / 100)).toFixed(2));
                const valorBarbearia = parseFloat((doc.valor - valorBarbeiro).toFixed(2));

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