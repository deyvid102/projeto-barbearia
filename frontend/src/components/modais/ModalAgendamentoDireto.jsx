import React, { useState, useEffect } from 'react';
import { api } from '../../services/Api';
import { 
  IoCloseOutline, IoPersonOutline, IoLogoWhatsapp, 
  IoArrowBackOutline, IoCutOutline, IoTimeOutline
} from 'react-icons/io5';

export default function ModalAgendamentoDireto({ isOpen, onClose, onSave, isDarkMode, dataAgendamento, selectedDate }) {
  const [step, setStep] = useState(1);
  const [servicos, setServicos] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    tipoCorte: '',
    valor: 0,
    tempo: 30,
    cliente: { nome: '', numero: '' }
  });

  useEffect(() => {
    if (isOpen && dataAgendamento?.barbeiro) {
      carregarServicos();
      setStep(1);
      setForm(prev => ({ ...prev, cliente: { nome: '', numero: '' } }));
    }
  }, [isOpen, dataAgendamento]);

  const carregarServicos = async () => {
    try {
      setLoading(true);
      const idBarbearia = dataAgendamento.barbeiro.fk_barbearia?._id || dataAgendamento.barbeiro.fk_barbearia;
      const res = await api.get(`/barbearias/${idBarbearia}`);
      setServicos(res.data?.servicos || []);
    } catch (err) {
      console.error("Erro ao carregar serviços:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatarWhatsApp = (value) => {
    const nums = value.replace(/\D/g, "").substring(0, 11);
    let wm = nums;
    if (nums.length > 2) wm = `(${nums.substring(0, 2)}) ${nums.substring(2)}`;
    if (nums.length > 7) wm = `(${nums.substring(0, 2)}) ${nums.substring(2, 7)}-${nums.substring(7)}`;
    return wm;
  };

  const handleFinalizar = () => {
    // dataAgendamento.hora vem como "09:00"
    // selectedDate vem do Dashboard como objeto Date
    const dataBase = selectedDate.toISOString().split('T')[0];
    const start = new Date(`${dataBase}T${dataAgendamento.hora}:00`);
    const end = new Date(start.getTime() + (form.tempo * 60000));

    const payload = {
      tipoCorte: form.tipoCorte,
      cliente: { 
        nome: form.cliente.nome, 
        numero: form.cliente.numero.replace(/\D/g, '') 
      },
      datahora: start.toISOString(),
      datahora_fim: end.toISOString(),
      tempo_estimado: form.tempo,
      valor: form.valor,
      status: 'A',
      fk_barbeiro: dataAgendamento.barbeiro._id,
      fk_barbearia: dataAgendamento.barbeiro.fk_barbearia?._id || dataAgendamento.barbeiro.fk_barbearia
    };

    onSave(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/90 backdrop-blur-xl p-4">
      <div className={`w-full max-w-2xl overflow-hidden rounded-[3rem] border shadow-2xl ${
        isDarkMode ? 'bg-[#0a0a0a] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        
        <header className="p-6 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#e6b32a] flex items-center justify-center text-black">
              <IoCutOutline size={20} />
            </div>
            <div>
              <h3 className="font-black text-sm uppercase tracking-tighter">Novo Agendamento</h3>
              <p className="text-[10px] font-bold opacity-50 uppercase tracking-widest">
                {dataAgendamento?.barbeiro?.nome} • {dataAgendamento?.hora}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-red-500/10 hover:text-red-500 rounded-full transition-all">
            <IoCloseOutline size={28} />
          </button>
        </header>

        <main className="p-8">
          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in zoom-in-95">
              <p className="text-[10px] font-black uppercase tracking-[3px] text-center opacity-40">Selecione o Serviço</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {servicos.map((s, idx) => (
                  <button 
                    key={idx}
                    onClick={() => { setForm({...form, tipoCorte: s.nome, valor: s.valor, tempo: s.tempo}); setStep(2); }}
                    className={`p-5 rounded-2xl border-2 text-left transition-all hover:border-[#e6b32a] ${
                      isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'
                    }`}
                  >
                    <p className="font-black text-sm uppercase">{s.nome}</p>
                    <p className="text-[#e6b32a] font-black text-lg">R$ {s.valor}</p>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4">
               <button onClick={() => setStep(1)} className="flex items-center gap-2 text-[10px] font-black uppercase opacity-50 hover:opacity-100">
                <IoArrowBackOutline /> Voltar aos serviços
              </button>

              <div className="space-y-4">
                <div className="relative">
                  <IoPersonOutline className="absolute left-5 top-1/2 -translate-y-1/2 text-[#e6b32a]" />
                  <input 
                    type="text" placeholder="Nome do Cliente"
                    className={`w-full p-5 pl-14 rounded-2xl border-2 outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'} focus:border-[#e6b32a]`}
                    value={form.cliente.nome}
                    onChange={e => setForm({...form, cliente: {...form.cliente, nome: e.target.value}})}
                  />
                </div>

                <div className="relative">
                  <IoLogoWhatsapp className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-500" />
                  <input 
                    type="tel" placeholder="(00) 00000-0000"
                    className={`w-full p-5 pl-14 rounded-2xl border-2 outline-none transition-all ${isDarkMode ? 'bg-black/40 border-white/10' : 'bg-slate-50 border-slate-200'} focus:border-[#e6b32a]`}
                    value={form.cliente.numero}
                    onChange={e => setForm({...form, cliente: {...form.cliente, numero: formatarWhatsApp(e.target.value)}})}
                  />
                </div>
              </div>

              <div className={`p-5 rounded-2xl border-2 border-dashed ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
                <div className="flex justify-between text-[10px] font-black uppercase">
                  <span className="opacity-40">Resumo</span>
                  <span>{form.tipoCorte} • R$ {form.valor}</span>
                </div>
              </div>

              <button 
                disabled={!form.cliente.nome}
                onClick={handleFinalizar}
                className="w-full py-6 rounded-2xl bg-emerald-600 text-white font-black uppercase text-xs tracking-[4px] shadow-lg hover:scale-[1.02] active:scale-95 transition-all"
              >
                Confirmar Agendamento
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}