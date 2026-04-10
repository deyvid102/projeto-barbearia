import mongoose from "mongoose";
import Agenda from "../model/ModelAgenda.js";

const ControlAgenda = {
    /**
     * GERA DISPONIBILIDADE (15 em 15 min)
     */
    async obterDisponibilidade(req, res) {
        try {
            const { barbeiro, data } = req.query; 

            if (!barbeiro || !data) {
                return res.status(400).json({ error: "Barbeiro e data são necessários." });
            }

            if (!mongoose.Types.ObjectId.isValid(barbeiro)) {
                return res.status(400).json({ error: "ID do barbeiro inválido." });
            }

            // Descobrir dia da semana (Corrigindo fuso horário)
            const partesData = data.split('-'); 
            const dataLocal = new Date(partesData[0], partesData[1] - 1, partesData[2]);
            const diaSemana = dataLocal.getDay(); 

            const agendaDoc = await Agenda.findOne({ fk_barbeiro: barbeiro });

            if (!agendaDoc || !agendaDoc.grade) {
                return res.status(200).json([]); 
            }

            const configDia = agendaDoc.grade.find(d => d.dia_semana === diaSemana);
            
            if (!configDia || configDia.status !== 'ativo') {
                return res.status(200).json([]);
            }

            const horarios = [];
            let [hAbertura, mAbertura] = configDia.abertura.split(':').map(Number);
            let [hFechamento, mFechamento] = configDia.fechamento.split(':').map(Number);

            let inicio = new Date();
            inicio.setHours(hAbertura, mAbertura, 0, 0);

            let fim = new Date();
            fim.setHours(hFechamento, mFechamento, 0, 0);

            while (inicio < fim) {
                const h = String(inicio.getHours()).padStart(2, '0');
                const m = String(inicio.getMinutes()).padStart(2, '0');
                const horaFormatada = `${h}:${m}`;

                const noIntervalo = configDia.tem_intervalo && configDia.intervalos.some(i => {
                    return horaFormatada >= i.inicio && horaFormatada < i.fim;
                });

                if (!noIntervalo) {
                    horarios.push(horaFormatada);
                }

                inicio.setMinutes(inicio.getMinutes() + 15);
            }

            return res.status(200).json(horarios);

        } catch (error) {
            console.error("❌ ERRO AO GERAR HORÁRIOS:", error);
            return res.status(500).json({ error: "Erro interno no servidor", details: error.message });
        }
    },

    async salvarGrade(req, res) {
        try {
            const { fk_barbearia, fk_barbeiro, grade } = req.body;
            
            const gradeLimpa = grade.map(dia => ({
                dia_semana: Number(dia.dia_semana),
                nome_dia: dia.nome_dia,
                status: dia.status === 'ativo' ? 'ativo' : 'fechado',
                abertura: dia.abertura || "08:00",
                fechamento: dia.fechamento || "19:00",
                tem_intervalo: Boolean(dia.tem_intervalo),
                intervalos: dia.tem_intervalo ? (dia.intervalos || []) : []
            }));

            const agenda = await Agenda.findOneAndUpdate(
                { fk_barbeiro }, 
                { $set: { fk_barbearia, fk_barbeiro, grade: gradeLimpa } },
                { new: true, upsert: true, runValidators: true }
            );
            return res.status(200).json(agenda);
        } catch (error) {
            return res.status(500).json({ error: error.message });
        }
    },

    async buscarPorBarbeiro(req, res) {
        try {
            const { idBarbeiro } = req.params;
            if (!mongoose.Types.ObjectId.isValid(idBarbeiro)) return res.status(400).json({ error: "ID inválido" });

            const agenda = await Agenda.findOne({ fk_barbeiro: idBarbeiro });
            if (!agenda) return res.status(200).json({ message: "Vazio", grade: [] });
            return res.status(200).json(agenda);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao buscar." });
        }
    },

    async listarPorBarbearia(req, res) {
        try {
            const { idBarbearia } = req.params;
            const agendas = await Agenda.find({ fk_barbearia: idBarbearia });
            return res.status(200).json(agendas);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao listar agendas da barbearia." });
        }
    },

    async alternarStatusDia(req, res) {
        try {
            const { fk_barbeiro, dia_semana, status } = req.body;
            const agenda = await Agenda.findOneAndUpdate(
                { fk_barbeiro, "grade.dia_semana": dia_semana },
                { $set: { "grade.$.status": status } },
                { new: true }
            );
            return res.status(200).json(agenda);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao atualizar status do dia." });
        }
    },

    async excluirAgenda(req, res) {
        try {
            await Agenda.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: "Agenda removida com sucesso." });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao excluir agenda." });
        }
    },

    async replicarGradeGeral(req, res) {
        try {
            const { fk_barbearia, grade } = req.body;
            // Busca todos os barbeiros daquela barbearia (assumindo que você tem essa lógica)
            // Aqui fazemos um updateMany ou loop para criar agendas para todos
            // Exemplo simplificado:
            const resultado = await Agenda.updateMany(
                { fk_barbearia },
                { $set: { grade } }
            );
            return res.status(200).json({ message: "Grade replicada para todos os barbeiros.", resultado });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao replicar grade." });
        }
    }
};

export default ControlAgenda;