import mongoose from "mongoose";

const ModelBarbearia = new mongoose.Schema({
    nome: {
        type: String,
        required: true,
        trim: true 
    },
    // Array de objetos para armazenar os serviços da unidade
    servicos: [{
        nome: { type: String, required: true },
        valor: { type: Number, max: 999.99, required: true },
        tempo: { type: Number, required: true } // tempo em minutos
    }],
    // Horários padrão de funcionamento da casa
    horarios: [{
        dia: { type: Number, required: true }, // 0 (Dom) a 6 (Sab)
        ativo: { type: Boolean, default: true },
        abertura: { type: String, default: "08:00" },
        fechamento: { type: String, default: "18:00" }
    }],
    // --- ALTERADO PARA SUPORTAR ESCALA DE PROFISSIONAIS ---
    agenda_detalhada: {
        mes: { type: Number },
        ano: { type: Number },
        grade: [{
            dia: { type: Number, required: true },
            status: { 
                type: String, 
                enum: ['A', 'P', 'I', 'F'], 
                default: 'P' 
            },
            // Lista de barbeiros que trabalharão neste dia específico
            escalas: [{
                barbeiroId: { 
                    type: mongoose.Schema.Types.ObjectId, 
                    ref: 'barbeiro', // Certifique-se que o nome do model de barbeiros seja 'barbeiro'
                    required: true 
                },
                entrada: { type: String, required: true }, // Ex: "08:00"
                saida: { type: String, required: true }    // Ex: "14:00"
            }]
        }]
    }
    // -------------------------------------------------------
}, { 
    timestamps: true,
    collection: 'barbearias' 
});

export default mongoose.model('barbearia', ModelBarbearia);