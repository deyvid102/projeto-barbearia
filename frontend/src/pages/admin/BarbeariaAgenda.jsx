import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert'; 
import { 
  IoArrowBack, IoSaveOutline, IoCalendarOutline, 
  IoChevronForward, IoChevronBack, 
  IoLockClosedOutline, IoPersonOutline, IoExpandOutline, 
  IoCloseOutline, IoSettingsOutline, IoCloudUploadOutline,
  IoTimeOutline, IoCheckmarkCircle
} from 'react-icons/io5';

export default function BarbeariaAgenda() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [realBarbeariaId, setRealBarbeariaId] = useState(null);
  const [listaBarbeiros, setListaBarbeiros] = useState([]); 
  const [gradeMensal, setGradeMensal] = useState([]);
  const [diaExpandido, setDiaExpandido] = useState(null);
  const [sidebarAberta, setSidebarAberta] = useState(false);
  
  const [cacheAgendas, setCacheAgendas] = useState({});
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', type: 'success' });
  const [isModalAberto, setIsModalAberto] = useState(false);

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const [mesSelecionado, setMesSelecionado] = useState(hoje.getMonth());
  const [anoSelecionado, setAnoSelecionado] = useState(hoje.getFullYear());

  const mesesNome = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];
  const diasSemanaLongos = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

  useEffect(() => {
    resolveAndFetch();
  }, [mesSelecionado, anoSelecionado]);

  const isDataPassada = (dia) => {
    const dataComparacao = new Date(anoSelecionado, mesSelecionado, dia);
    dataComparacao.setHours(0, 0, 0, 0);
    return dataComparacao < hoje;
  };

  const resolveAndFetch = async () => {
    const chaveCache = `${mesSelecionado}-${anoSelecionado}`;
    if (cacheAgendas[chaveCache]) {
      setGradeMensal(cacheAgendas[chaveCache]);
      return;
    }

    try {
      setLoading(true);
      const resUser = await api.get(`/barbeiros/${id}`);
      const dadosUser = resUser.data || resUser;
      const bId = dadosUser.fk_barbearia?._id || dadosUser.fk_barbearia;
      
      if (!bId) throw new Error("barbearia não encontrada.");
      setRealBarbeariaId(bId);

      const [resB, resBarbeiros] = await Promise.all([
        api.get(`/barbearias/${bId}`),
        api.get(`/barbeiros`)
      ]);

      const dadosB = resB.data || resB;
      const barbeirosFiltrados = (resBarbeiros.data || resBarbeiros).filter(b => {
        const idB = b.fk_barbearia?._id || b.fk_barbearia;
        return idB && idB.toString() === bId.toString();
      });
      
      setListaBarbeiros(barbeirosFiltrados);

      const diasNoMes = new Date(anoSelecionado, mesSelecionado + 1, 0).getDate();
      let gradeFinal = [];

      if (dadosB.agenda_detalhada && 
          Number(dadosB.agenda_detalhada.mes) === Number(mesSelecionado) && 
          Number(dadosB.agenda_detalhada.ano) === Number(anoSelecionado)) {
        
        const gradeDoBanco = dadosB.agenda_detalhada.grade || [];
        gradeFinal = Array.from({ length: diasNoMes }, (_, i) => {
          const diaNum = i + 1;
          const diaSalvo = gradeDoBanco.find(d => d.dia === diaNum);
          
          if (diaSalvo) {
            return {
              ...diaSalvo,
              dia: diaNum,
              status: isDataPassada(diaNum) ? 'F' : (diaSalvo.status || 'P'),
              abertura: diaSalvo.abertura || '08:00',
              fechamento: diaSalvo.fechamento || '19:00',
              escalas: diaSalvo.escalas || []
            };
          }

          const dataRef = new Date(anoSelecionado, mesSelecionado, diaNum);
          return {
            dia: diaNum,
            diaSemana: dataRef.getDay(),
            status: dataRef < hoje ? 'F' : (dataRef.getDay() === 0 ? 'I' : 'P'), 
            abertura: '08:00',
            fechamento: '19:00',
            escalas: []
          };
        });
      } else {
        gradeFinal = gerarGradePadrao(diasNoMes);
      }

      setGradeMensal(gradeFinal);
      setCacheAgendas(prev => ({ ...prev, [chaveCache]: gradeFinal }));
    } catch (error) {
      console.error("Erro ao carregar:", error);
    } finally {
      setLoading(false);
    }
  };

  const gerarGradePadrao = (diasNoMes) => {
    const novaGrade = [];
    for (let i = 1; i <= diasNoMes; i++) {
      const dataRef = new Date(anoSelecionado, mesSelecionado, i);
      novaGrade.push({
        dia: i,
        diaSemana: dataRef.getDay(),
        status: dataRef < hoje ? 'F' : (dataRef.getDay() === 0 ? 'I' : 'P'), 
        abertura: '08:00',
        fechamento: '19:00',
        escalas: []
      });
    }
    return novaGrade;
  };

  const atualizarGradeECache = (novaGrade) => {
    setGradeMensal(novaGrade);
    setCacheAgendas(prev => ({ ...prev, [`${mesSelecionado}-${anoSelecionado}`]: novaGrade }));
  };

  const updateDiaBase = (dia, campo, valor) => {
    const novaGrade = gradeMensal.map(d => d.dia === dia ? { ...d, [campo]: valor } : d);
    atualizarGradeECache(novaGrade);
  };

  const aplicarRegraPadrao = (diaSemanaAlvo, ativar) => {
    const novoStatus = ativar ? 'P' : 'I'; 
    const novaGrade = gradeMensal.map(d => 
      (d.diaSemana === diaSemanaAlvo && !isDataPassada(d.dia)) ? { ...d, status: novoStatus } : d
    );
    atualizarGradeECache(novaGrade);
  };

  const toggleBarbeiroNoDia = (dia, barbeiroId) => {
    const bIdStr = barbeiroId.toString();
    const novaGrade = gradeMensal.map(d => {
      if (d.dia === dia) {
        const escalasAtuais = d.escalas || [];
        const existe = escalasAtuais.some(e => (e.barbeiroId?._id || e.barbeiroId)?.toString() === bIdStr);
        let novasEscalas = [];
        if (existe) {
          novasEscalas = escalasAtuais.filter(e => (e.barbeiroId?._id || e.barbeiroId)?.toString() !== bIdStr);
        } else {
          novasEscalas = [...escalasAtuais, { barbeiroId: bIdStr, entrada: d.abertura, saida: d.fechamento }];
        }
        
        const diaAtualizado = { ...d, escalas: novasEscalas };
        if (diaExpandido && diaExpandido.dia === dia) setDiaExpandido(diaAtualizado);
        return diaAtualizado;
      }
      return d;
    });
    atualizarGradeECache(novaGrade);
  };

  const updateEscalaBarbeiro = (dia, barbeiroId, campo, valor) => {
    const bIdStr = barbeiroId.toString();
    const novaGrade = gradeMensal.map(d => {
      if (d.dia === dia) {
        const novasEscalas = (d.escalas || []).map(esc => 
          (esc.barbeiroId?._id || esc.barbeiroId)?.toString() === bIdStr 
          ? { ...esc, [campo]: valor } : esc
        );
        
        const diaAtualizado = { ...d, escalas: novasEscalas };
        // ESSENCIAL: Atualiza o modal aberto para permitir a edição em tempo real
        if (diaExpandido && diaExpandido.dia === dia) setDiaExpandido(diaAtualizado);
        return diaAtualizado;
      }
      return d;
    });
    atualizarGradeECache(novaGrade);
  };

  const navegarMes = (direcao) => {
    let nMes = mesSelecionado + direcao;
    let nAno = anoSelecionado;
    if (nMes > 11) { nMes = 0; nAno++; }
    else if (nMes < 0) { nMes = 11; nAno--; }
    setMesSelecionado(nMes);
    setAnoSelecionado(nAno);
    setDiaExpandido(null);
  };

  const handleConfirmarPublicacao = async () => {
    setIsModalAberto(false);
    try {
      setLoading(true);
      const mesesParaPublicar = Object.keys(cacheAgendas);
      for (const chave of mesesParaPublicar) {
        const [m, a] = chave.split('-');
        const gradeEditada = cacheAgendas[chave];
        
        await api.put(`/barbearias/${realBarbeariaId}`, {
          agenda_detalhada: {
            mes: Number(m),
            ano: Number(a),
            grade: gradeEditada.map(item => ({
              ...item,
              escalas: (item.escalas || []).map(esc => ({
                barbeiroId: esc.barbeiroId?._id || esc.barbeiroId,
                entrada: esc.entrada,
                saida: esc.saida
              }))
            }))
          }
        });
      }
      setAlertConfig({ show: true, title: 'Sucesso', message: `Planejamento sincronizado!`, type: 'success' });
      setCacheAgendas({});
    } catch (error) {
      setAlertConfig({ show: true, title: 'Erro', message: 'Falha ao publicar.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const Switch = ({ active, onClick, disabled }) => (
    <div 
      onClick={disabled ? null : onClick}
      className={`relative w-10 h-5 rounded-full transition-all duration-300 ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'} ${active ? 'bg-[#e6b32a]' : 'bg-gray-400 dark:bg-white/10'}`}
    >
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-gray-100 p-4 md:p-6 pb-32">
      
      {alertConfig.show && (
        <CustomAlert 
          title={alertConfig.title}
          message={alertConfig.message}
          type={alertConfig.type}
          onClose={() => setAlertConfig({ ...alertConfig, show: false })}
        />
      )}

      <ModalConfirmacao 
        isOpen={isModalAberto}
        onClose={() => setIsModalAberto(false)}
        onConfirm={handleConfirmarPublicacao}
        titulo="Finalizar Planejamento"
        mensagem="Deseja sincronizar as alterações com o banco de dados?"
      />

      <header className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center active:scale-90 transition-transform">
            <IoArrowBack size={18} />
          </button>
          <h1 className="text-lg font-black italic tracking-tighter uppercase">agenda.<span className="text-[#e6b32a]">pro</span></h1>
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button onClick={() => setSidebarAberta(true)} className="p-3 bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 rounded-xl hover:text-[#e6b32a] active:scale-90 transition-all">
            <IoSettingsOutline size={20} />
          </button>
          <button onClick={() => setIsModalAberto(true)} className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-[#e6b32a] text-black rounded-xl font-black uppercase text-[10px] tracking-widest shadow-lg active:scale-95 transition-all">
            <IoCloudUploadOutline size={16} /> publicar planejamento
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-[#111] p-4 rounded-2xl border border-black/5 dark:border-white/5 mb-6 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3 font-black uppercase tracking-widest text-sm">
            <IoCalendarOutline className="text-[#e6b32a]" /> {mesesNome[mesSelecionado]} {anoSelecionado}
          </div>
          <div className="flex gap-1">
            <button onClick={() => navegarMes(-1)} className="p-2 active:scale-75 transition-transform"><IoChevronBack size={20}/></button>
            <button onClick={() => navegarMes(1)} className="p-2 active:scale-75 transition-transform"><IoChevronForward size={20}/></button>
          </div>
        </div>

        {loading ? (
            <div className="flex flex-col items-center justify-center py-24">
                <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin mb-4" />
                <p className="text-[9px] font-black uppercase tracking-widest opacity-40">carregando dados...</p>
            </div>
        ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
              {gradeMensal.map((item) => {
                  const st = item.status || 'P';
                  const isToday = item.dia === hoje.getDate() && mesSelecionado === hoje.getMonth() && anoSelecionado === hoje.getFullYear();
                  
                  return (
                    <div 
                        key={item.dia}
                        onClick={() => { if (st !== 'F') setDiaExpandido(item) }}
                        className={`group relative p-4 rounded-[2rem] border transition-all duration-300 active:scale-95
                          ${st === 'F' ? 'opacity-40 grayscale pointer-events-none' : 'cursor-pointer'}
                          ${st === 'A' ? 'bg-[#e6b32a] border-transparent text-black' : 'bg-white dark:bg-[#111] border-black/5 dark:border-white/5'}
                          ${isToday ? 'ring-2 ring-offset-2 ring-[#e6b32a] dark:ring-offset-[#070707]' : ''}
                        `}
                    >
                        <div className="flex flex-col items-center text-center">
                          <span className={`text-[9px] uppercase font-black ${st === 'A' ? 'text-black/60' : 'opacity-30'}`}>
                            {["dom", "seg", "ter", "qua", "qui", "sex", "sab"][item.diaSemana]}
                          </span>
                          <span className="text-3xl font-black my-1">{item.dia}</span>
                          
                          <div className="mt-2 flex -space-x-2">
                             {(item.escalas || []).slice(0, 3).map((_, idx) => (
                               <div key={idx} className={`w-2 h-2 rounded-full border ${st === 'A' ? 'bg-black border-[#e6b32a]' : 'bg-[#e6b32a] border-white dark:border-[#111]'}`} />
                             ))}
                          </div>
                        </div>
                    </div>
                  );
              })}
            </div>
        )}
      </main>

      {/* SIDEBAR DE CONFIGURAÇÕES */}
      {sidebarAberta && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSidebarAberta(false)} />
          <div className="relative w-full max-w-sm bg-white dark:bg-[#0f0f0f] h-full shadow-2xl p-8 overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black uppercase tracking-tighter">Regras <span className="text-[#e6b32a]">Padrão</span></h2>
              <button onClick={() => setSidebarAberta(false)} className="p-2 bg-gray-100 dark:bg-white/5 rounded-full"><IoCloseOutline size={24}/></button>
            </div>
            
            <p className="text-[10px] font-bold uppercase opacity-40 mb-6 leading-relaxed">Defina quais dias da semana a barbearia costuma abrir para preencher automaticamente.</p>

            <div className="space-y-3">
              {diasSemanaLongos.map((diaNome, idx) => {
                const isActive = gradeMensal.some(d => d.diaSemana === idx && d.status === 'P');
                return (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-white/5 rounded-2xl border border-black/5 dark:border-white/5">
                    <span className="text-xs font-black uppercase">{diaNome}</span>
                    <Switch active={isActive} onClick={() => aplicarRegraPadrao(idx, !isActive)} />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DETALHES DO DIA */}
      {diaExpandido && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0f0f0f] w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl">
            <header className="p-6 flex items-center justify-between bg-black/20">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black ${diaExpandido.status === 'A' ? 'bg-[#e6b32a] text-black' : 'bg-gray-200 dark:bg-gray-800'}`}>
                  <span className="text-xl">{diaExpandido.dia}</span>
                  <span className="text-[8px] uppercase">{diasSemanaLongos[diaExpandido.diaSemana]?.substring(0,3)}</span>
                </div>
                <div>
                   <h2 className="text-sm font-black uppercase tracking-tighter">Configurar Dia</h2>
                   <p className="text-[9px] opacity-50 font-bold uppercase">Gestão de escala e horários</p>
                </div>
              </div>
              <button onClick={() => setDiaExpandido(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors"><IoCloseOutline size={24}/></button>
            </header>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                <div className="flex gap-2 bg-gray-100 dark:bg-black/20 p-2 rounded-2xl">
                    {['A', 'P', 'I'].map((st) => (
                      <button 
                        key={st} 
                        onClick={() => { updateDiaBase(diaExpandido.dia, 'status', st); setDiaExpandido({...diaExpandido, status: st}); }}
                        className={`flex-1 py-3 text-[10px] font-black uppercase rounded-xl transition-all ${diaExpandido.status === st ? 'bg-[#e6b32a] text-black shadow-lg' : 'text-gray-400 hover:text-gray-600 dark:hover:text-white'}`}
                      >
                        {st === 'A' ? 'Publicado' : st === 'P' ? 'Pendente' : 'Inativo'}
                      </button>
                    ))}
                </div>

                {diaExpandido.status !== 'I' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                            <span className="text-[8px] font-black uppercase opacity-40 block mb-1">Abertura Loja</span>
                            <div className="flex items-center gap-2">
                                <IoTimeOutline className="text-[#e6b32a]" />
                                <input type="time" value={diaExpandido.abertura || '08:00'} onChange={(e) => { updateDiaBase(diaExpandido.dia, 'abertura', e.target.value); setDiaExpandido({...diaExpandido, abertura: e.target.value}); }} className="bg-transparent border-none w-full text-xl font-black focus:ring-0 outline-none" />
                            </div>
                        </div>
                        <div className="bg-gray-50 dark:bg-black/20 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                            <span className="text-[8px] font-black uppercase opacity-40 block mb-1">Fechamento Loja</span>
                            <div className="flex items-center gap-2">
                                <IoTimeOutline className="text-[#e6b32a]" />
                                <input type="time" value={diaExpandido.fechamento || '19:00'} onChange={(e) => { updateDiaBase(diaExpandido.dia, 'fechamento', e.target.value); setDiaExpandido({...diaExpandido, fechamento: e.target.value}); }} className="bg-transparent border-none w-full text-xl font-black focus:ring-0 outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-[10px] font-black uppercase opacity-40 tracking-widest">Equipe em serviço</h3>
                        {listaBarbeiros.map(b => {
                            const escala = (diaExpandido.escalas || []).find(e => (e.barbeiroId?._id || e.barbeiroId)?.toString() === b._id.toString());
                            return (
                                <div key={b._id} className={`p-4 rounded-[2rem] border-2 transition-all ${escala ? 'border-[#e6b32a] bg-[#e6b32a]/5' : 'border-transparent bg-gray-50 dark:bg-black/20 opacity-60'}`}>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-white/10 flex items-center justify-center text-[10px] font-black uppercase">
                                              {b.nome?.substring(0,2)}
                                            </div>
                                            <span className="text-xs font-black uppercase">{b.nome}</span>
                                        </div>
                                        <Switch active={!!escala} onClick={() => toggleBarbeiroNoDia(diaExpandido.dia, b._id)} />
                                    </div>
                                    
                                    {escala && (
                                      <div className="flex gap-2 mt-2">
                                         <div className="flex-1 bg-white dark:bg-black/40 rounded-xl p-2 border border-black/5 dark:border-white/10">
                                            <span className="text-[7px] uppercase font-bold opacity-30 block text-center">Entrada</span>
                                            <input 
                                              type="time" 
                                              value={escala.entrada} 
                                              onChange={(e) => updateEscalaBarbeiro(diaExpandido.dia, b._id, 'entrada', e.target.value)} 
                                              className="w-full bg-transparent text-[11px] font-black text-center border-none focus:ring-0 outline-none" 
                                            />
                                         </div>
                                         <div className="flex-1 bg-white dark:bg-black/40 rounded-xl p-2 border border-black/5 dark:border-white/10">
                                            <span className="text-[7px] uppercase font-bold opacity-30 block text-center">Saída</span>
                                            <input 
                                              type="time" 
                                              value={escala.saida} 
                                              onChange={(e) => updateEscalaBarbeiro(diaExpandido.dia, b._id, 'saida', e.target.value)} 
                                              className="w-full bg-transparent text-[11px] font-black text-center border-none focus:ring-0 outline-none" 
                                            />
                                         </div>
                                      </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                  </div>
                )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}