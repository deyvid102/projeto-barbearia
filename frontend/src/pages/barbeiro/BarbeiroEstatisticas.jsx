import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function BarbeiroEstatisticas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);
  const [servicosAdmin, setServicosAdmin] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('total'); 
  const [datasCustom, setDatasCustom] = useState({ inicio: '', fim: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resAgendamentos = await api.get(`/agendamentos?fk_barbeiro=${id}`);
        const finalizados = (resAgendamentos.data || resAgendamentos).filter(a => a.status === 'F');
        setTodosAgendamentos(finalizados);
        setAgendamentosFiltrados(finalizados);

        const resServicos = await api.get('/servicos').catch(() => ({ data: [] }));
        setServicosAdmin(resServicos.data || [
          {_id:'C', nome:'cabelo', sigla:'C'}, 
          {_id:'B', nome:'barba', sigla:'B'}, 
          {_id:'CB', nome:'cabelo+barba', sigla:'CB'}
        ]);
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  useEffect(() => {
    const agora = new Date();
    let filtrados = [...todosAgendamentos];

    if (filtro === 'diario') {
      const hoje = agora.toISOString().split('T')[0];
      filtrados = todosAgendamentos.filter(a => a.datahora.startsWith(hoje));
    } else if (filtro === 'mensal') {
      filtrados = todosAgendamentos.filter(a => {
        const d = new Date(a.datahora);
        return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
      });
    } else if (filtro === 'anual') {
      filtrados = todosAgendamentos.filter(a => new Date(a.datahora).getFullYear() === agora.getFullYear());
    } else if (filtro === 'personalizado' && datasCustom.inicio && datasCustom.fim) {
      filtrados = todosAgendamentos.filter(a => {
        const d = a.datahora.split('T')[0];
        return d >= datasCustom.inicio && d <= datasCustom.fim;
      });
    }
    setAgendamentosFiltrados(filtrados);
  }, [filtro, datasCustom, todosAgendamentos]);

  const lucroExibido = agendamentosFiltrados.reduce((acc, a) => acc + (a.valor || 0), 0);
  const ticketMedio = lucroExibido / (agendamentosFiltrados.length || 1);

  const rankingDinamico = servicosAdmin.map(servico => {
    const qtd = agendamentosFiltrados.filter(ag => ag.tipoCorte === servico.nome || ag.tipoCorte === servico._id || ag.tipoCorte === servico.sigla).length;
    return { label: servico.nome, qtd, porcentagem: agendamentosFiltrados.length > 0 ? (qtd / agendamentosFiltrados.length) * 100 : 0 };
  }).sort((a, b) => b.qtd - a.qtd);

  const dadosGrafico = Array.from({ length: 6 }).map((_, i) => {
    const dAlvo = new Date();
    dAlvo.setMonth(new Date().getMonth() - (5 - i));
    const mesNome = dAlvo.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    const valor = todosAgendamentos.filter(a => {
      const d = new Date(a.datahora);
      return d.getMonth() === dAlvo.getMonth() && d.getFullYear() === dAlvo.getFullYear();
    }).reduce((acc, a) => acc + (a.valor || 0), 0);
    return { mes: mesNome, valor };
  });

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-[#e6b32a] shadow-sm transition-all">←</button>
            <div>
              <h1 className="text-2xl font-black italic lowercase tracking-tighter leading-none">lucros.estatisticas</h1>
              <p className="text-[9px] text-[#e6b32a] uppercase font-black tracking-[3px] mt-1">desempenho filtrado</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-slate-100/50 dark:bg-white/5 p-1.5 rounded-2xl border border-slate-200 dark:border-white/10">
            {['diario', 'mensal', 'anual', 'total', 'personalizado'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${
                  filtro === f 
                  ? 'bg-[#e6b32a] text-black shadow-md' 
                  : 'text-slate-500 hover:text-[#e6b32a]'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {filtro === 'personalizado' && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-top-2">
            <input 
              type="date" 
              onChange={(e) => setDatasCustom({...datasCustom, inicio: e.target.value})}
              className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-mono outline-none focus:border-[#e6b32a] shadow-sm"
            />
            <input 
              type="date" 
              onChange={(e) => setDatasCustom({...datasCustom, fim: e.target.value})}
              className="bg-white dark:bg-[#111] border border-slate-200 dark:border-white/10 rounded-xl px-4 py-2 text-[10px] font-mono outline-none focus:border-[#e6b32a] shadow-sm"
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-slate-900 p-6 rounded-[2rem] border border-slate-800 shadow-xl">
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">
              lucro {filtro === 'total' ? 'acumulado' : filtro}
            </p>
            <h2 className="text-4xl md:text-5xl font-black text-[#e6b32a] font-mono tracking-tighter">
              r$ {lucroExibido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </h2>
          </div>
          <div className="bg-white dark:bg-[#111] p-5 rounded-[1.5rem] border border-slate-200 dark:border-white/5 flex flex-col justify-center shadow-sm">
            <p className="text-[9px] text-slate-400 uppercase font-black mb-1">ticket médio período</p>
            <h3 className="text-xl font-black font-mono">r$ {ticketMedio.toFixed(2)}</h3>
            <p className="text-[8px] text-slate-500 uppercase mt-1">{agendamentosFiltrados.length} atendimentos</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 h-[300px] flex flex-col shadow-sm">
            <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[4px] mb-6">histórico semestral (bruto)</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dadosGrafico}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e6b32a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#e6b32a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.1} />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} fontSize={9} tick={{fill: '#888'}} dy={5} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#1a1a1a' : '#fff', borderRadius: '12px', border: 'none', fontSize: '11px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="valor" stroke="#e6b32a" strokeWidth={3} fill="url(#colorValor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-slate-200 dark:border-white/5 flex flex-col shadow-sm">
            <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[4px] mb-6">ranking do período</h2>
            <div className="space-y-4 flex-1">
              {rankingDinamico.slice(0, 3).map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-base font-black lowercase">{item.label}</span>
                    <span className="text-[9px] font-bold text-slate-400 uppercase">{item.qtd} un.</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 dark:bg-[#e6b32a] transition-all" style={{ width: `${item.porcentagem}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}