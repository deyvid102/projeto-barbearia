import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  IoAddOutline
} from 'react-icons/io5';

export default function BarbeariaAgenda() {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendas, setAgendas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', type: 'error' });

  const [configBarbeiros, setConfigBarbeiros] = useState({});

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
      setBarbeiros(listaB);
      setAgendas(Array.isArray(resA.data || resA) ? (resA.data || resA) : []);

      const configs = { ...configBarbeiros };
      listaB.forEach(b => {
        if (!configs[b._id]) {
          configs[b._id] = {
            selecionado: false,
            abertura: '08:00',
            fechamento: '18:00',
            hasIntervalo: false,
            intervalo_inicio: '12:00',
            intervalo_fim: '13:00'
          };
        }
      });
      setConfigBarbeiros(configs);
    } catch (err) {
      console.error("Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  };

  const selecionarDia = async (dataStr) => {
    const selecionadosIds = Object.keys(configBarbeiros).filter(id => configBarbeiros[id].selecionado);
    
    if (selecionadosIds.length === 0) {
      return setAlertConfig({ show: true, title: 'Atenção', message: 'Selecione ao menos um profissional no painel lateral.', type: 'error' });
    }

    const novosParaAdicionar = selecionadosIds.filter(idB => {
      const jaExiste = agendas.some(esc => {
        const escIdB = esc.fk_barbeiro?._id || esc.fk_barbeiro;
        return esc.data?.startsWith(dataStr) && escIdB === idB;
      });
      return !jaExiste;
    });

    if (novosParaAdicionar.length === 0) return; 

    try {
      setLoading(true);
      const promessas = novosParaAdicionar.map(idB => {
        const conf = configBarbeiros[idB];
        const bInfo = barbeiros.find(b => b._id === idB);
        
        const payload = {
          data: dataStr,
          abertura: conf.abertura,
          fechamento: conf.fechamento,
          intervalo_inicio: conf.hasIntervalo ? conf.intervalo_inicio : null,
          intervalo_fim: conf.hasIntervalo ? conf.intervalo_fim : null,
          fk_barbeiro: idB,
          fk_barbearia: bInfo?.fk_barbearia?._id || bInfo?.fk_barbearia
        };

        return api.post('/agendas', payload);
      });

      await Promise.all(promessas);
      carregarDados(); 
    } catch (err) {
      setAlertConfig({ show: true, title: 'Erro', message: 'Falha ao salvar novas escalas.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const excluirAgenda = async (id) => {
    try {
      setLoading(true);
      await api.delete(`/agendas/${id}`);
      carregarDados();
    } catch (err) {
      setAlertConfig({ show: true, title: 'Erro', message: 'Falha ao excluir.', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getIniciais = (nome) => {
    if (!nome || typeof nome !== 'string') return "??";
    const limpo = nome.trim();
    return limpo.substring(0, 2).toUpperCase();
  };

  const getCorBarbeiro = (id) => {
    const cores = ['bg-blue-600', 'bg-emerald-600', 'bg-purple-600', 'bg-orange-600', 'bg-rose-600', 'bg-cyan-600'];
    const index = id ? id.toString().split('').reduce((a, b) => a + b.charCodeAt(0), 0) % cores.length : 0;
    return cores[index];
  };

  const getDiasCalendario = () => {
    const ano = currentMonth.getFullYear();
    const mes = currentMonth.getMonth();
    const dias = [];
    const primeiroDia = new Date(ano, mes, 1).getDay();
    const ultimoDia = new Date(ano, mes + 1, 0).getDate();
    for (let i = 0; i < primeiroDia; i++) dias.push(null);
    for (let i = 1; i <= ultimoDia; i++) dias.push(new Date(ano, mes, i));
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

        <header className="flex items-center gap-4 mb-10">
          <h1 className="text-2xl font-black italic lowercase tracking-tighter">
            escalas.<span className="text-[#e6b32a]">profissionais</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* PAINEL LATERAL */}
          <aside className="lg:col-span-4 space-y-4">
            <h2 className="text-[10px] font-black uppercase tracking-widest text-[#e6b32a] px-2 flex items-center gap-2">
               <IoPersonOutline size={14}/> 1. Configurar Turno
            </h2>
            <div className="space-y-4">
              {barbeiros.map(b => {
                const conf = configBarbeiros[b._id] || {};
                return (
                  <div key={b._id} className={`p-5 rounded-[2rem] border-2 transition-all ${conf.selecionado ? 'border-[#e6b32a] bg-[#e6b32a]/5 shadow-xl shadow-[#e6b32a]/5' : isDarkMode ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-100'}`}>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs text-white ${getCorBarbeiro(b._id)}`}>
                          {getIniciais(b.nome)}
                        </div>
                        <span className="font-black text-lg lowercase tracking-tighter truncate max-w-[120px]">{b.nome}</span>
                      </div>
                      <button onClick={() => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, selecionado: !conf.selecionado}}))} className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${conf.selecionado ? 'bg-[#e6b32a] text-black' : 'bg-white/5 text-gray-400 border border-white/10 hover:border-[#e6b32a]/40'}`}>
                        {conf.selecionado ? 'Ativo' : 'Selecionar'}
                      </button>
                    </div>

                    {conf.selecionado && (
                      <div className="space-y-5 pt-3 border-t border-white/5 animate-in slide-in-from-top-2 duration-300">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase font-black opacity-40">Entrada</label>
                            <input type="time" value={conf.abertura} onChange={e => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, abertura: e.target.value}}))} className={`w-full bg-transparent border-b py-1 text-sm font-bold focus:border-[#e6b32a] outline-none ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}/>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[8px] uppercase font-black opacity-40">Saída</label>
                            <input type="time" value={conf.fechamento} onChange={e => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, fechamento: e.target.value}}))} className={`w-full bg-transparent border-b py-1 text-sm font-bold focus:border-[#e6b32a] outline-none ${isDarkMode ? 'border-white/10' : 'border-black/10'}`}/>
                          </div>
                        </div>

                        {!conf.hasIntervalo ? (
                          <button 
                            onClick={() => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, hasIntervalo: true}}))}
                            className={`flex items-center justify-center gap-2 w-full py-2.5 rounded-2xl border border-dashed text-[9px] font-black uppercase tracking-widest transition-all ${isDarkMode ? 'border-white/10 hover:border-[#e6b32a]/50 text-white/40 hover:text-[#e6b32a]' : 'border-slate-200 hover:border-[#e6b32a] text-slate-400 hover:text-[#e6b32a]'}`}
                          >
                            <IoAddOutline size={16}/> Adicionar Intervalo
                          </button>
                        ) : (
                          <div className={`p-4 rounded-[1.5rem] border animate-in zoom-in-95 duration-200 ${isDarkMode ? 'bg-white/5 border-[#e6b32a]/20' : 'bg-slate-50 border-slate-200'}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-2 text-[#e6b32a]">
                                <IoFastFoodOutline size={14}/>
                                <span className="text-[9px] font-black uppercase tracking-tighter">Pausa Programada</span>
                              </div>
                              <button onClick={() => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, hasIntervalo: false}}))} className="text-red-500/60 hover:text-red-500"><IoTrashOutline size={14}/></button>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-center">
                              <input type="time" value={conf.intervalo_inicio} onChange={e => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, intervalo_inicio: e.target.value}}))} className="bg-transparent border-b border-white/10 py-1 text-xs font-bold focus:border-[#e6b32a] outline-none"/>
                              <input type="time" value={conf.intervalo_fim} onChange={e => setConfigBarbeiros(p => ({...p, [b._id]: {...conf, intervalo_fim: e.target.value}}))} className="bg-transparent border-b border-white/10 py-1 text-xs font-bold focus:border-[#e6b32a] outline-none"/>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </aside>

          {/* CALENDÁRIO */}
          <main className="lg:col-span-8">
            <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              <div className="flex justify-between items-center mb-8 px-4">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-2 hover:bg-[#e6b32a]/10 rounded-full transition-colors"><IoChevronBack size={20}/></button>
                <h2 className="font-black uppercase tracking-[3px] text-[10px]">{currentMonth.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</h2>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-2 hover:bg-[#e6b32a]/10 rounded-full transition-colors"><IoChevronForward size={20}/></button>
              </div>

              <div className="grid grid-cols-7 gap-2">
                {['dom','seg','ter','qua','qui','sex','sab'].map(d => <div key={d} className="text-center text-[9px] font-black uppercase opacity-20 mb-2">{d}</div>)}
                
                {getDiasCalendario().map((dia, i) => {
                  if (!dia) return <div key={`empty-${i}`} className="aspect-square" />;
                  const dStr = dia.toLocaleDateString('en-CA');
                  const escalasDoDia = agendas.filter(a => a.data?.startsWith(dStr));
                  const isPassado = dStr < hojeStr;

                  return (
                    <div 
                      key={i} 
                      onClick={() => !isPassado && selecionarDia(dStr)}
                      className={`min-h-[140px] p-2 rounded-2xl border transition-all flex flex-col group ${
                        isPassado ? 'opacity-20 cursor-not-allowed border-transparent' : 
                        `cursor-pointer ${isDarkMode ? 'bg-white/5 border-white/5 hover:border-[#e6b32a]' : 'bg-slate-50 border-slate-100 hover:border-[#e6b32a]'}`
                      }`}
                    >
                      <span className="text-[10px] font-black opacity-30 mb-2">{dia.getDate()}</span>
                      
                      <div className="flex flex-col gap-1.5 overflow-y-auto scrollbar-hide">
                        {escalasDoDia.map(esc => {
                          const idB = esc.fk_barbeiro?._id || esc.fk_barbeiro;
                          const barbeiroEncontrado = barbeiros.find(b => b._id === idB);
                          const nomeB = esc.fk_barbeiro?.nome || barbeiroEncontrado?.nome || '??';

                          return (
                            <div key={esc._id} className={`p-1.5 rounded-xl ${getCorBarbeiro(idB)} text-white flex items-center justify-between group/item shadow-sm animate-in zoom-in duration-300`}>
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="bg-white/20 w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black shrink-0 tracking-tighter">
                                  {getIniciais(nomeB)}
                                </div>
                                <div className="truncate">
                                  <p className="text-[8px] font-black leading-none">{esc.abertura}</p>
                                  <p className="text-[8px] font-black opacity-60 leading-none mt-0.5">{esc.fechamento}</p>
                                </div>
                              </div>
                              <button onClick={(e) => { e.stopPropagation(); excluirAgenda(esc._id); }} className="opacity-0 group-hover/item:opacity-100 bg-black/20 p-1 rounded-md transition-opacity"><IoTrashOutline size={10} /></button>
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