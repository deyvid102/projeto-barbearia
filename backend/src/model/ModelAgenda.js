import mongoose from "mongoose";

// Sub-schema para intervalos
const IntervaloSchema = new mongoose.Schema({
    inicio: { type: String, required: true },
    fim: { type: String, required: true }
}, { _id: false });

// Sub-schema para cada dia da semana
const DiaConfigSchema = new mongoose.Schema({
    dia_semana: { 
        type: Number, 
        required: true, 
        min: 0, 
        max: 6 
    },
    nome_dia: { type: String },
    status: { 
        type: String, 
        enum: ['ativo', 'fechado'], 
        default: 'ativo' 
    },
    abertura: { type: String, default: "08:00" },
    fechamento: { type: String, default: "18:00" },
    tem_intervalo: { type: Boolean, default: false },
    intervalos: { type: [IntervaloSchema], default: [] } // Inicializa como array vazio por padrão
}, { _id: false });

const AgendaSchema = new mongoose.Schema({
    fk_barbearia: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'barbearia', 
        required: true 
    },
    fk_barbeiro: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'barbeiro',
        default: null // Permite agenda mestre da barbearia
    },
    grade: {
        type: [DiaConfigSchema],
        required: true,
        validate: [v => Array.isArray(v) && v.length > 0, 'A grade não pode estar vazia.']
    }
}, { 
    timestamps: true,
    collection: 'agendas'
});

// Index para evitar duplicidade de agenda por barbeiro na mesma barbearia
// AgendaSchema.index({ fk_barbearia: 1, fk_barbeiro: 1 }, { unique: true });

// Correção para evitar erro de "OverwriteModelError" em desenvolvimento (HMR do Vite/Node)
const Agenda = mongoose.models.agenda || mongoose.model('agenda', AgendaSchema);

export default Agenda;