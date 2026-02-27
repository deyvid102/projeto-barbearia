import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { IoChevronBackOutline } from 'react-icons/io5';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

export default function BarbeiroEstatisticas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [todosAgendamentos, setTodosAgendamentos] = useState([]);
  const [agendamentosFiltrados, setAgendamentosFiltrados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('total'); 
  const [datasCustom, setDatasCustom] = useState({ inicio: '', fim: '' });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Puxamos apenas os finalizados para não inflar o lucro com agendamentos abertos/cancelados
        const res = await api.get(`/agendamentos?fk_barbeiro=${id}&status=F`);
        const dados = Array.isArray(res.data) ? res.data : (Array.isArray(res) ? res : []);
        
        setTodosAgendamentos(dados);
        setAgendamentosFiltrados(dados);
      } catch (err) {
        console.error("Erro ao carregar estatísticas:", err);
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

  // CORREÇÃO DO LUCRO: Garantindo que seja tratado como número
  const lucroExibido = agendamentosFiltrados.reduce((acc, a) => {
    const valor = parseFloat(a.valor) || 0;
    return acc + valor;
  }, 0);

  const ticketMedio = agendamentosFiltrados.length > 0 ? lucroExibido / agendamentosFiltrados.length : 0;

  // CORREÇÃO DO RANKING: Agrupando por string do serviço
  const gerarRanking = () => {
    const contagem = {};
    agendamentosFiltrados.forEach(ag => {
      const nomeServico = ag.tipoCorte || 'Outros';
      contagem[nomeServico] = (contagem[nomeServico] || 0) + 1;
    });

    return Object.entries(contagem)
      .map(([label, qtd]) => ({
        label,
        qtd,
        porcentagem: (qtd / agendamentosFiltrados.length) * 100
      }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 4); // Top 4
  };

  const rankingDinamico = gerarRanking();

  const dadosGrafico = Array.from({ length: 6 }).map((_, i) => {
    const dAlvo = new Date();
    dAlvo.setMonth(new Date().getMonth() - (5 - i));
    const mesNome = dAlvo.toLocaleString('pt-BR', { month: 'short' }).replace('.', '');
    const valor = todosAgendamentos.filter(a => {
      const d = new Date(a.datahora);
      return d.getMonth() === dAlvo.getMonth() && d.getFullYear() === dAlvo.getFullYear();
    }).reduce((acc, a) => acc + (parseFloat(a.valor) || 0), 0);
    return { mes: mesNome, valor };
  });

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-3 md:p-6 pb-24 font-sans transition-colors duration-300`}>
      <div className="max-w-[1200px] mx-auto space-y-6">
        
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-black/5 dark:border-white/5 pb-6">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate(-1)} className={`w-11 h-11 rounded-xl flex items-center justify-center border transition-all ${isDarkMode ? 'bg-white/5 border-white/10' : 'bg-white border-slate-200'}`}>
              <IoChevronBackOutline size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter">
                meus.<span className="text-[#e6b32a]">números</span>
              </h1>
              <p className="text-[8px] md:text-[9px] text-[#e6b32a] uppercase font-black tracking-[4px] mt-1">análise de lucros</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1.5 rounded-2xl border border-black/5 dark:border-white/10">
            {['diario', 'mensal', 'anual', 'total', 'personalizado'].map((f) => (
              <button
                key={f}
                onClick={() => setFiltro(f)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-wider transition-all ${filtro === f ? 'bg-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : 'text-slate-500 hover:text-[#e6b32a]'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </header>

        {filtro === 'personalizado' && (
          <div className="flex gap-3 animate-in fade-in slide-in-from-top-2 p-4 bg-black/5 dark:bg-white/5 rounded-3xl border border-black/5 dark:border-white/5">
            <input type="date" onChange={(e) => setDatasCustom({...datasCustom, inicio: e.target.value})} className={`flex-1 p-3 rounded-xl text-[10px] font-black border outline-none ${isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200'}`} />
            <input type="date" onChange={(e) => setDatasCustom({...datasCustom, fim: e.target.value})} className={`flex-1 p-3 rounded-xl text-[10px] font-black border outline-none ${isDarkMode ? 'bg-black border-white/10 text-white' : 'bg-white border-slate-200'}`} />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-slate-950 p-10 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <p className="text-[10px] text-slate-500 uppercase font-black tracking-[5px] mb-2">lucro bruto ({filtro})</p>
            <h2 className="text-5xl md:text-7xl font-black text-[#e6b32a] font-mono tracking-tighter">
              R$ {lucroExibido.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </h2>
          </div>

          <div className={`p-8 rounded-[2.5rem] border flex flex-col justify-center shadow-sm ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
            <p className="text-[9px] text-slate-400 uppercase font-black tracking-widest mb-1">ticket médio</p>
            <h3 className="text-3xl font-black font-mono">R$ {ticketMedio.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            <p className="text-[10px] font-black uppercase text-[#e6b32a] mt-2">{agendamentosFiltrados.length} serviços</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico */}
          <div className={`p-8 rounded-[2.5rem] border h-[350px] flex flex-col shadow-sm ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
            <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[4px] mb-8">evolução (6 meses)</h2>
            <div className="flex-1 w-full min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dadosGrafico}>
                  <defs>
                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e6b32a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#e6b32a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                  <XAxis dataKey="mes" axisLine={false} tickLine={false} fontSize={10} tick={{fill: '#888'}} dy={10} />
                  <Tooltip contentStyle={{ backgroundColor: isDarkMode ? '#111' : '#fff', borderRadius: '15px', border: '1px solid #e6b32a33' }} />
                  <Area type="monotone" dataKey="valor" stroke="#e6b32a" strokeWidth={4} fill="url(#colorValor)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ranking corrigido */}
          <div className={`p-8 rounded-[2.5rem] border flex flex-col shadow-sm ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
            <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[4px] mb-8">ranking de serviços</h2>
            <div className="space-y-6 flex-1">
              {rankingDinamico.length > 0 ? rankingDinamico.map((item, idx) => (
                <div key={idx} className="space-y-3">
                  <div className="flex justify-between items-end">
                    <span className="text-lg font-black lowercase italic">{item.label}</span>
                    <span className="text-[10px] font-black text-[#e6b32a] uppercase">{item.qtd} un.</span>
                  </div>
                  <div className="h-2 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                    <div className="h-full bg-slate-900 dark:bg-[#e6b32a] transition-all duration-1000" style={{ width: `${item.porcentagem}%` }} />
                  </div>
                </div>
              )) : (
                <p className="text-center text-slate-500 text-[10px] uppercase font-black py-20">sem dados para o período</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}