import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert';
import AdminLayout from '../../layout/layout';

import { 
  IoTrashOutline,
  IoChevronBack, 
  IoChevronForward,
  IoFastFoodOutline,
  IoPersonOutline,
  IoAddOutline,
  IoFlashOutline,
  IoTimeOutline,
  IoCloseOutline
} from 'react-icons/io5';

export default function BarbeariaAgenda() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', type: 'error' });
  const [configBarbeiros, setConfigBarbeiros] = useState({});
  const [barbeariaId, setBarbeariaId] = useState(null);
  const [horariosBase, setHorariosBase] = useState([]); // Armazena o array do seu Model

  const [autoRange, setAutoRange] = useState({ inicio: '', fim: '' });
  const [diasBloqueados, setDiasBloqueados] = useState([0]); 
  const [diaSelecionadoHistorico, setDiaSelecionadoHistorico] = useState(null);

  const hojeStr = new Date().toLocaleDateString('en-CA');

  useEffect(() => {
    carregarDados();
  }, [currentMonth]);

  const carregarDados = async () => {
    try {
      setLoading(true);
      const [resB, resA] = await Promise.all([
        api.get('/barbeiros'),
        api.get('/agendas')
      ]);

      const listaB = Array.isArray(resB.data || resB) ? (resB.data || resB) : [];
      const adminLogado = listaB.find(b => String(b._id) === String(id));

      if (adminLogado) {
        const bId = adminLogado.fk_barbearia?._id || adminLogado.fk_barbearia || adminLogado.barbearia_id;
        setBarbeariaId(bId);
        
        try {
          const resBarb = await api.get(`/barbearias/${bId}`);
          if (resBarb.data && resBarb.data.horarios_padrao) {
            setHorariosBase(resBarb.data.horarios_padrao);
            
            // Atualiza dias bloqueados automaticamente baseado no campo 'ativo' do seu Model
            const inativos = resBarb.data.horarios_padrao
              .filter(h => !h.ativo)
              .map(h => h.dia);
            setDiasBloqueados(inativos);
          }
        } catch (e) { console.log("Erro ao buscar horários da barbearia"); }
      }

      setBarbeiros(listaB);
      setAgendas(Array.isArray(resA.data || resA) ? (resA.data || resA) : []);

      // Configuração inicial dos profissionais
      const configs = { ...configBarbeiros };
      listaB.forEach(b => {
        if (!configs[b._id]) {
          // Busca o horário de SEGUNDA (dia 1) como padrão inicial da UI
          const hSegunda = horariosBase.find(h => h.dia === 1) || { abertura: '08:00', fechamento: '18:00' };
          configs[b._id] = {
            selecionado: false,
            abertura: hSegunda.abertura,
            fechamento: hSegunda.fechamento,
            hasIntervalo: false,
            intervalo_inicio: '12:00',
            intervalo_fim: '13:00'
          };
        }
      });
      setConfigBarbeiros(configs);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const aplicarAutomacao = async () => {
    const selecionadosIds = Object.keys(configBarbeiros).filter(id => configBarbeiros[id].selecionado);
    if (selecionadosIds.length === 0 || !autoRange.inicio || !autoRange.fim) {
      return setAlertConfig({ show: true, title: 'Atenção', message: 'Selecione profissionais e datas.', type: 'error' });
    }

    try {
      setLoading(true);
      let dataAtual = new Date(autoRange.inicio + 'T00:00:00');
      const dataFim = new Date(autoRange.fim + 'T00:00:00');
      const promessas = [];

      while (dataAtual <= dataFim) {
        const dStr = dataAtual.toISOString().split('T')[0];
        const diaSemana = dataAtual.getDay(); // 0-6

        // Verifica se o dia não está bloqueado
        if (!diasBloqueados.includes(diaSemana) && dStr >= hojeStr) {
          
          // Busca o horário específico deste dia da semana salvo no seu ModelBarbearia
          const configDiaCasa = horariosBase.find(h => h.dia === diaSemana);
          
          selecionadosIds.forEach(idB => {
            const confProfissional = configBarbeiros[idB];
            const jaExiste = agendas.some(a => a.data?.startsWith(dStr) && (a.fk_barbeiro?._id || a.fk_barbeiro) === idB);
            
            if (!jaExiste) {
              promessas.push(api.post('/agendas', {
                data: dStr,
                // Prioriza o horário definido no seu Model para aquele dia da semana
                abertura: configDiaCasa?.abertura || confProfissional.abertura,
                fechamento: configDiaCasa?.fechamento || confProfissional.fechamento,
                intervalo_inicio: confProfissional.hasIntervalo ? confProfissional.intervalo_inicio : null,
                intervalo_fim: confProfissional.hasIntervalo ? confProfissional.intervalo_fim : null,
                fk_barbeiro: idB,
                fk_barbearia: barbeariaId
              }));
            }
          });
        }
        dataAtual.setDate(dataAtual.getDate() + 1);
      }
      await Promise.all(promessas);
      setAlertConfig({ show: true, title: 'Sucesso', message: 'Escalas geradas com os horários da casa!', type: 'success' });
      carregarDados();
    } catch (err) {
      setAlertConfig({ show: true, title: 'Erro', message: 'Falha na automação.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const gerenciarCliqueDia = (dStr, escalas) => {
    if (dStr < hojeStr) {
      setDiaSelecionadoHistorico({ data: dStr, escalas });
    } else {
      selecionarDia(dStr);
    }
  };

  const selecionarDia = async (dataStr) => {
    const selecionadosIds = Object.keys(configBarbeiros).filter(id => configBarbeiros[id].selecionado);
    if (selecionadosIds.length === 0) return setAlertConfig({ show: true, title: 'Atenção', message: 'Selecione um profissional.', type: 'error' });

    const dataObj = new Date(dataStr + 'T00:00:00');
    const configDiaCasa = horariosBase.find(h => h.dia === dataObj.getDay());

    try {
      setLoading(true);
      const promessas = selecionadosIds.filter(idB => {
        return !agendas.some(esc => (esc.fk_barbeiro?._id || esc.fk_barbeiro) === idB && esc.data?.startsWith(dataStr));
      }).map(idB => {
        const conf = configBarbeiros[idB];
        return api.post('/agendas', {
          data: dataStr,
          abertura: configDiaCasa?.abertura || conf.abertura,
          fechamento: configDiaCasa?.fechamento || conf.fechamento,
          intervalo_inicio: conf.hasIntervalo ? conf.intervalo_inicio : null,
          intervalo_fim: conf.hasIntervalo ? conf.intervalo_fim : null,
          fk_barbeiro: idB,
          fk_barbearia: barbeariaId
        });
      });
      await Promise.all(promessas);
      carregarDados();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const excluirAgenda = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/agendas/${id}`);
      carregarDados();
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const getIniciais = (n) => (n || "??").substring(0, 2).toUpperCase();
  const getCorBarbeiro = (id) => {
    const cores = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600', 'bg-rose-600', 'bg-cyan-600'];
    const idx = id ? id.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0) % cores.length : 0;
    return cores[idx];
  };

  const getDiasCalendario = () => {
    const ano = currentMonth.getFullYear(), mes = currentMonth.getMonth();
    const dias = [], primeiro = new Date(ano, mes, 1).getDay(), ultimo = new Date(ano, mes + 1, 0).getDate();
    for (let i = 0; i < primeiro; i++) dias.push(null);
    for (let i = 1; i <= ultimo; i++) dias.push(new Date(ano, mes, i));
    return dias;
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto p-4 md:p-8 pb-20">
        {loading && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
            <div className="w-12 h-12 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        
        {alertConfig.show && <CustomAlert {...alertConfig} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />}

        {/* MODAL DE HISTÓRICO */}
        {diaSelecionadoHistorico && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className={`w-full max-w-md rounded-[2.5rem] p-8 border ${isDarkMode ? 'bg-[#0d0d0d] border-white/10' : 'bg-white border-slate-200'}`}>
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-xl font-black italic lowercase tracking-tighter">historico.<span className="text-[#e6b32a]">escalas</span></h3>
                  <p className="text-[9px] font-black uppercase opacity-40 mt-1 tracking-widest">{new Date(diaSelecionadoHistorico.data + 'T00:00:00').toLocaleDateString('pt-BR', { dateStyle: 'full' })}</p>
                </div>
                <button onClick={() => setDiaSelecionadoHistorico(null)} className="p-2 hover:bg-red-500/10 text-red-500 rounded-full transition-colors"><IoCloseOutline size={24}/></button>
              </div>
              <div className="space-y-3">
                {diaSelecionadoHistorico.escalas.length > 0 ? diaSelecionadoHistorico.escalas.map(esc => (
                  <div key={esc._id} className={`p-4 rounded-2xl flex items-center justify-between border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-xl ${getCorBarbeiro(esc.fk_barbeiro?._id || esc.fk_barbeiro)} flex items-center justify-center text-[10px] font-black text-white`}>
                        {getIniciais(esc.fk_barbeiro?.nome || '??')}
                      </div>
                      <span className="font-bold text-sm lowercase">{esc.fk_barbeiro?.nome || 'Profissional'}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black">{esc.abertura} - {esc.fechamento}</p>
                      {esc.intervalo_inicio && <p className="text-[8px] font-bold opacity-40 uppercase tracking-tighter">Pausa: {esc.intervalo_inicio} - {esc.intervalo_fim}</p>}
                    </div>
                  </div>
                )) : <p className="text-center py-10 text-[10px] font-black uppercase opacity-20 tracking-[4px]">Sem registros</p>}
              </div>
              <button onClick={() => setDiaSelecionadoHistorico(null)} className="w-full mt-6 py-4 bg-white/5 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors">Fechar Visualização</button>
            </div>
          </div>
        )}

        <header className="mb-10">
          <h1 className="text-3xl font-black italic lowercase tracking-tighter leading-none">
            escalas.<span className="text-[#e6b32a]">profissionais</span>
          </h1>
          <p className="text-[10px] uppercase tracking-[3px] font-bold opacity-40 mt-2">Gestão e Automação de Turnos</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-4 space-y-8">
            <section className="space-y-4">
              <div className="flex items-center gap-2 px-2">
                <div className="w-1.5 h-4 bg-[#e6b32a] rounded-full" />
                <h2 className="text-[10px] font-black uppercase tracking-widest text-[#e6b32a]">1. Configurar Turno</h2>
              </div>
              <div className="space-y-4">
                {barbeiros.map(b => {
                  const conf = configBarbeiros[b._id] || {};
                  return (
                    <div key={b._id} className={`p-5 rounded-[2rem] border-2 transition-all ${conf.selecionado ? 'border-[#e6b32a] bg-[#e6b32a]/5' : isDarkMode ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-100'}`}>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs text-white ${getCorBarbeiro(b._id)}`}>{getIniciais(b.nome)}</div>
                          <span className="font-black text-lg lowercase tracking-tighter truncate w-32">{b.nome}</span>
                        </div>
                        <button onClick={() => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, selecionado: !conf.selecionado}}))} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest ${conf.selecionado ? 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : 'bg-white/5 text-gray-400 border border-white/10'}`}>
                          {conf.selecionado ? 'Ativo' : 'Off'}
                        </button>
                      </div>

                      {conf.selecionado && (
                        <div className="space-y-5 pt-4 border-t border-white/5 animate-in slide-in-from-top-2">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <label className="text-[8px] uppercase font-black opacity-40">Entrada Base</label>
                              <input type="time" value={conf.abertura} onChange={e => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, abertura: e.target.value}}))} className="w-full bg-transparent border-b border-white/10 py-1 text-sm font-bold focus:border-[#e6b32a] outline-none"/>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[8px] uppercase font-black opacity-40">Saída Base</label>
                              <input type="time" value={conf.fechamento} onChange={e => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, fechamento: e.target.value}}))} className="w-full bg-transparent border-b border-white/10 py-1 text-sm font-bold focus:border-[#e6b32a] outline-none"/>
                            </div>
                          </div>

                          {!conf.hasIntervalo ? (
                            <button onClick={() => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, hasIntervalo: true}}))} className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl border border-dashed border-white/10 text-[9px] font-black uppercase tracking-widest hover:border-[#e6b32a]/50 hover:text-[#e6b32a] transition-all">
                              <IoAddOutline size={16}/> Adicionar Intervalo
                            </button>
                          ) : (
                            <div className={`p-4 rounded-[1.5rem] border ${isDarkMode ? 'bg-white/5 border-[#e6b32a]/20' : 'bg-slate-50 border-slate-200'}`}>
                              <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 text-[#e6b32a]"><IoFastFoodOutline size={14}/><span className="text-[9px] font-black uppercase tracking-tighter">Pausa</span></div>
                                <button onClick={() => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, hasIntervalo: false}}))} className="text-red-500/60"><IoTrashOutline size={14}/></button>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <input type="time" value={conf.intervalo_inicio} onChange={e => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, intervalo_inicio: e.target.value}}))} className="bg-transparent border-b border-white/10 py-1 text-xs font-bold outline-none"/>
                                <input type="time" value={conf.intervalo_fim} onChange={e => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, intervalo_fim: e.target.value}}))} className="bg-transparent border-b border-white/10 py-1 text-xs font-bold outline-none"/>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="p-6 rounded-[2.5rem] bg-[#e6b32a]/5 border-2 border-dashed border-[#e6b32a]/20 space-y-6">
              <div className="flex items-center gap-2 text-[#e6b32a]"><IoFlashOutline size={20}/><h2 className="text-[10px] font-black uppercase tracking-[2px]">Automação em Massa</h2></div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase opacity-40 ml-1">Início</label>
                    <input type="date" value={autoRange.inicio} onChange={e => setAutoRange({...autoRange, inicio: e.target.value})} className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-[10px] font-bold outline-none focus:border-[#e6b32a]"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[7px] font-black uppercase opacity-40 ml-1">Fim</label>
                    <input type="date" value={autoRange.fim} onChange={e => setAutoRange({...autoRange, fim: e.target.value})} className="w-full p-2.5 rounded-xl bg-black/20 border border-white/10 text-[10px] font-bold outline-none focus:border-[#e6b32a]"/>
                  </div>
                </div>
                <div className="space-y-2">
                  <p className="text-[8px] font-black uppercase opacity-40 ml-1">Dias de Folga (Casa Fechada):</p>
                  <div className="flex justify-between gap-1">
                    {['D','S','T','Q','Q','S','S'].map((d, i) => (
                      <button key={i} onClick={() => setDiasBloqueados(p => p.includes(i) ? p.filter(x => x !== i) : [...p, i])} className={`w-8 h-8 rounded-xl text-[9px] font-black transition-all ${diasBloqueados.includes(i) ? 'bg-red-500 text-white' : 'bg-white/5 text-gray-500 border border-white/5'}`}>{d}</button>
                    ))}
                  </div>
                </div>
                <button onClick={aplicarAutomacao} className="w-full py-4 bg-[#e6b32a] text-black rounded-2xl font-black text-[9px] uppercase tracking-[2px] shadow-xl shadow-[#e6b32a]/20 hover:scale-[1.02] active:scale-95 transition-all">Gerar Escalas</button>
              </div>
            </section>
          </aside>

          <main className="lg:col-span-8">
            <div className={`p-6 rounded-[3rem] border ${isDarkMode ? 'bg-[#0d0d0d] border-white/5 shadow-2xl' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-10 px-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-3 hover:bg-[#e6b32a]/10 text-[#e6b32a] rounded-full transition-all"><IoChevronBack size={20}/></button>
                <div className="text-center">
                  <h2 className="font-black uppercase tracking-[4px] text-xs">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                </div>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-3 hover:bg-[#e6b32a]/10 text-[#e6b32a] rounded-full transition-all"><IoChevronForward size={20}/></button>
              </div>

              <div className="grid grid-cols-7 gap-3">
                {['dom','seg','ter','qua','qui','sex','sab'].map(d => <div key={d} className="text-center text-[9px] font-black uppercase opacity-20 mb-4">{d}</div>)}
                
                {getDiasCalendario().map((dia, i) => {
                  if (!dia) return <div key={`empty-${i}`} className="aspect-square" />;
                  const dStr = dia.toLocaleDateString('en-CA');
                  const diaEscalas = agendas.filter(a => a.data?.startsWith(dStr));
                  const isHoje = dStr === hojeStr;
                  const isPassado = dStr < hojeStr;

                  return (
                    <div 
                      key={i} 
                      onClick={() => gerenciarCliqueDia(dStr, diaEscalas)}
                      className={`min-h-[140px] p-3 rounded-3xl border transition-all cursor-pointer relative flex flex-col group ${
                        isHoje ? 'ring-2 ring-[#e6b32a] ring-offset-4 ' + (isDarkMode ? 'ring-offset-[#0d0d0d]' : 'ring-offset-white') : 
                        isPassado ? 'bg-white/5 border-dashed border-white/5 opacity-40 hover:opacity-100' : 
                        isDarkMode ? 'bg-white/5 border-white/5 hover:border-[#e6b32a]/50' : 'bg-slate-50 border-slate-100 hover:border-[#e6b32a]'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[10px] font-black ${isHoje ? 'text-[#e6b32a]' : 'opacity-40'}`}>{dia.getDate()}</span>
                        {isPassado && <IoTimeOutline size={12} className="opacity-20"/>}
                      </div>
                      
                      <div className="flex flex-col gap-1.5 overflow-hidden flex-1">
                        {diaEscalas.map(esc => {
                          const idB = esc.fk_barbeiro?._id || esc.fk_barbeiro;
                          const bNome = esc.fk_barbeiro?.nome || barbeiros.find(b => b._id === idB)?.nome || '??';
                          return (
                            <div key={esc._id} className={`p-1.5 rounded-xl ${getCorBarbeiro(idB)} text-white flex items-center justify-between group/item animate-in zoom-in duration-300`}>
                              <div className="flex items-center gap-1.5 min-w-0">
                                <div className="bg-white/20 w-6 h-6 rounded-lg flex items-center justify-center text-[8px] font-black shrink-0">{getIniciais(bNome)}</div>
                                <p className="text-[8px] font-black truncate">{esc.abertura}</p>
                              </div>
                              {!isPassado && (
                                <button onClick={(e) => { e.stopPropagation(); excluirAgenda(esc._id); }} className="opacity-0 group-hover/item:opacity-100 p-1 hover:text-red-200 transition-opacity"><IoTrashOutline size={10} /></button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}