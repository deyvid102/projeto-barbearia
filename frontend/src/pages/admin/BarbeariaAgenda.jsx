import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api';
import ModalConfirmacao from '../../components/modais/ModalConfirmacao';
import CustomAlert from '../../components/CustomAlert'; 
import { 
  IoArrowBack, IoSaveOutline, IoCalendarOutline, 
  IoChevronForward, IoChevronBack, 
  IoTimeOutline, IoCheckmarkCircle, IoLockClosedOutline,
  IoPersonOutline, IoExpandOutline, IoCloseOutline, IoSettingsOutline,
  IoCheckmarkDoneCircle
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
  
  // Estado para o CustomAlert
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

  const resolveAndFetch = async () => {
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
      const todosBarbeiros = resBarbeiros.data || resBarbeiros;
      
      const vinculados = todosBarbeiros.filter(b => {
        const idB = b.fk_barbearia?._id || b.fk_barbearia;
        return idB.toString() === bId.toString();
      });
      setListaBarbeiros(vinculados);

      const diasNoMes = new Date(anoSelecionado, mesSelecionado + 1, 0).getDate();
      
      if (dadosB.agenda_detalhada && 
          Number(dadosB.agenda_detalhada.mes) === Number(mesSelecionado) && 
          Number(dadosB.agenda_detalhada.ano) === Number(anoSelecionado)) {
        setGradeMensal(dadosB.agenda_detalhada.grade);
      } else {
        gerarGradePadrao(diasNoMes);
      }
    } catch (error) {
      console.error("erro ao carregar agenda:", error);
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
        ativo: dataRef.getDay() !== 0, 
        abertura: '08:00',
        fechamento: '19:00',
        escalas: []
      });
    }
    setGradeMensal(novaGrade);
  };

  const isDataPassada = (dia) => {
    const dataComparacao = new Date(anoSelecionado, mesSelecionado, dia);
    dataComparacao.setHours(0, 0, 0, 0);
    return dataComparacao < hoje;
  };

  const updateDiaBase = (dia, campo, valor) => {
    setGradeMensal(prev => prev.map(d => d.dia === dia ? { ...d, [campo]: valor } : d));
  };

  const toggleDiaRapido = (e, dia, statusAtual) => {
    e.stopPropagation();
    if (isDataPassada(dia)) return;
    updateDiaBase(dia, 'ativo', !statusAtual);
  };

  const aplicarRegraPadrao = (diaSemanaAlvo, statusNovo) => {
    setGradeMensal(prev => prev.map(d => {
      if (d.diaSemana === diaSemanaAlvo && !isDataPassada(d.dia)) {
        return { ...d, ativo: statusNovo };
      }
      return d;
    }));
  };

  const toggleBarbeiroNoDia = (dia, barbeiroId) => {
    setGradeMensal(prev => prev.map(d => {
      if (d.dia === dia) {
        const bIdStr = barbeiroId.toString();
        const escalaExistente = d.escalas.find(e => (e.barbeiroId?._id || e.barbeiroId).toString() === bIdStr);
        
        if (escalaExistente) {
          return { ...d, escalas: d.escalas.filter(e => (e.barbeiroId?._id || e.barbeiroId).toString() !== bIdStr) };
        } else {
          return { ...d, escalas: [...d.escalas, { barbeiroId: bIdStr, entrada: d.abertura, saida: d.fechamento }] };
        }
      }
      return d;
    }));
  };

  const updateEscalaBarbeiro = (dia, barbeiroId, campo, valor) => {
    setGradeMensal(prev => prev.map(d => {
      if (d.dia === dia) {
        return { 
          ...d, 
          escalas: d.escalas.map(esc => 
            (esc.barbeiroId?._id || esc.barbeiroId).toString() === barbeiroId.toString() 
            ? { ...esc, [campo]: valor } 
            : esc
          )
        };
      }
      return d;
    }));
  };

  const navegarMes = (direcao) => {
    let novoMes = mesSelecionado + direcao;
    let novoAno = anoSelecionado;
    if (novoMes > 11) { novoMes = 0; novoAno++; }
    else if (novoMes < 0) { novoMes = 11; novoAno--; }
    setMesSelecionado(novoMes);
    setAnoSelecionado(novoAno);
    setDiaExpandido(null);
  };

  const handleConfirmarPublicacao = async () => {
    setIsModalAberto(false);
    try {
      setLoading(true);
      await api.put(`/barbearias/${realBarbeariaId}`, {
        agenda_detalhada: {
          mes: Number(mesSelecionado),
          ano: Number(anoSelecionado),
          grade: gradeMensal
        }
      });
      setAlertConfig({
        show: true,
        title: 'Sucesso',
        message: 'Agenda publicada com sucesso!',
        type: 'success'
      });
    } catch (error) {
      console.error("Erro ao salvar:", error);
      setAlertConfig({
        show: true,
        title: 'Erro',
        message: 'Não foi possível publicar a agenda.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const Switch = ({ active, onClick, disabled }) => (
    <div 
      onClick={onClick}
      className={`relative w-10 h-5 rounded-full transition-all duration-300 cursor-pointer ${disabled ? 'opacity-30 cursor-not-allowed' : ''} ${active ? 'bg-[#e6b32a]' : 'bg-gray-400 dark:bg-white/10'}`}
    >
      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all duration-300 ${active ? 'left-6' : 'left-1'}`} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#070707] text-gray-900 dark:text-gray-100 p-4 md:p-6 pb-32">
      
      {/* Alerta Padrão do Sistema */}
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
        titulo="Publicar Agenda"
        mensagem="Deseja realmente publicar as alterações na agenda? Isso atualizará a disponibilidade para os clientes."
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
            <IoSaveOutline size={16} /> publicar
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

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-3">
          {gradeMensal.map((item) => {
            const passado = isDataPassada(item.dia);
            return (
              <div 
                key={item.dia}
                onClick={() => setDiaExpandido(item)}
                className={`group relative p-4 rounded-3xl border transition-all duration-300 active:scale-95 ${
                  passado 
                  ? 'opacity-40 bg-gray-200 dark:bg-white/5 border-transparent' 
                  : item.ativo 
                    ? 'bg-white dark:bg-[#111] border-black/5 dark:border-white/10 hover:border-[#e6b32a] shadow-sm' 
                    : 'bg-black/5 border-dashed border-black/10 dark:border-white/5 grayscale opacity-60'
                }`}
              >
                <div className="flex flex-col items-center text-center select-none">
                  <span className={`text-[9px] uppercase font-black transition-opacity ${item.ativo ? 'opacity-40' : 'opacity-20'}`}>
                    {["dom", "seg", "ter", "qua", "qui", "sex", "sab"][item.diaSemana]}
                  </span>
                  <span className={`text-3xl font-black my-1 transition-colors ${item.ativo && !passado ? 'text-[#e6b32a]' : 'text-gray-400'}`}>
                    {item.dia}
                  </span>
                  
                  {!passado && (
                    <div className="mt-2 flex flex-col items-center gap-1">
                      <Switch 
                        active={item.ativo} 
                        onClick={(e) => toggleDiaRapido(e, item.dia, item.ativo)} 
                      />
                      <span className={`text-[7px] font-black uppercase tracking-tighter ${item.ativo ? 'text-green-500' : 'text-red-500'}`}>
                        {item.ativo ? 'Aberto' : 'Fechado'}
                      </span>
                    </div>
                  )}
                </div>

                {!passado && item.ativo && (
                   <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <IoExpandOutline size={14} className="text-[#e6b32a]" />
                   </div>
                )}
              </div>
            );
          })}
        </div>
      </main>

      {/* SIDEBAR DE PADRÕES */}
      <div className={`fixed inset-0 z-[70] ${sidebarAberta ? 'visible' : 'invisible'}`}>
        <div onClick={() => setSidebarAberta(false)} className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity ${sidebarAberta ? 'opacity-100' : 'opacity-0'}`} />
        <aside className={`absolute top-0 right-0 h-full w-full max-w-xs bg-white dark:bg-[#0f0f0f] p-6 shadow-2xl transition-transform duration-300 ${sidebarAberta ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-black uppercase tracking-widest">Ajuste Padrão</h2>
            <button onClick={() => setSidebarAberta(false)} className="p-2"><IoCloseOutline size={28}/></button>
          </div>
          <div className="space-y-4">
            {diasSemanaLongos.map((diaNome, idx) => {
              const diasAtivos = gradeMensal.filter(d => d.diaSemana === idx && !isDataPassada(d.dia) && d.ativo).length;
              const totalDias = gradeMensal.filter(d => d.diaSemana === idx && !isDataPassada(d.dia)).length;
              const isMajorlyActive = diasAtivos > totalDias / 2;

              return (
                <div key={diaNome} className="flex items-center justify-between p-4 bg-black/5 dark:bg-white/5 rounded-2xl border border-black/5">
                  <span className="text-xs font-black uppercase">{diaNome}</span>
                  <Switch 
                    active={isMajorlyActive} 
                    onClick={() => aplicarRegraPadrao(idx, !isMajorlyActive)} 
                  />
                </div>
              );
            })}
          </div>
        </aside>
      </div>

      {/* MODAL DE DETALHES */}
      {diaExpandido && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
          <div className="bg-white dark:bg-[#0f0f0f] w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-in zoom-in-95 duration-200">
            <header className="p-6 flex items-center justify-between bg-black/20 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl flex flex-col items-center justify-center font-black transition-colors ${diaExpandido.ativo ? 'bg-[#e6b32a] text-black' : 'bg-gray-700 text-gray-400'}`}>
                  <span className="text-xl">{diaExpandido.dia}</span>
                  <span className="text-[8px] uppercase">{diasSemanaLongos[diaExpandido.diaSemana].substring(0,3)}</span>
                </div>
                <h2 className="text-sm font-black uppercase tracking-tight">Configuração Detalhada</h2>
              </div>
              <button onClick={() => setDiaExpandido(null)} className="p-2 bg-white/5 rounded-full"><IoCloseOutline size={24}/></button>
            </header>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                <div className="flex items-center justify-between bg-black/10 p-5 rounded-3xl border border-white/5">
                  <span className="text-xs font-black uppercase">Status do Dia</span>
                  <Switch 
                    active={diaExpandido.ativo} 
                    disabled={isDataPassada(diaExpandido.dia)}
                    onClick={() => {
                      if (isDataPassada(diaExpandido.dia)) return;
                      const novo = !diaExpandido.ativo;
                      updateDiaBase(diaExpandido.dia, 'ativo', novo);
                      setDiaExpandido({...diaExpandido, ativo: novo});
                    }} 
                  />
                </div>

                {diaExpandido.ativo && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                            <span className="text-[8px] font-black uppercase opacity-40 block mb-1">Abre às (Geral)</span>
                            <input type="time" value={diaExpandido.abertura} onChange={(e) => {
                                updateDiaBase(diaExpandido.dia, 'abertura', e.target.value);
                                setDiaExpandido({...diaExpandido, abertura: e.target.value});
                            }} className="bg-transparent border-none w-full text-xl font-black focus:ring-0 p-0 text-[#e6b32a]" />
                        </div>
                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                            <span className="text-[8px] font-black uppercase opacity-40 block mb-1">Fecha às (Geral)</span>
                            <input type="time" value={diaExpandido.fechamento} onChange={(e) => {
                                updateDiaBase(diaExpandido.dia, 'fechamento', e.target.value);
                                setDiaExpandido({...diaExpandido, fechamento: e.target.value});
                            }} className="bg-transparent border-none w-full text-xl font-black focus:ring-0 p-0 text-[#e6b32a]" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-[10px] font-black uppercase opacity-40 tracking-widest ml-1">Escala de Profissionais</h3>
                        <div className="grid gap-4">
                            {listaBarbeiros.map(b => {
                                const escala = diaExpandido.escalas.find(e => (e.barbeiroId?._id || e.barbeiroId).toString() === b._id.toString());
                                return (
                                    <div key={b._id} className={`p-4 rounded-3xl border-2 transition-all ${escala ? 'border-[#e6b32a] bg-[#e6b32a]/5' : 'border-transparent bg-black/10 opacity-50'}`}>
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                                    <IoPersonOutline size={14} />
                                                </div>
                                                <span className="text-xs font-black uppercase">{b.nome}</span>
                                            </div>
                                            <Switch 
                                              active={!!escala} 
                                              onClick={() => {
                                                toggleBarbeiroNoDia(diaExpandido.dia, b._id);
                                                const novaEscalaArr = escala 
                                                    ? diaExpandido.escalas.filter(e => (e.barbeiroId?._id || e.barbeiroId).toString() !== b._id.toString())
                                                    : [...diaExpandido.escalas, { barbeiroId: b._id, entrada: diaExpandido.abertura, saida: diaExpandido.fechamento }];
                                                setDiaExpandido({...diaExpandido, escalas: novaEscalaArr});
                                              }} 
                                            />
                                        </div>

                                        {escala && (
                                            <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in slide-in-from-top-1">
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[7px] font-black uppercase opacity-50">Entrada</label>
                                                    <input 
                                                        type="time" 
                                                        value={escala.entrada} 
                                                        onChange={(e) => {
                                                            updateEscalaBarbeiro(diaExpandido.dia, b._id, 'entrada', e.target.value);
                                                            const novasEscalas = diaExpandido.escalas.map(esc => 
                                                                (esc.barbeiroId?._id || esc.barbeiroId).toString() === b._id.toString() 
                                                                ? { ...esc, entrada: e.target.value } : esc
                                                            );
                                                            setDiaExpandido({...diaExpandido, escalas: novasEscalas});
                                                        }}
                                                        className="bg-black/20 border-none rounded-lg text-xs font-bold p-2 text-white focus:ring-1 focus:ring-[#e6b32a]"
                                                    />
                                                </div>
                                                <div className="flex flex-col gap-1">
                                                    <label className="text-[7px] font-black uppercase opacity-50">Saída</label>
                                                    <input 
                                                        type="time" 
                                                        value={escala.saida} 
                                                        onChange={(e) => {
                                                            updateEscalaBarbeiro(diaExpandido.dia, b._id, 'saida', e.target.value);
                                                            const novasEscalas = diaExpandido.escalas.map(esc => 
                                                                (esc.barbeiroId?._id || esc.barbeiroId).toString() === b._id.toString() 
                                                                ? { ...esc, saida: e.target.value } : esc
                                                            );
                                                            setDiaExpandido({...diaExpandido, escalas: novasEscalas});
                                                        }}
                                                        className="bg-black/20 border-none rounded-lg text-xs font-bold p-2 text-white focus:ring-1 focus:ring-[#e6b32a]"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
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