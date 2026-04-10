import mongoose from "mongoose";
import Agenda from "./ModelAgenda.js";

const ModelAgendamento = new mongoose.Schema({
    tipoCorte: { 
        type: String, 
        required: true 
    },
    cliente: {
        nome: { type: String, required: true },
        numero: { type: String, required: true }
    },
    datahora: { 
        type: Date, 
        required: true, 
        index: true 
    },
    datahora_fim: { 
        type: Date, 
        required: true 
    },
    valor: { 
        type: Number, 
        required: true 
    },
    status: {
        type: String,
        enum: ['agendado', 'finalizado', 'cancelado'],
        default: 'agendado',
    },
    fk_barbeiro: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "barbeiro", 
        required: true 
    },
    fk_barbearia: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'barbearia', 
        required: true 
    }
}, { 
    timestamps: true,
    collection: 'agendamentos'
});

// --- MIDDLEWARE PRE-SAVE: VALIDAÇÃO DE AGENDA ---
ModelAgendamento.pre('save', async function (next) {
    const agendamento = this;

    // 1. Identificar o dia da semana (0-6)
    const diaSemana = agendamento.datahora.getUTCDay();
    
    // 2. Buscar a agenda do barbeiro para este dia específico
    const agendaDoc = await Agenda.findOne({
        fk_barbeiro: agendamento.fk_barbeiro,
        "grade.dia_semana": diaSemana
    });

    if (!agendaDoc) {
        return next(new Error("Este barbeiro não possui agenda configurada para este dia da semana."));
    }

    // Extrair a configuração do dia específico dentro da grade
    const configDia = agendaDoc.grade.find(d => d.dia_semana === diaSemana);

    // 3. Validar se o dia está Ativo
    if (configDia.status === 'fechado') {
        return next(new Error("A barbearia/barbeiro não atende neste dia da semana."));
    }

    // 4. Validar Horário (Abertura/Fechamento)
    const horaSolicitada = agendamento.datahora.getUTCHours().toString().padStart(2, '0') + ":" + 
                           agendamento.datahora.getUTCMinutes().toString().padStart(2, '0');

    if (horaSolicitada < configDia.abertura || horaSolicitada >= configDia.fechamento) {
        return next(new Error(`Horário fora do expediente. Atendimento das ${configDia.abertura} às ${configDia.fechamento}.`));
    }

    // 5. Validar Intervalo
    if (configDia.tem_intervalo && configDia.intervalos.length > 0) {
        for (const intervalo of configDia.intervalos) {
            if (horaSolicitada >= intervalo.inicio && horaSolicitada < intervalo.fim) {
                return next(new Error("O barbeiro está em horário de intervalo/pausa."));
            }
        }
    }

    // 6. Validar Conflito com outros agendamentos
    const conflito = await mongoose.model('agendamentos').findOne({
        fk_barbeiro: agendamento.fk_barbeiro,
        status: 'agendado',
        _id: { $ne: agendamento._id }, // Ignora o próprio documento se for edição
        $or: [
            {
                datahora: { $lt: agendamento.datahora_fim },
                datahora_fim: { $gt: agendamento.datahora }
            }
        ]
    });

    if (conflito) {
        return next(new Error("Este horário já está ocupado por outro cliente."));
    }

    next();
});

export default mongoose.model('agendamentos', ModelAgendamento);