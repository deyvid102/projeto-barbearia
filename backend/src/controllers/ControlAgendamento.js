import Agendamento from "../model/ModelAgendamento.js";
import Agenda from "../model/ModelAgenda.js";
import mongoose from "mongoose";

const ControlAgendamento = {
    /**
     * 1. CRIAR AGENDAMENTO
     */
    async criar(req, res) {
        try {
            const novoAgendamento = new Agendamento(req.body);
            await novoAgendamento.save();
            return res.status(201).json({
                message: "Agendado com sucesso!",
                agendamento: novoAgendamento
            });
        } catch (error) {
            console.error("Erro ao criar agendamento:", error.message);
            return res.status(400).json({ error: error.message });
        }
    },

    /**
     * 2. BUSCAR DISPONIBILIDADE (Ajustado para 15min)
     */
    async obterDisponibilidade(req, res) {
        try {
            const { barbeiro, data } = req.query; // data: "YYYY-MM-DD"

            if (!barbeiro || !data) {
                return res.status(400).json({ error: "Barbeiro e data são obrigatórios." });
            }

            if (!mongoose.Types.ObjectId.isValid(barbeiro)) {
                return res.status(400).json({ error: "ID do barbeiro inválido." });
            }

            // Descobrir dia da semana sem erro de fuso
            const partes = data.split('-');
            const dataLocal = new Date(partes[0], partes[1] - 1, partes[2]);
            const diaSemana = dataLocal.getDay();

            const agendaDoc = await Agenda.findOne({ fk_barbeiro: barbeiro });
            if (!agendaDoc) return res.status(200).json([]);

            const configDia = agendaDoc.grade.find(d => d.dia_semana === diaSemana);
            if (!configDia || configDia.status === 'fechado') return res.status(200).json([]);

            // Buscar ocupados do dia
            const inicioDia = new Date(dataLocal);
            inicioDia.setHours(0, 0, 0, 0);
            const fimDia = new Date(dataLocal);
            fimDia.setHours(23, 59, 59, 999);

            const ocupados = await Agendamento.find({
                fk_barbeiro: barbeiro,
                datahora: { $gte: inicioDia, $lte: fimDia },
                status: { $ne: 'cancelado' }
            });

            const horariosDisponiveis = [];
            let [hAbertura, mAbertura] = configDia.abertura.split(':').map(Number);
            let [hFechamento, mFechamento] = configDia.fechamento.split(':').map(Number);

            let atual = new Date(dataLocal);
            atual.setHours(hAbertura, mAbertura, 0, 0);
            
            let limite = new Date(dataLocal);
            limite.setHours(hFechamento, mFechamento, 0, 0);

            while (atual < limite) {
                const horaString = String(atual.getHours()).padStart(2, '0') + ":" + 
                                 String(atual.getMinutes()).padStart(2, '0');
                
                const noIntervalo = configDia.tem_intervalo && configDia.intervalos.some(i => 
                    horaString >= i.inicio && horaString < i.fim
                );

                const estaOcupado = ocupados.some(ag => {
                    const agH = new Date(ag.datahora);
                    const agHoraStr = String(agH.getHours()).padStart(2, '0') + ":" + 
                                    String(agH.getMinutes()).padStart(2, '0');
                    return agHoraStr === horaString;
                });

                if (!noIntervalo && !estaOcupado) {
                    horariosDisponiveis.push(horaString);
                }

                atual.setMinutes(atual.getMinutes() + 15); // Incremento de 15 em 15
            }

            return res.status(200).json(horariosDisponiveis);
        } catch (error) {
            console.error("Erro disponibilidade:", error);
            return res.status(500).json({ error: "Erro interno no servidor." });
        }
    },

    /**
     * 3. LER / LISTAR AGENDAMENTOS POR DATA
     */
    async listarPorData(req, res) {
        try {
            const { fk_barbeiro, data } = req.query;

            if (!fk_barbeiro || !data) {
                return res.status(400).json({ error: "Barbeiro e data são obrigatórios." });
            }

            const partes = data.split('-');
            const inicioDia = new Date(partes[0], partes[1] - 1, partes[2], 0, 0, 0);
            const fimDia = new Date(partes[0], partes[1] - 1, partes[2], 23, 59, 59);

            const agendamentos = await Agendamento.find({
                fk_barbeiro,
                datahora: { $gte: inicioDia, $lte: fimDia },
                status: { $ne: 'cancelado' }
            }).sort({ datahora: 1 });

            return res.status(200).json(agendamentos);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao buscar agendamentos." });
        }
    },

    async buscarPorId(req, res) {
        try {
            const agendamento = await Agendamento.findById(req.params.id)
                .populate('fk_barbeiro', 'nome')
                .populate('fk_barbearia', 'nome');
            if (!agendamento) return res.status(404).json({ error: "Não encontrado." });
            return res.status(200).json(agendamento);
        } catch (error) {
            return res.status(500).json({ error: "Erro ao buscar detalhes." });
        }
    },

    async atualizar(req, res) {
        try {
            const agendamento = await Agendamento.findByIdAndUpdate(req.params.id, req.body, { new: true });
            return res.status(200).json({ message: "Atualizado!", agendamento });
        } catch (error) {
            return res.status(400).json({ error: error.message });
        }
    },

    async alterarStatus(req, res) {
        try {
            const agendamento = await Agendamento.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
            return res.status(200).json({ message: "Status alterado", agendamento });
        } catch (error) {
            return res.status(400).json({ error: "Erro ao atualizar status." });
        }
    },

    async deletar(req, res) {
        try {
            await Agendamento.findByIdAndDelete(req.params.id);
            return res.status(200).json({ message: "Excluído." });
        } catch (error) {
            return res.status(500).json({ error: "Erro ao excluir." });
        }
    }
};

export default ControlAgendamento;