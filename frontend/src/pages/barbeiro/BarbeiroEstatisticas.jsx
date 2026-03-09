import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { 
  IoChevronBackOutline, IoTrendingUpOutline, 
  IoWalletOutline, IoPieChartOutline, IoCalendarOutline 
} from 'react-icons/io5';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function BarbeiroEstatisticas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [barbeiro, setBarbeiro] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('total'); 
  const [datasCustom, setDatasCustom] = useState({ inicio: '', fim: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Buscamos os dados do barbeiro para saber a comissão e os agendamentos (incluindo cancelados para métricas)
        const [resAg, resBa] = await Promise.all([
          api.get(`/agendamentos?fk_barbeiro=${id}`),
          api.get(`/barbeiros/${id}`)
        ]);
        
        setTodosAgendamentos(Array.isArray(resAg.data) ? resAg.data : resAg || []);
        setBarbeiro(resBa.data || resBa);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  // Cálculos Memoizados para Performance
  const metrics = useMemo(() => {
    const agora = new Date();
    const comissao = barbeiro?.porcentagem_comissao || 0;

    const filtrados = todosAgendamentos.filter(a => {
      const d = new Date(a.datahora);
      const dStr = a.datahora.split('T')[0];

      if (filtro === 'diario') return dStr === agora.toISOString().split('T')[0];
      if (filtro === 'mensal') return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
      if (filtro === 'anual') return d.getFullYear() === agora.getFullYear();
      if (filtro === 'personalizado' && datasCustom.inicio && datasCustom.fim) {
        return dStr >= datasCustom.inicio && dStr <= datasCustom.fim;
      }
      return true;
    });

    const finalizados = filtrados.filter(a => a.status === 'F');
    const cancelados = filtrados.filter(a => a.status === 'C');

    const faturamentoBruto = finalizados.reduce((acc, a) => acc + (parseFloat(a.valor) || 0), 0);
    const meuLucro = (faturamentoBruto * comissao) / 100;
    const ticketMedio = finalizados.length > 0 ? faturamentoBruto / finalizados.length : 0;

    // Ranking de Serviços
    const ranking = {};
    finalizados.forEach(ag => {
      const nome = ag.tipoCorte || 'Outros';
      ranking[nome] = (ranking[nome] || 0) + 1;
    });

    const rankingArray = Object.entries(ranking)
      .map(([label, qtd]) => ({
        label,
        qtd,
        porcentagem: (qtd / finalizados.length) * 100
      }))
      .sort((a, b) => b.qtd - a.qtd).slice(0, 4);

    return { filtrados, finalizados, cancelados, faturamentoBruto, meuLucro, ticketMedio, rankingArray, comissao };
  }, [todosAgendamentos, filtro, datasCustom, barbeiro]);

  // Dados para o Gráfico (Últimos 6 meses)
  const dadosGrafico = useMemo(() => {
    return Array.from({ length: 6 }).map((_, i) => {
      const dAlvo = new Date();
      dAlvo.setMonth(new Date().getMonth() - (5 - i));
      const mesNome = dAlvo.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
      
      const valor = todosAgendamentos
        .filter(a => {
          const d = new Date(a.datahora);
          return a.status === 'F' && d.getMonth() === dAlvo.getMonth() && d.getFullYear() === dAlvo.getFullYear();
        })
        .reduce((acc, a) => acc + (parseFloat(a.valor) || 0), 0);
      
      return { mes: mesNome, valor };
    });
  }, [todosAgendamentos]);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 pb-24 transition-colors duration-300`}>
      <div className="max-w-[1200px] mx-auto space-y-8">
        
        {/* Header Re-modelado */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-5">
            <button onClick={() => navigate(-1)} className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-95 ${isDarkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-slate-200 hover:shadow-md'}`}>
              <IoChevronBackOutline size={22} />
            </button>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <IoPieChartOutline className="text-[#e6b32a]" size={16} />
                <span className="text-[10px] font-black uppercase tracking-[3px] opacity-60">Analytics Dashboard</span>
              </div>
              <h1 className="text-4xl font-black italic lowercase tracking-tighter leading-none">
                meus.<span className="text-[#e6b32a]">números</span>
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1.5 rounded-[1.5rem] border border-black/5 dark:border-white/10">
            {['diario', 'mensal', 'anual', 'total', 'personalizado'].map((f) => (
              <button key={f} onClick={() => setFiltro(f)} className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${filtro === f ? 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : 'text-slate-500 hover:text-[#e6b32a]'}`}>
                {f}
              </button>
            ))}
          </div>
        </header>

        {filtro === 'personalizado' && (
          <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-4 p-4 bg-[#e6b32a]/5 rounded-3xl border border-[#e6b32a]/20">
            <div className="space-y-2">
                <label className="text-[9px] font-black uppercase ml-2 opacity-60">Data Inicial</label>
                <input type="date" onChange={(e) => setDatasCustom({...datasCustom, inicio: e.target.value})} className={`w-full p-4 rounded-2xl text-xs font-black border outline-none ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-slate-200'}`} />
            </div>
            <div className="space-y-2">
                <label className="text-[9px] font-black uppercase ml-2 opacity-60">Data Final</label>
                <input type="date" onChange={(e) => setDatasCustom({...datasCustom, fim: e.target.value})} className={`w-full p-4 rounded-2xl text-xs font-black border outline-none ${isDarkMode ? 'bg-black border-white/10' : 'bg-white border-slate-200'}`} />
            </div>
          </div>
        )}

        {/* Cards de Destaque */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-2 bg-slate-950 p-8 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden group">
            <IoWalletOutline className="absolute -right-4 -bottom-4 text-white/5 group-hover:text-[#e6b32a]/10 transition-colors" size={180} />
            <div className="relative z-10">
                <p className="text-[10px] text-slate-400 uppercase font-black tracking-[5px] mb-4">Seu Lucro ({metrics.comissao}%)</p>
                <h2 className="text-5xl md:text-6xl font-black text-[#e6b32a] font-mono tracking-tighter mb-2">
                    R$ {metrics.meuLucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </h2>
                <div className="flex items-center gap-2 text-slate-500">
                    <IoTrendingUpOutline size={16} className="text-emerald-500" />
                    <span className="text-xs font-bold italic">Bruto: R$ {metrics.faturamentoBruto.toLocaleString('pt-BR')}</span>
                </div>
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border flex flex-col justify-center shadow-sm ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Ticket Médio</p>
            <h3 className="text-3xl font-black font-mono">R$ {metrics.ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h3>
            <div className={`mt-4 px-3 py-1 rounded-full text-[9px] font-black uppercase w-fit ${isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-600'}`}>
                {metrics.finalizados.length} Atendimentos
            </div>
          </div>

          <div className={`p-8 rounded-[2.5rem] border flex flex-col justify-center shadow-sm ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">Conversão</p>
            <h3 className="text-3xl font-black font-mono text-emerald-500">{((metrics.finalizados.length / (metrics.filtrados.length || 1)) * 100).toFixed(0)}%</h3>
            <p className="text-[10px] font-black uppercase opacity-40 mt-2">{metrics.cancelados.length} cancelamentos</p>
          </div>
        </div>

        {/* Gráfico e Ranking */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className={`p-8 rounded-[3rem] border h-[400px] flex flex-col ${isDarkMode ? 'bg-[#0f0f0f] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[4px]">Desempenho Semestral</h2>
                <IoCalendarOutline className="opacity-20" size={20} />
            </div>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dadosGrafico}>
                  <defs>
                    <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e6b32a" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#e6b32a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#888'}} dy={10} />
                  <Tooltip 
                    cursor={{ stroke: '#e6b32a', strokeWidth: 2 }}
                    contentStyle={{ backgroundColor: isDarkMode ? '#111' : '#fff', borderRadius: '20px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} 
                  />
                  <Area type="monotone" dataKey="valor" stroke="#e6b32a" strokeWidth={5} fill="url(#colorVal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-8 rounded-[3rem] border flex flex-col ${isDarkMode ? 'bg-[#0f0f0f] border-white/5' : 'bg-white border-slate-100 shadow-xl'}`}>
            <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[4px] mb-10">Serviços mais procurados</h2>
            <div className="space-y-8 flex-1">
              {metrics.rankingArray.length > 0 ? metrics.rankingArray.map((item, idx) => (
                <div key={idx} className="group">
                  <div className="flex justify-between items-end mb-3">
                    <span className="text-xl font-black lowercase italic group-hover:text-[#e6b32a] transition-colors">{item.label}</span>
                    <span className="text-[10px] font-black opacity-40 uppercase">{item.qtd} cortes</span>
                  </div>
                  <div className="h-3 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden p-[2px]">
                    <div className="h-full bg-[#e6b32a] rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(230,179,42,0.3)]" style={{ width: `${item.porcentagem}%` }} />
                  </div>
                </div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full opacity-30 italic">
                    <p className="text-[10px] font-black uppercase tracking-widest">Aguardando dados...</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}