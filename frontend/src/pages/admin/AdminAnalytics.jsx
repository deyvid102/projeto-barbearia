import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { 
  IoArrowBack, IoFilter, IoStatsChart, IoAnalytics 
} from 'react-icons/io5';

import SelectPersonalizado from '../../components/SelectPersonalizado';
import SidebarFiltros from '../../components/SideBarFiltros.jsx';

export default function AdminAnalytics() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const COLORS = ['#e6b32a', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];

  const [selectedBarbeiro, setSelectedBarbeiro] = useState('todos');
  const [periodoPredefinido, setPeriodoPredefinido] = useState('mensal');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [resB, resA] = await Promise.all([api.get('/barbeiros'), api.get('/agendamentos')]);
      const bData = resB.data || resB || [];
      const aData = resA.data || resA || [];
      setBarbeiros(bData);
      setAgendamentos(aData);
    } catch (error) {
      console.error("erro:", error);
    } finally {
      setLoading(false);
    }
  };

  const dadosProcessados = useMemo(() => {
    let filtrados = agendamentos.filter(a => a.status === 'F');

    if (selectedBarbeiro !== 'todos') {
      filtrados = filtrados.filter(a => (a.fk_barbeiro?._id || a.fk_barbeiro) === selectedBarbeiro);
    }

    const agora = new Date();
    if (dataInicio && dataFim) {
      const inicio = new Date(dataInicio);
      const fim = new Date(dataFim);
      fim.setHours(23, 59, 59);
      filtrados = filtrados.filter(a => {
        const d = new Date(a.datahora);
        return d >= inicio && d <= fim;
      });
    } else {
      const diffDias = (d, dias) => (agora - new Date(d)) / (1000 * 60 * 60 * 24) <= dias;
      if (periodoPredefinido === 'diario') filtrados = filtrados.filter(a => a.datahora.startsWith(agora.toISOString().split('T')[0]));
      if (periodoPredefinido === 'semanal') filtrados = filtrados.filter(a => diffDias(a.datahora, 7));
      if (periodoPredefinido === 'mensal') filtrados = filtrados.filter(a => diffDias(a.datahora, 30));
      if (periodoPredefinido === 'anual') filtrados = filtrados.filter(a => diffDias(a.datahora, 365));
    }

    const timeline = {};
    filtrados.forEach(a => {
      const label = new Date(a.datahora).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      timeline[label] = (timeline[label] || 0) + (a.valor || 0);
    });

    const porBarbeiro = barbeiros.map((b, idx) => {
      const atendimentos = filtrados.filter(a => (a.fk_barbeiro?._id || a.fk_barbeiro) === b._id);
      return {
        name: b.nome.split(' ')[0],
        fullName: b.nome,
        lucro: atendimentos.reduce((acc, curr) => acc + (curr.valor || 0), 0),
        qtd: atendimentos.length,
        color: COLORS[idx % COLORS.length]
      };
    }).filter(item => item.lucro > 0 || item.qtd > 0);

    return {
      timeline: Object.keys(timeline).map(day => ({ day, valor: timeline[day] })),
      porBarbeiro,
      total: filtrados.reduce((acc, curr) => acc + (curr.valor || 0), 0),
      totalAtendimentos: filtrados.length
    };
  }, [agendamentos, barbeiros, selectedBarbeiro, periodoPredefinido, dataInicio, dataFim]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-4 rounded-2xl border shadow-2xl relative z-[9999] ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-200'}`}>
          <p className="text-[10px] font-black uppercase text-gray-500 mb-1">
            {data.day || data.fullName}
          </p>
          <p className={`text-xl font-black font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            R$ {payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {data.qtd && <p className="text-[9px] text-[#e6b32a] uppercase font-bold mt-1">{data.qtd} serviços</p>}
        </div>
      );
    }
    return null;
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 pb-24 font-sans transition-colors duration-300`}>
      
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12 border-b border-black/5 dark:border-white/5 pb-8">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(-1)} 
            className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#e6b32a]' : 'bg-white border-slate-200 hover:border-black'}`}
          >
            <IoArrowBack size={20} />
          </button>
          <div>
            <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter">
              admin.<span className="text-[#e6b32a]">analytics</span>
            </h1>
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-[4px] mt-1">inteligência de dados</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="hidden md:block text-right">
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">receita filtrada</p>
            <p className="text-3xl font-black text-[#e6b32a] font-mono tracking-tighter">
              R$ {dadosProcessados.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
          <button 
            onClick={() => setIsFilterOpen(true)}
            className="w-12 h-12 flex items-center justify-center bg-[#e6b32a] text-black rounded-2xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#e6b32a]/20"
          >
            <IoFilter size={22} />
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto space-y-8">
        {/* Gráfico de Evolução (Card Principal) */}
        <div className={`p-6 md:p-8 rounded-[2.5rem] border ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-[#e6b32a]" /> evolução financeira no período
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dadosProcessados.timeline}>
                <defs>
                  <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e6b32a" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#e6b32a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.03} />
                <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                <YAxis fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
                <Area type="monotone" dataKey="valor" stroke="#e6b32a" strokeWidth={4} fill="url(#colorGold)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Receita por Profissional */}
          <div className={`p-6 md:p-8 rounded-[2.5rem] border h-[400px] flex flex-col ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-[#e6b32a]" /> receita por profissional
            </h3>
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dadosProcessados.porBarbeiro}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.03} />
                  <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                  <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} cursor={{fill: 'rgba(150,150,150,0.1)'}} />
                  <Bar dataKey="lucro" radius={[10, 10, 10, 10]} barSize={35}>
                    {dadosProcessados.porBarbeiro.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Market Share */}
          <div className={`p-6 md:p-8 rounded-[2.5rem] border h-[400px] flex flex-col relative ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-2">
               <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> market share (serviços)
            </h3>
            <div className="flex-1 min-h-0 relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={dadosProcessados.porBarbeiro}
                    dataKey="qtd"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={8}
                    stroke="none"
                  >
                    {dadosProcessados.porBarbeiro.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} wrapperStyle={{ zIndex: 1000 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{dadosProcessados.totalAtendimentos}</p>
                <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">total serviços</p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* SIDEBAR DE FILTROS */}
      <SidebarFiltros 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="filtros.analytics"
        onApply={() => setIsFilterOpen(false)}
      >
        <section className="space-y-4">
          <SelectPersonalizado 
            label="profissional"
            value={selectedBarbeiro}
            onChange={(val) => setSelectedBarbeiro(val)}
            options={[
              { value: 'todos', label: 'Todos os Profissionais' },
              ...barbeiros.map(b => ({ value: b._id, label: b.nome }))
            ]}
          />
        </section>

        <section>
          <label className="text-[8px] font-black uppercase text-gray-500 block mb-3 tracking-[3px] ml-1">período rápido</label>
          <div className="grid grid-cols-2 gap-2">
            {['diario', 'semanal', 'mensal', 'anual'].map(p => (
              <button 
                key={p} 
                onClick={() => {setPeriodoPredefinido(p); setDataInicio(''); setDataFim('');}} 
                className={`py-3 rounded-xl text-[8px] font-black uppercase border transition-all ${periodoPredefinido === p && !dataInicio ? 'bg-[#e6b32a] border-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : 'bg-transparent border-black/10 dark:border-white/10 text-gray-500'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="text-[8px] font-black uppercase text-gray-500 block mb-3 tracking-[3px] ml-1">intervalo de datas</label>
          <div className="space-y-3">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black uppercase pointer-events-none">de:</span>
              <input 
                type="date" 
                value={dataInicio} 
                onChange={(e) => setDataInicio(e.target.value)} 
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black text-gray-900 dark:text-white focus:border-[#e6b32a] outline-none transition-all" 
              />
            </div>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[10px] font-black uppercase pointer-events-none">até:</span>
              <input 
                type="date" 
                value={dataFim} 
                onChange={(e) => setDataFim(e.target.value)} 
                className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-[10px] font-black text-gray-900 dark:text-white focus:border-[#e6b32a] outline-none transition-all" 
              />
            </div>
          </div>
        </section>
      </SidebarFiltros>

    </div>
  );
}