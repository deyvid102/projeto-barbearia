import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { IoArrowBack, IoTrendingUp, IoPeople, IoCalendar, IoPricetag, IoStatsChart } from 'react-icons/io5';

export default function AdministradorDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Paleta Premium Multicor
  const COLORS = ['#e6b32a', '#8b5cf6', '#06b6d4', '#10b981', '#f43f5e'];

  useEffect(() => {
    fetchGlobalData();
  }, []);

  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      const [resBarbeiros, resAgendamentos] = await Promise.all([
        api.get('/barbeiros'),
        api.get('/agendamentos')
      ]);
      
      const bData = resBarbeiros.data || resBarbeiros || [];
      const aData = resAgendamentos.data || resAgendamentos || [];
      
      setBarbeiros(bData);
      setAgendamentos(aData);
    } catch (error) {
      console.error("erro ao buscar dados administrativos:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsPorBarbeiro = barbeiros.map((b, index) => {
    const atendimentos = agendamentos.filter(a => 
      (a.fk_barbeiro?._id || a.fk_barbeiro) === b._id && a.status === 'F'
    );
    const lucro = atendimentos.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    return { 
      name: b.nome.split(' ')[0], 
      fullName: b.nome,
      lucro, 
      qtd: atendimentos.length,
      color: COLORS[index % COLORS.length]
    };
  });

  const lucroTotal = statsPorBarbeiro.reduce((acc, curr) => acc + curr.lucro, 0);
  const qtdAtendimentosTotal = agendamentos.filter(a => a.status === 'F').length;
  const qtdHorariosAgendados = agendamentos.filter(a => a.status !== 'F' && a.status !== 'C').length;
  const ticketMedio = lucroTotal / (qtdAtendimentosTotal || 1);

  // Tooltip Customizado com Z-Index corrigido
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white dark:bg-[#0d0d0d] p-4 rounded-2xl border border-black/10 dark:border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.4)] backdrop-blur-xl z-[9999] pointer-events-none min-w-[150px]">
          <p className="text-[10px] font-black uppercase tracking-widest text-[#e6b32a] mb-1">{data.fullName}</p>
          <div className="space-y-0.5">
            <p className="text-xl font-black font-mono dark:text-white text-black">R$ {data.lucro.toLocaleString()}</p>
            <p className="text-[9px] text-gray-500 uppercase font-bold">{data.qtd} atendimentos</p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#e6b32a] text-[10px] font-black uppercase tracking-[5px]">sincronizando central...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-4 md:p-8 font-sans pb-24 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
        
        <header className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-black/5 dark:border-white/5 pb-8 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/barbeiro/${id}`)}
              className="w-12 h-12 rounded-2xl bg-white dark:bg-white/5 flex items-center justify-center border border-black/5 dark:border-white/10 text-gray-400 hover:text-[#e6b32a] transition-all shadow-sm"
            >
              <IoArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter">
                admin.<span className="text-[#e6b32a]">panel</span>
              </h1>
              <p className="text-[9px] text-gray-400 uppercase font-black tracking-[4px] mt-1">central de inteligência</p>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-[9px] text-gray-400 uppercase font-black tracking-widest">faturamento global</p>
            <p className="text-3xl font-black text-[#e6b32a] font-mono">
              R$ {lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </header>

        {/* Cards de métricas com ROTAS e HOVERS restaurados */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <button 
            onClick={() => navigate(`/admin/barbeiros/${id}`)}
            className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-black/5 dark:border-white/5 text-left hover:scale-[1.02] transition-all group shadow-sm hover:shadow-xl"
          >
            <div className="flex justify-between items-center mb-4 text-gray-400 group-hover:text-[#e6b32a]">
              <IoPeople size={20} />
              <span className="text-[8px] font-black bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">time</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">{barbeiros.length}</h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">profissionais</p>
          </button>

          <button 
            onClick={() => navigate(`/admin/logs/${id}`)}
            className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-black/5 dark:border-white/5 text-left hover:scale-[1.02] transition-all group shadow-sm hover:shadow-xl"
          >
            <div className="flex justify-between items-center mb-4 text-gray-400 group-hover:text-[#10b981]">
              <IoTrendingUp size={20} />
              <span className="text-[8px] font-black bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">logs</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">{qtdAtendimentosTotal}</h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">finalizados</p>
          </button>

          <button 
            onClick={() => navigate(`/admin/horarios/${id}`)}
            className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-black/5 dark:border-white/5 text-left hover:scale-[1.02] transition-all group shadow-sm hover:shadow-xl"
          >
            <div className="flex justify-between items-center mb-4 text-gray-400 group-hover:text-[#8b5cf6]">
              <IoCalendar size={20} />
              <span className="text-[8px] font-black bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">agenda</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">{qtdHorariosAgendados}</h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">pendentes</p>
          </button>

          <button 
            onClick={() => navigate(`/admin/valores/${id}`)}
            className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-black/5 dark:border-white/5 text-left hover:scale-[1.02] transition-all group shadow-sm hover:shadow-xl"
          >
            <div className="flex justify-between items-center mb-4 text-gray-400 group-hover:text-[#06b6d4]">
              <IoPricetag size={20} />
              <span className="text-[8px] font-black bg-black/5 dark:bg-white/5 px-2 py-1 rounded-lg uppercase tracking-widest">serviços</span>
            </div>
            <h2 className="text-4xl font-black tracking-tighter">R${ticketMedio.toFixed(0)}</h2>
            <p className="text-[9px] text-gray-500 font-bold uppercase mt-1">ticket por corte</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Gráfico 1: Receita */}
          <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-xl relative overflow-visible">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <IoStatsChart className="text-[#e6b32a]" /> receita por barbeiro
              </h3>
            </div>
            <div className="h-72 overflow-visible">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsPorBarbeiro} margin={{ top: 20, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#888', fontWeight: 'bold'}} />
                  <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <Tooltip 
                    cursor={{fill: 'rgba(255,255,255,0.05)'}} 
                    content={<CustomTooltip />} 
                    wrapperStyle={{ zIndex: 1000 }} 
                    allowEscapeViewBox={{ x: true, y: true }}
                  />
                  <Bar dataKey="lucro" radius={[12, 12, 12, 12]} barSize={40}>
                    {statsPorBarbeiro.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.8} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Gráfico 2: Pizza */}
          <div className="bg-white dark:bg-[#111] p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-xl relative overflow-visible">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-gray-400 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" /> volume de atendimentos
            </h3>
            <div className="h-72 relative overflow-visible">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsPorBarbeiro}
                    dataKey="qtd"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={8}
                    stroke="none"
                  >
                    {statsPorBarbeiro.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color} 
                        style={{ outline: 'none', filter: `drop-shadow(0px 4px 10px ${entry.color}44)` }}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} allowEscapeViewBox={{ x: true, y: true }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">total</p>
                <p className="text-3xl font-black tracking-tighter">{qtdAtendimentosTotal}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Ranking de Performance */}
        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[4px] text-[#e6b32a] px-2">ranking de performance</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {statsPorBarbeiro.sort((a, b) => b.lucro - a.lucro).map((b, idx) => (
              <div key={idx} className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-black/5 dark:border-white/5 flex items-center justify-between group transition-all hover:bg-white dark:hover:bg-[#161616]">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl font-black italic shadow-inner"
                    style={{ backgroundColor: `${b.color}15`, color: b.color }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <h4 className="font-black text-lg lowercase leading-none">{b.name}</h4>
                    <p className="text-[9px] text-gray-400 uppercase font-black mt-1.5 tracking-wider">{b.qtd} serviços</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xl font-black font-mono tracking-tighter">R$ {b.lucro.toLocaleString()}</p>
                  <div className="w-16 h-1 bg-gray-100 dark:bg-white/5 rounded-full mt-2 overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ backgroundColor: b.color, width: `${(b.lucro / (lucroTotal || 1) * 100)}%` }} 
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}