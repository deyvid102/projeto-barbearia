import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/Api.js';
import { 
  IoCloseOutline, IoPersonOutline, IoCutOutline, 
  IoChevronForwardOutline, IoArrowBackOutline, IoTimeOutline 
} from 'react-icons/io5';

export default function ModalAgendamentoDireto({ 
  isOpen, onClose, onSave, dataAgendamento, selectedDate, isDarkMode 
}) {
  const [step, setStep] = useState(1);
  const [servicos, setServicos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [agendamentosDoDia, setAgendamentosDoDia] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    nomeCliente: '', 
    telefoneCliente: '', 
    tipoCorte: '',
    valor: '', 
    hora: '', 
    duracao: 30, 
    barbeiroId: ''
  });

  /**
   * CARREGA DADOS DA BARBEARIA (SERVIÇOS E EQUIPE)
   */
  const carregarDadosIniciais = useCallback(async () => {
    // Busca o ID da barbearia de forma resiliente
    const barbeariaId = dataAgendamento?.barbeiro?.fk_barbearia?._id || 
                        dataAgendamento?.barbeiro?.fk_barbearia || 
                        dataAgendamento?.fk_barbearia?._id ||
                        dataAgendamento?.fk_barbearia;

    if (!barbeariaId) return;

    try {
      const [resBarb, resBarbeiros] = await Promise.all([
        api.get(`/barbearias/${barbeariaId}`),
        api.get(`/barbearias/${barbeariaId}/barbeiros`)
      ]);
      
      // Ajuste na captura: tenta pegar de .data (Axios) ou direto
      const dadosBarbearia = resBarb.data || resBarb;
      setServicos(dadosBarbearia.servicos || []);

      const listaBarbeiros = resBarbeiros.data || resBarbeiros;
      setBarbeiros(Array.isArray(listaBarbeiros) ? listaBarbeiros : []);
    } catch (err) { 
      console.error("Erro ao carregar dados da barbearia:", err); 
    }
  }, [dataAgendamento]);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      carregarDadosIniciais();
      const idInicial = dataAgendamento?.barbeiro?._id || dataAgendamento?.barbeiro || '';
      setFormData(prev => ({ 
        ...prev, 
        barbeiroId: idInicial, 
        hora: '',
        nomeCliente: '',
        telefoneCliente: '',
        tipoCorte: ''
      }));
    }
  }, [isOpen, carregarDadosIniciais, dataAgendamento]);

  /**
   * BUSCA HORÁRIOS LIVRES E OCUPADOS
   */
  const buscarDadosDisponibilidade = useCallback(async () => {
    if (!formData.barbeiroId || !selectedDate) return;
    
    setLoading(true);
    try {
      const ano = selectedDate.getFullYear();
      const mes = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const dia = String(selectedDate.getDate()).padStart(2, '0');
      const dataFormatada = `${ano}-${mes}-${dia}`;

      const [resDisp, resOcupados] = await Promise.all([
        api.get(`/agendamentos/disponibilidade`, {
          params: { barbeiro: formData.barbeiroId, data: dataFormatada }
        }),
        api.get(`/agendamentos`, {
          params: { fk_barbeiro: formData.barbeiroId, data: dataFormatada }
        })
      ]);

      setHorariosDisponiveis(resDisp.data || []);
      setAgendamentosDoDia(resOcupados.data || []);
    } catch (err) { 
      console.error("Erro ao buscar horários:", err);
      setHorariosDisponiveis([]); 
      setAgendamentosDoDia([]);
    } finally { 
      setLoading(false); 
    }
  }, [formData.barbeiroId, selectedDate]);

  useEffect(() => { 
    if (step === 2 && isOpen) buscarDadosDisponibilidade(); 
  }, [step, isOpen, buscarDadosDisponibilidade]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hora || !formData.barbeiroId) return;

    const [h, m] = formData.hora.split(':');
    const dataAgendada = new Date(selectedDate);
    dataAgendada.setHours(parseInt(h), parseInt(m), 0, 0);

    const barbeariaId = dataAgendamento?.barbeiro?.fk_barbearia?._id || 
                        dataAgendamento?.barbeiro?.fk_barbearia || 
                        dataAgendamento?.fk_barbearia?._id ||
                        dataAgendamento?.fk_barbearia;

    onSave({
      tipoCorte: formData.tipoCorte,
      cliente: { nome: formData.nomeCliente, numero: formData.telefoneCliente },
      datahora: dataAgendada.toISOString(),
      valor: Number(formData.valor),
      fk_barbeiro: formData.barbeiroId,
      fk_barbearia: barbeariaId,
      status: 'agendado'
    });
  };

  if (!isOpen) return null;

  const inputClass = `w-full p-4 rounded-2xl border transition-all outline-none text-sm font-bold ${
    isDarkMode ? 'bg-white/5 border-white/10 text-white focus:border-[#e6b32a]' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-black'
  }`;

  return (
    <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-4 bg-black/80 backdrop-blur-md">
      <div className={`w-full max-w-lg rounded-t-[2.5rem] md:rounded-[3rem] border shadow-2xl ${isDarkMode ? 'bg-[#0f0f0f] border-white/10' : 'bg-white border-slate-200'}`}>
        <div className="p-8">
          
          <div className="flex justify-between items-center mb-10">
            <button type="button" onClick={step === 2 ? () => setStep(1) : onClose} className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-50 hover:opacity-100 transition-all ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {step === 2 ? <><IoArrowBackOutline size={20}/> Voltar</> : <><IoCloseOutline size={22}/> Fechar</>}
            </button>
            {step === 1 && (
              <button 
                type="button" 
                disabled={!formData.tipoCorte || !formData.nomeCliente} 
                onClick={() => setStep(2)} 
                className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[#e6b32a] disabled:opacity-20 hover:scale-105 transition-all"
              >
                Próximo <IoChevronForwardOutline size={20}/>
              </button>
            )}
          </div>

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-6">
                <div className="space-y-4">
                  <input required className={inputClass} placeholder="Nome do Cliente" value={formData.nomeCliente} onChange={e => setFormData({...formData, nomeCliente: e.target.value})} />
                  <input required className={inputClass} placeholder="WhatsApp (ex: 819...)" value={formData.telefoneCliente} onChange={e => setFormData({...formData, telefoneCliente: e.target.value})} />
                </div>
                <div className="relative">
                  <IoCutOutline className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                  <select required className={`${inputClass} pl-11 appearance-none`} value={formData.tipoCorte} onChange={e => {
                    const s = servicos.find(item => item.nome === e.target.value);
                    setFormData({...formData, tipoCorte: e.target.value, valor: s?.valor || '', duracao: s?.tempo || 30 });
                  }}>
                    <option value="">Selecione o Serviço</option>
                    {servicos.map((s, i) => <option key={i} value={s.nome}>{s.nome} — R$ {s.valor}</option>)}
                  </select>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="relative">
                  <IoPersonOutline className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" />
                  <select required className={`${inputClass} pl-11 appearance-none`} value={formData.barbeiroId} onChange={e => setFormData({...formData, barbeiroId: e.target.value, hora: ''})}>
                    <option value="">Selecione o Barbeiro</option>
                    {barbeiros.map(b => <option key={b._id} value={b._id}>{b.nome}</option>)}
                  </select>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 px-1">Horários Livres</span>
                  <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {loading ? (
                       <div className="col-span-4 py-4 text-center text-[10px] animate-pulse">Buscando agenda...</div>
                    ) : horariosDisponiveis.length > 0 ? (
                      horariosDisponiveis.map(h => (
                        <button key={h} type="button" onClick={() => setFormData({...formData, hora: h})} className={`p-3 rounded-xl font-bold text-[11px] transition-all ${formData.hora === h ? 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : isDarkMode ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                          {h}
                        </button>
                      ))
                    ) : (
                      <div className="col-span-4 py-4 text-center text-[10px] opacity-40">Sem horários para este dia</div>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-tighter opacity-40 px-1">Já Agendados</span>
                  <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                    {agendamentosDoDia.length > 0 ? agendamentosDoDia.map((ag, idx) => (
                      <div key={idx} className={`flex items-center justify-between p-3 rounded-xl border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-3">
                          <div className="text-[#e6b32a] bg-[#e6b32a]/10 p-2 rounded-lg"><IoTimeOutline size={14}/></div>
                          <div>
                            <p className={`text-[11px] font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{ag.cliente?.nome}</p>
                            <p className="text-[9px] opacity-50 uppercase font-black">{ag.tipoCorte}</p>
                          </div>
                        </div>
                        <span className="text-[10px] font-black text-[#e6b32a]">
                          {new Date(ag.datahora).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', timeZone: 'UTC'})}
                        </span>
                      </div>
                    )) : (
                      <p className="text-[10px] opacity-20 font-bold text-center py-2">Nenhum compromisso ainda</p>
                    )}
                  </div>
                </div>

                <button type="submit" disabled={!formData.hora || loading} className="w-full py-6 bg-[#e6b32a] text-black rounded-[2rem] font-black text-[11px] uppercase tracking-[3px] shadow-xl hover:scale-[1.02] transition-all disabled:opacity-30">
                  {loading ? 'Sincronizando...' : 'Finalizar Agendamento'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}