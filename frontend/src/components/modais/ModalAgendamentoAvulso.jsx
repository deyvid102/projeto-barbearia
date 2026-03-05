import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/Api';
import { 
  IoCloseOutline, IoPersonOutline, IoCutOutline, 
  IoCashOutline, IoTimeOutline, IoCheckmarkCircleOutline,
  IoChevronDownOutline, IoSearchOutline, IoPersonAddOutline
} from 'react-icons/io5';

export default function ModalAgendamentoAvulso({ isOpen, onClose, onSave, isDarkMode }) {
  const [loading, setLoading] = useState(false);
  const [servicos, setServicos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [clientesFiltrados, setClientesFiltrados] = useState([]);
  const [horariosDisponiveis, setHorariosDisponiveis] = useState([]);
  const [barbeariaId, setBarbeariaId] = useState(null);
  
  const [isSelectServicoOpen, setIsSelectServicoOpen] = useState(false);
  const [isSelectClienteOpen, setIsSelectClienteOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    nomeCliente: '',
    fk_cliente: '',
    tipoCorte: '',
    valor: '',
    hora: '',
    tempo: 30
  });

  const carregarDadosBase = useCallback(async () => {
    try {
      const barbeiroId = localStorage.getItem('barbeiroId');
      const [resB, resC] = await Promise.all([
        api.get('/barbeiros'),
        api.get('/clientes')
      ]);

      const barbeirosData = resB.data || resB;
      const barbeiro = barbeirosData.find(b => String(b._id) === String(barbeiroId));
      setClientes(resC.data || resC || []);

      if (barbeiro) {
        const idBarb = barbeiro.fk_barbearia?._id || barbeiro.fk_barbearia;
        setBarbeariaId(idBarb);
        const resBarb = await api.get(`/barbearias/${idBarb}`);
        const barbeariaData = resBarb.data || resBarb;
        setServicos(barbeariaData.servicos || []);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
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
    } catch (error) { console.error(error); }
  }, [formData.tempo]);

  useEffect(() => {
    if (isOpen) {
      carregarDadosBase();
      carregarHorariosDisponiveis();
    }
  }, [isOpen, carregarDadosBase, carregarHorariosDisponiveis]);

  const handleBuscaCliente = (e) => {
    const termo = e.target.value;
    setFormData(prev => ({ ...prev, nomeCliente: termo, fk_cliente: '' }));
    if (termo.length > 0) {
      const filtrados = clientes.filter(c => c.nome.toLowerCase().includes(termo.toLowerCase()));
      setClientesFiltrados(filtrados);
      setIsSelectClienteOpen(true);
    } else {
      setIsSelectClienteOpen(false);
    }
  };

  const criarClienteAvulso = async () => {
    if (!barbeariaId || !formData.nomeCliente) return;
    try {
      setLoading(true);
      const timestamp = Date.now();
      const payload = {
        nome: formData.nomeCliente,
        // Envia email vazio; o Controller que ajustamos vai gerar o avulso_timestamp@sistema.com
        email: "", 
        numero: "00000000000", // Bate com o ModelCliente
        fk_barbearia: barbeariaId
      };
      const res = await api.post('/clientes', payload);
      const novoCliente = res.data || res;
      setFormData(prev => ({ ...prev, fk_cliente: novoCliente._id }));
      setIsSelectClienteOpen(false);
      setClientes(prev => [...prev, novoCliente]);
    } catch (error) {
      console.error("Erro ao criar cliente:", error.response?.data || error);
    } finally {
      setLoading(false);
    }
  };

  const selecionarCliente = (cliente) => {
    setFormData(prev => ({ ...prev, nomeCliente: cliente.nome, fk_cliente: cliente._id }));
    setIsSelectClienteOpen(false);
  };

  const selecionarServico = (s) => {
    setFormData(prev => ({ ...prev, tipoCorte: s.nome, valor: s.valor, tempo: s.tempo }));
    setIsSelectServicoOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.hora || !formData.fk_cliente || !formData.tipoCorte) return;

    const barbeiroId = localStorage.getItem('barbeiroId');
    
    // 1. Calcular Data Início
    const dataInicio = new Date();
    const [horas, minutos] = formData.hora.split(':');
    dataInicio.setHours(parseInt(horas), parseInt(minutos), 0, 0);

    // 2. Calcular Data Fim (Obrigatório no seu Model)
    const dataFim = new Date(dataInicio.getTime() + (formData.tempo * 60000));

    const payloadFinal = {
      tipoCorte: formData.tipoCorte, // Ajustado para bater com camelCase do Model
      datahora: dataInicio.toISOString(),
      datahora_fim: dataFim.toISOString(), // Campo NOVO para bater com ModelAgendamento
      tempo_estimado: Number(formData.tempo),
      valor: Number(formData.valor),
      status: 'A',
      fk_cliente: formData.fk_cliente,
      fk_barbeiro: barbeiroId,
      fk_barbearia: barbeariaId
    };

    onSave(payloadFinal);
    setFormData({ nomeCliente: '', fk_cliente: '', tipoCorte: '', valor: '', hora: '', tempo: 30 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className={`w-full max-w-lg rounded-[2.5rem] border shadow-2xl overflow-visible ${isDarkMode ? 'bg-[#0f0f0f] border-white/10 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="p-8 pb-0 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black italic">novo.<span className="text-[#e6b32a]">agendamento</span></h3>
            <p className="text-[10px] font-bold uppercase opacity-40 tracking-widest mt-1">Balcão</p>
          </div>
          <button onClick={onClose} type="button" className="p-2 hover:text-red-500 transition-colors"><IoCloseOutline size={28} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-5">
          {/* CLIENTE */}
          <div className="relative">
            <div className={`p-4 rounded-2xl border ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}>
              <label className="text-[9px] font-black uppercase text-[#e6b32a] mb-1 block">Identificar Cliente</label>
              <div className="flex items-center gap-3">
                <input 
                  autoComplete="off"
                  type="text" 
                  placeholder="Nome do cliente..."
                  className="bg-transparent border-none focus:ring-0 w-full font-bold text-sm outline-none text-inherit"
                  value={formData.nomeCliente}
                  onChange={handleBuscaCliente}
                />
                {formData.fk_cliente && <IoCheckmarkCircleOutline className="text-emerald-500" size={20} />}
              </div>
            </div>

            {isSelectClienteOpen && (
              <div className={`absolute left-0 right-0 mt-2 border rounded-2xl shadow-2xl z-[200] overflow-hidden ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-100'}`}>
                <div className="max-h-56 overflow-y-auto">
                  {clientesFiltrados.map((c) => (
                    <button key={c._id} type="button" onClick={() => selecionarCliente(c)} className="w-full p-4 flex items-center gap-3 hover:bg-[#e6b32a]/10 border-b last:border-none border-white/5">
                      <p className="text-[11px] font-black uppercase">{c.nome}</p>
                    </button>
                  ))}
                  {!formData.fk_cliente && (
                    <button type="button" onClick={criarClienteAvulso} className="w-full p-5 flex items-center justify-center gap-3 bg-[#e6b32a] text-black font-black uppercase text-[10px]">
                      {loading ? 'Criando...' : <><IoPersonAddOutline size={16} /> Criar "{formData.nomeCliente}"</>}
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* SERVIÇO */}
          <div className={`relative ${!formData.fk_cliente ? 'opacity-30 pointer-events-none' : ''}`}>
            <label className="text-[9px] font-black uppercase text-gray-500 mb-2 block">Serviço</label>
            <button 
              type="button"
              onClick={() => setIsSelectServicoOpen(!isSelectServicoOpen)}
              className={`w-full p-4 rounded-2xl border flex items-center justify-between ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-slate-50 border-slate-200'}`}
            >
              <span className="text-sm font-bold uppercase">{formData.tipoCorte || 'Selecionar'}</span>
              <IoChevronDownOutline size={16} />
            </button>

            {isSelectServicoOpen && (
              <div className={`absolute left-0 right-0 mt-2 border rounded-2xl shadow-2xl z-[190] overflow-hidden ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-100'}`}>
                {servicos.map((s, idx) => (
                  <button key={idx} type="button" onClick={() => selecionarServico(s)} className="w-full p-4 flex items-center justify-between hover:bg-[#e6b32a]/10 border-b border-white/5">
                    <span className="text-[11px] font-black uppercase">{s.nome}</span>
                    <span className="text-xs font-black">R$ {s.valor}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* HORÁRIOS */}
          <div className={!formData.tipoCorte ? 'opacity-30' : ''}>
            <p className="text-[9px] font-black uppercase opacity-40 mb-2 tracking-widest">Horário Disponível</p>
            <div className="grid grid-cols-4 gap-2 max-h-32 overflow-y-auto pr-1">
              {horariosDisponiveis.map(h => (
                <button key={h} type="button" onClick={() => setFormData({...formData, hora: h})} className={`py-2 rounded-xl border text-[10px] font-black transition-all ${formData.hora === h ? 'bg-[#e6b32a] text-black border-[#e6b32a]' : 'bg-white/5 border-white/10'}`}>
                  {h}
                </button>
              ))}
            </div>
          </div>

          <button 
            type="submit"
            disabled={!formData.hora || !formData.fk_cliente}
            className={`w-full py-5 rounded-2xl font-black uppercase text-[11px] tracking-widest transition-all ${(!formData.hora || !formData.fk_cliente) ? 'bg-white/5 text-gray-600' : 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20'}`}
          >
            Confirmar no Balcão
          </button>
        </form>
      </div>
    </div>
  );
}