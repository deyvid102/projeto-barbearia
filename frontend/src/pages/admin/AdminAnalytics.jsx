import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js'; 
import { useTheme } from '../../components/ThemeContext';
import AdminLayout from '../../layout/layout';
import SelectPersonalizado from '../../components/SelectPersonalizado';
import SidebarFiltros from '../../components/SideBarFiltros.jsx';
import Pagination from '../../components/Pagination';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, BarChart, Bar, Cell, PieChart, Pie 
} from 'recharts';
import { 
  IoFilter, IoPrintOutline, IoWalletOutline, IoPeopleOutline, IoStatsChartOutline, IoPieChartOutline, IoBarChartOutline
} from 'react-icons/io5';

// Componente de Tooltip Personalizado para os Gráficos
const CustomTooltip = ({ active, payload, label, prefix = "R$ " }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-white/10 p-3 rounded-2xl shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-1">{label || payload[0].payload.name}</p>
        <p className="text-sm font-black text-[#e6b32a]">
          {prefix}{payload[0].value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
      </div>
    );
  }
  return null;
};

export default function AdminAnalytics() {
  const { id } = useParams(); 
  const { isDarkMode } = useTheme();
  
  const [agendamentos, setAgendamentos] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [nomeBarbearia, setNomeBarbearia] = useState('Barbearia');

  const COLORS = ['#e6b32a', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];

  // Filtros
  const [periodo, setPeriodo] = useState('MENSAL');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroBarbeiro, setFiltroBarbeiro] = useState('TODOS');

  // Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [resB, resA] = await Promise.all([
        api.get('/barbeiros'),
        api.get('/agendamentos')
      ]);

      const listaAgendamentos = resA.data || resA || [];
      const listaBarbeiros = resB.data || resB || [];

      setBarbeiros(listaBarbeiros);
      setAgendamentos(listaAgendamentos);

      const agendamentoComEmpresa = listaAgendamentos.find(a => a.fk_barbearia);
      if (agendamentoComEmpresa) {
        const empresa = agendamentoComEmpresa.fk_barbearia;
        setNomeBarbearia(empresa.nome_fantasia || empresa.nome || 'Barbearia');
      } else {
        const storageUser = localStorage.getItem('user');
        if (storageUser) {
          const userData = JSON.parse(storageUser);
          setNomeBarbearia(userData.fk_barbearia?.nome_fantasia || userData.fk_barbearia?.nome || 'Barbearia');
        }
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dadosFiltradosTotal = useMemo(() => {
    const hoje = new Date();
    let filtrados = agendamentos.filter(a => a.status === 'F');

    if (filtroBarbeiro !== 'TODOS') {
      filtrados = filtrados.filter(a => (a.fk_barbeiro?._id || a.fk_barbeiro) === filtroBarbeiro);
    }

    filtrados = filtrados.filter(a => {
      const dataAga = new Date(a.datahora);
      if (periodo === 'DIARIO') return dataAga.toDateString() === hoje.toDateString();
      if (periodo === 'SEMANAL') {
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(hoje.getDate() - 7);
        return dataAga >= umaSemanaAtras;
      }
      if (periodo === 'MENSAL') return dataAga.getMonth() === hoje.getMonth() && dataAga.getFullYear() === hoje.getFullYear();
      if (periodo === 'ANUAL') return dataAga.getFullYear() === hoje.getFullYear();
      if (periodo === 'INTERVALO') {
        const inicio = dataInicio ? new Date(dataInicio + 'T00:00:00') : null;
        const fim = dataFim ? new Date(dataFim + 'T23:59:59') : null;
        return (!inicio || dataAga >= inicio) && (!fim || dataAga <= fim);
      }
      return true;
    });

    return filtrados.sort((a, b) => new Date(b.datahora) - new Date(a.datahora));
  }, [agendamentos, periodo, dataInicio, dataFim, filtroBarbeiro]);

  const stats = useMemo(() => {
    const total = dadosFiltradosTotal.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    const timeline = {};
    dadosFiltradosTotal.forEach(a => {
      const label = new Date(a.datahora).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      timeline[label] = (timeline[label] || 0) + (a.valor || 0);
    });

    const porBarbeiro = barbeiros.map((b, idx) => {
      const atendimentos = dadosFiltradosTotal.filter(a => (a.fk_barbeiro?._id || a.fk_barbeiro) === b._id);
      return {
        name: b.nome.split(' ')[0],
        fullName: b.nome,
        lucro: atendimentos.reduce((acc, curr) => acc + (curr.valor || 0), 0),
        qtd: atendimentos.length,
        color: COLORS[idx % COLORS.length]
      };
    }).filter(item => item.lucro > 0 || item.qtd > 0);

    return {
      faturamento: total,
      servicos: dadosFiltradosTotal.length,
      ticketMedio: dadosFiltradosTotal.length > 0 ? total / dadosFiltradosTotal.length : 0,
      chartData: Object.keys(timeline).map(day => ({ day, valor: timeline[day] })).reverse(),
      porBarbeiro
    };
  }, [dadosFiltradosTotal, barbeiros]);

  const labelPeriodoPDF = useMemo(() => {
    if (periodo === 'INTERVALO') {
      const format = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '...';
      return `Período: ${format(dataInicio)} até ${format(dataFim)}`;
    }
    const labels = { 'DIARIO': 'Hoje', 'SEMANAL': 'Últimos 7 dias', 'MENSAL': 'Este Mês', 'ANUAL': 'Este Ano', 'TODOS': 'Todo o Histórico' };
    return `Período: ${labels[periodo] || periodo}`;
  }, [periodo, dataInicio, dataFim]);

  const dadosPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return dadosFiltradosTotal.slice(startIndex, startIndex + itemsPerPage);
  }, [dadosFiltradosTotal, currentPage]);

  const totalPages = Math.ceil(dadosFiltradosTotal.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [periodo, filtroBarbeiro, dataInicio, dataFim]);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 flex flex-col h-full print:block print:bg-white print:p-0">
        
        <header className="mb-8 flex justify-between items-end print:hidden">
          <div>
            <h1 className="text-2xl font-black italic lowercase tracking-tighter">
              admin.<span className="text-[#e6b32a]">analytics</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[2px]">Painel de Performance</p>
          </div>
          <div className="flex gap-3">
             <button 
              onClick={() => setIsFilterOpen(true)}
              className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl active:scale-95 transition-transform"
            >
              <IoFilter size={20} />
            </button>
            <button 
              onClick={() => window.print()} 
              className="flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#e6b32a] text-black hover:scale-105 transition-all shadow-lg shadow-[#e6b32a]/20"
            >
              <IoPrintOutline size={14}/> Gerar PDF
            </button>
          </div>
        </header>

        {/* --- CABEÇALHO PDF --- */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4 text-black">
          <h1 className="text-2xl font-black uppercase tracking-tighter">Relatório Financeiro Detalhado</h1>
          <div className="mt-4 grid grid-cols-2 gap-4 text-[10pt] font-bold uppercase">
            <p>Barbearia: <span className="font-normal">{nomeBarbearia}</span></p>
            <p className="text-right">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            <p className="text-black">{labelPeriodoPDF}</p>
            <p className="text-right">Faturamento Total: R$ {stats.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            <p>Profissional: <span className="font-normal">{filtroBarbeiro === 'TODOS' ? 'Todos' : barbeiros.find(b => b._id === filtroBarbeiro)?.nome}</span></p>
            <p className="text-right">Total de Serviços: {stats.servicos}</p>
          </div>
        </div>

        {/* --- DASHBOARD VISUAL (Somente Tela) --- */}
        <div className="space-y-6 mb-8 print:hidden">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="space-y-4 lg:col-span-1">
              <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-1 text-gray-500"><IoWalletOutline size={14}/> <span className="text-[9px] font-black uppercase tracking-widest">Receita</span></div>
                <p className="text-2xl font-black text-[#e6b32a]">R$ {stats.faturamento.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
              <div className={`p-6 rounded-[2rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
                <div className="flex items-center gap-3 mb-1 text-gray-500"><IoPeopleOutline size={14}/> <span className="text-[9px] font-black uppercase tracking-widest">Serviços</span></div>
                <p className="text-2xl font-black">{stats.servicos}</p>
              </div>
            </div>
            
            <div className="lg:col-span-3 p-6 rounded-[2.5rem] border bg-white dark:bg-[#111] dark:border-white/5 border-slate-100 shadow-sm">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                <IoStatsChartOutline className="text-[#e6b32a]" /> evolução financeira
              </h3>
              <div className="h-44 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.chartData}>
                    <defs>
                      <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e6b32a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#e6b32a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                    <XAxis dataKey="day" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Area type="monotone" dataKey="valor" stroke="#e6b32a" strokeWidth={3} fill="url(#colorGold)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                <IoBarChartOutline className="text-[#e6b32a]" /> lucro por profissional
              </h3>
              <div className="h-60 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.porBarbeiro}>
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} />
                    <Tooltip cursor={{fill: 'transparent'}} content={<CustomTooltip />} />
                    <Bar dataKey="lucro" radius={[10, 10, 10, 10]} barSize={30}>
                      {stats.porBarbeiro.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className={`p-6 rounded-[2.5rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
                <IoPieChartOutline className="text-[#e6b32a]" /> distribuição de serviços
              </h3>
              <div className="h-60 w-full relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={stats.porBarbeiro} dataKey="qtd" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} stroke="none">
                      {stats.porBarbeiro.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                    </Pie>
                    <Tooltip content={<CustomTooltip prefix="Qtd: " />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* --- TABELA DE DADOS --- */}
        <div id="pdf-table-area" className={`flex-1 rounded-[2.5rem] border overflow-hidden print:border-none print:m-0 print:bg-white ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-2xl'}`}>
          <div className="overflow-x-auto print:overflow-visible min-h-[400px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} print:bg-white print:border-b-2 print:border-black`}>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-500 text-left print:text-black">Data / Hora</th>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-500 text-left print:text-black">Cliente</th>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-500 text-left print:text-black">Profissional</th>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-500 text-right print:text-black">Valor Bruto</th>
                </tr>
              </thead>
              <tbody>
                {(typeof window !== 'undefined' && window.matchMedia('print').matches ? dadosFiltradosTotal : dadosPaginados).map((item) => (
                  <tr key={item._id} className="border-b border-white/5 print:border-slate-300 print:bg-white">
                    <td className="p-5 text-[11px] font-bold text-gray-400 print:text-black">
                      {new Date(item.datahora).toLocaleDateString('pt-BR')} {new Date(item.datahora).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'})}
                    </td>
                    <td className="p-5 text-xs font-black uppercase print:text-black">
                      {item.fk_cliente?.nome || 'Cliente'}
                    </td>
                    <td className="p-5 text-xs font-bold text-gray-400 print:text-black">
                      {barbeiros.find(b => b._id === (item.fk_barbeiro?._id || item.fk_barbeiro))?.nome || '---'}
                    </td>
                    <td className="p-5 text-sm font-black text-[#e6b32a] text-right print:text-black">
                      R$ {item.valor?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {totalPages > 1 && (
            <div className="p-6 border-t border-white/5 print:hidden">
              <Pagination 
                currentPage={currentPage} 
                totalPages={totalPages} 
                onPageChange={setCurrentPage} 
              />
            </div>
          )}
        </div>

        <SidebarFiltros 
          isOpen={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)} 
          title="filtros.analytics"
          onApply={() => setIsFilterOpen(false)}
        >
          <div className="space-y-6">
            <SelectPersonalizado 
              label="Profissional" 
              value={filtroBarbeiro} 
              onChange={(e) => setFiltroBarbeiro(e.target?.value || e)}
              options={[{ label: 'Todos', value: 'TODOS' }, ...barbeiros.map(b => ({ label: b.nome, value: b._id }))]}
            />
            
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Período Rápido</label>
              <div className="grid grid-cols-2 gap-2">
                {['DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL', 'TODOS'].map(p => (
                  <button 
                    key={p} 
                    onClick={() => {setPeriodo(p); setDataInicio(''); setDataFim('');}} 
                    className={`py-3 rounded-xl text-[8px] font-black uppercase border transition-all ${periodo === p ? 'bg-[#e6b32a] border-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : 'bg-transparent border-black/10 dark:border-white/10 text-gray-500'}`}
                  >
                    {p}
                  </button>
                ))}
                <button 
                  onClick={() => setPeriodo('INTERVALO')}
                  className={`py-3 rounded-xl text-[8px] font-black uppercase border transition-all ${periodo === 'INTERVALO' ? 'bg-[#e6b32a] border-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : 'bg-transparent border-black/10 dark:border-white/10 text-gray-500'}`}
                >
                  Personalizado
                </button>
              </div>
            </div>

            {periodo === 'INTERVALO' && (
              <div className="space-y-3 pt-2">
                <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Intervalo de Datas</label>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-[10px] font-black outline-none focus:border-[#e6b32a]" />
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-[10px] font-black outline-none focus:border-[#e6b32a]" />
              </div>
            )}
          </div>
        </SidebarFiltros>
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          html, body, .AdminLayout_main, #pdf-table-area, table, tr, td, th { 
            background-color: white !important; 
            color: black !important; 
          }
          nav, aside, .print\\:hidden, .Pagination_container { display: none !important; }
          #pdf-table-area { position: relative; width: 100% !important; border: none !important; }
          table { width: 100% !important; border-collapse: collapse !important; margin-top: 10px; }
          th { border-bottom: 2pt solid black !important; padding: 10px 5px !important; color: black !important; }
          td { border-bottom: 1pt solid #ccc !important; font-size: 9pt !important; padding: 8px 5px !important; color: black !important; }
          .AdminLayout_main { padding: 0 !important; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; color-adjust: exact !important; print-color-adjust: exact !important; }
          .text-gray-400, .text-[#e6b32a] { color: black !important; }
        }
      `}</style>
    </AdminLayout>
  );
}