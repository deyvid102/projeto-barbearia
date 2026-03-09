import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/Api';
import { 
  IoCloseOutline, IoCutOutline, 
  IoTimeOutline, IoCheckmarkCircleOutline,
  IoChevronDownOutline, IoPersonOutline, IoCalendarOutline
} from 'react-icons/io5';

export default function ModalAgendamentoAvulso({ isOpen, onClose, onSave, isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [servicos, setServicos] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [barbeariaId, setBarbeariaId] = useState(null);
  
  const [isSelectServicoOpen, setIsSelectServicoOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nomeCliente: '',
    numeroCliente: '',
    tipoCorte: '',
    valor: '',
    hora: '',
    tempo: 30
  });

  const carregarDadosBase = useCallback(async () => {
    try {
      const barbeiroId = localStorage.getItem('barbeiroId');
      const resB = await api.get('/barbeiros');
      const barbeirosData = resB.data || resB;
      const barbeiro = barbeirosData.find(b => String(b._id) === String(barbeiroId));

      if (barbeiro) {
        const idBarb = barbeiro.fk_barbearia?._id || barbeiro.fk_barbearia;
        setBarbeariaId(idBarb);
        const resBarb = await api.get(`/barbearias/${idBarb}`);
        const barbeariaData = resBarb.data || resBarb;
        setServicos(barbeariaData.servicos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados da barbearia:", error);
    }
  }, []);

  const carregarHorariosDisponiveis = useCallback(async () => {
    try {
      const barbeiroId = localStorage.getItem('barbeiroId');
      if (!barbeiroId) return;

      const hojeStr = new Date().toISOString().split('T')[0];
      const [resAgendas, resAgendamentos] = await Promise.all([
        api.get('/agendas'),
        api.get('/agendamentos')
      ]);

      const agendasData = resAgendas.data || resAgendas;
      const agendamentosData = resAgendamentos.data || resAgendamentos;

      const escala = agendasData.find(g => 
        g.data?.startsWith(hojeStr) && 
        String(g.fk_barbeiro?._id || g.fk_barbeiro) === String(barbeiroId)
      );

      if (!escala) return;

      const timeToMin = (s) => (s ? s.split(':').reduce((h, m) => h * 60 + +m, 0) : 0);
      const inicio = timeToMin(escala.abertura);
      const fim = timeToMin(escala.fechamento);
      
      const agendamentosHoje = agendamentosData.filter(a => 
        a.datahora?.startsWith(hojeStr) && 
        String(a.fk_barbeiro?._id || a.fk_barbeiro) === String(barbeiroId) &&
        a.status === 'A'
      );

      const slots = [];
      const agora = new Date();
      const agoraMin = agora.getHours() * 60 + agora.getMinutes();

      for (let curr = inicio; curr + formData.tempo <= fim; curr += 20) {
        if (curr <= agoraMin + 10) continue;
        const colide = agendamentosHoje.some(ag => {
          const horaParte = ag.datahora.split('T')[1].substring(0, 5);
          const agInicio = timeToMin(horaParte);
          return curr < agInicio + (ag.tempo_estimado || 30) && (curr + formData.tempo) > agInicio;
        });
        if (!colide) {
          const h = Math.floor(curr / 60).toString().padStart(2, '0');
          const m = (curr % 60).toString().padStart(2, '0');
          slots.push(`${h}:${m}`);
        }
      }
      setHorariosDisponiveis(slots);
    } catch (error) { console.error("Erro ao carregar horários:", error); }
  }, [formData.tempo]);

  useEffect(() => {
    if (isOpen) {
      carregarDadosBase();
      carregarHorariosDisponiveis();
    }
  }, [isOpen, carregarDadosBase, carregarHorariosDisponiveis]);

  const selecionarServico = (s) => {
    setFormData(prev => ({ ...prev, tipoCorte: s.nome, valor: s.valor, tempo: s.tempo }));
    setIsSelectServicoOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hora || !formData.nomeCliente || !formData.tipoCorte) return;

    const barbeiroId = localStorage.getItem('barbeiroId');
    
    // Calcular Data Início
    const dataInicio = new Date();
    const [horas, minutos] = formData.hora.split(':');
    dataInicio.setHours(parseInt(horas), parseInt(minutos), 0, 0);

    // Calcular Data Fim baseado no tempo estimado do serviço
    const dataFim = new Date(dataInicio.getTime() + (formData.tempo * 60000));

    // NOVO PAYLOAD: Seguindo estritamente o ModelAgendamento
    const payloadFinal = {
      tipoCorte: formData.tipoCorte,
      cliente: {
        nome: formData.nomeCliente,
        numero: formData.numeroCliente || "00000000000"
      },
      datahora: dataInicio.toISOString(),
      datahora_fim: dataFim.toISOString(),
      tempo_estimado: Number(formData.tempo),
      valor: Number(formData.valor),
      status: 'A',
      fk_barbeiro: barbeiroId,
      fk_barbearia: barbeariaId
    };

    onSave(payloadFinal);
    setFormData({ nomeCliente: '', numeroCliente: '', tipoCorte: '', valor: '', hora: '', tempo: 30 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`w-full max-w-lg rounded-[2.5rem] border shadow-2xl overflow-visible transition-all animate-in fade-in zoom-in-95 ${isDarkMode ? 'bg-[#0f0f0f] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        
        <div className="p-8 pb-0 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black italic">balcão.<span className="text-[#e6b32a]">rápido</span></h3>
            <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest mt-1">Agendamento direto</p>
          </div>
          <button onClick={onClose} type="button" className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all">
            <IoCloseOutline size={28} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          
          {/* IDENTIFICAÇÃO DO CLIENTE */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10 focus-within:border-[#e6b32a]/50' : 'bg-slate-50 border-slate-200 focus-within:border-[#e6b32a]'}`}>
              <label className="text-[9px] font-black uppercase text-[#e6b32a] mb-1 block">Nome do Cliente</label>
              <div className="flex items-center gap-2">
                <IoPersonOutline className="opacity-30" size={14} />
                <input 
                  required
                  type="text" 
                  placeholder="Ex: João Silva"
                  className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm outline-none"
                  value={formData.nomeCliente}
                  onChange={(e) => setFormData({...formData, nomeCliente: e.target.value})}
                />
              </div>
            </div>

            <div className={`p-4 rounded-2xl border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <label className="text-[9px] font-black uppercase text-gray-500 mb-1 block">WhatsApp (Opcional)</label>
              <input 
                type="tel" 
                placeholder="11999999999"
                className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm outline-none"
                value={formData.numeroCliente}
                onChange={(e) => setFormData({...formData, numeroCliente: e.target.value})}
              />
            </div>
          </div>

          {/* SELEÇÃO DE SERVIÇO */}
          <div className="relative">
            <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block ml-2">O que vamos fazer?</label>
            <button 
              type="button"
              onClick={() => setIsSelectServicoOpen(!isSelectServicoOpen)}
              className={`w-full p-5 rounded-2xl border flex items-center justify-between transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
            >
              <div className="flex items-center gap-3">
                <IoCutOutline className="text-[#e6b32a]" size={18} />
                <span className="text-sm font-black uppercase tracking-tight">
                  {formData.tipoCorte || 'Escolha o serviço'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                {formData.valor && <span className="text-xs font-mono font-black text-[#e6b32a]">R$ {formData.valor}</span>}
                <IoChevronDownOutline size={16} className={`transition-transform ${isSelectServicoOpen ? 'rotate-180' : ''}`} />
              </div>
            </button>

            {isSelectServicoOpen && (
              <div className={`absolute left-0 right-0 mt-2 border rounded-2xl shadow-2xl z-[200] overflow-hidden animate-in slide-in-from-top-2 ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-100'}`}>
                {servicos.map((s, idx) => (
                  <button key={idx} type="button" onClick={() => selecionarServico(s)} className="w-full p-4 flex items-center justify-between hover:bg-[#e6b32a] hover:text-black transition-colors border-b last:border-none border-white/5">
                    <span className="text-[11px] font-black uppercase">{s.nome}</span>
                    <div className="flex items-center gap-4">
                        <span className="text-[10px] opacity-60 font-bold">{s.tempo} min</span>
                        <span className="text-xs font-black">R$ {s.valor}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* HORÁRIOS DISPONÍVEIS */}
          <div className={!formData.tipoCorte ? 'opacity-20 pointer-events-none transition-opacity' : 'transition-opacity'}>
            <div className="flex items-center gap-2 mb-3 ml-2">
                <IoTimeOutline size={14} className="text-[#e6b32a]" />
                <p className="text-[9px] font-black uppercase tracking-widest text-gray-500">Horários para hoje</p>
            </div>
            <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-[#e6b32a]">
              {horariosDisponiveis.map(h => (
                <button 
                  key={h} 
                  type="button" 
                  onClick={() => setFormData({...formData, hora: h})} 
                  className={`py-3 rounded-xl border text-[11px] font-black transition-all ${
                    formData.hora === h 
                    ? 'bg-[#e6b32a] text-black border-[#e6b32a] shadow-lg shadow-[#e6b32a]/20 scale-95' 
                    : 'bg-white/5 border-white/10 hover:border-[#e6b32a]/50'
                  }`}
                >
                  {h}
                </button>
              ))}
              {horariosDisponiveis.length === 0 && formData.tipoCorte && (
                <div className="col-span-4 py-4 text-center opacity-40 text-[10px] font-black uppercase">
                    Sem horários para este serviço hoje
                </div>
              )}
            </div>
          </div>

          {/* BOTÃO FINAL */}
          <button 
            type="submit"
            disabled={!formData.hora || !formData.nomeCliente || !formData.tipoCorte}
            className={`w-full py-5 rounded-[1.8rem] font-black uppercase text-[12px] tracking-[2px] transition-all flex items-center justify-center gap-3 ${
              (!formData.hora || !formData.nomeCliente) 
              ? 'bg-white/5 text-gray-600 cursor-not-allowed' 
              : 'bg-[#e6b32a] text-black shadow-xl shadow-[#e6b32a]/20 hover:scale-[1.02] active:scale-95'
            }`}
          >
            <IoCheckmarkCircleOutline size={20} />
            Finalizar Agendamento
          </button>
        </form>
      </div>
    </div>
  );
}