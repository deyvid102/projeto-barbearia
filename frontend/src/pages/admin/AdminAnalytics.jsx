import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js'; 
import { useTheme } from '../../components/ThemeContext';
// import AdminLayout from '../../layout/AdminLayout';
import SelectPersonalizado from '../../components/SelectPersonalizado';
import SidebarFiltros from '../../components/SideBarFiltros.jsx';
import Pagination from '../../components/Pagination';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie 
} from 'recharts';
import { 
  IoFilter, IoPrintOutline, IoWalletOutline, IoPeopleOutline, IoStatsChartOutline, IoPieChartOutline, IoBusinessOutline
} from 'react-icons/io5';

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
  
  const [financeiro, setFinanceiro] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [nomeBarbearia, setNomeBarbearia] = useState('Barbearia');

  const COLORS = ['#e6b32a', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];

  const [periodo, setPeriodo] = useState('MENSAL');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroBarbeiro, setFiltroBarbeiro] = useState('TODOS');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [resB, resF] = await Promise.all([
        api.get('/barbeiros'), 
        api.get(`/financeiro/${id}`) 
      ]);

      const listaFinanceiro = resF.data || resF || [];
      const listaBarbeiros = resB.data || resB || [];

      setBarbeiros(listaBarbeiros);
      setFinanceiro(listaFinanceiro);

      const reg = listaFinanceiro.find(f => f.fk_barbearia);
      if (reg) {
        setNomeBarbearia(reg.fk_barbearia.nome_fantasia || reg.fk_barbearia.nome || 'Barbearia');
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const dadosFiltradosTotal = useMemo(() => {
    const hoje = new Date();
    let filtrados = [...financeiro];

    if (filtroBarbeiro !== 'TODOS') {
      filtrados = filtrados.filter(f => (f.fk_barbeiro?._id || f.fk_barbeiro) === filtroBarbeiro);
    }

    filtrados = filtrados.filter(f => {
      const dataRef = new Date(f.createdAt);
      
      if (periodo === 'DIARIO') return dataRef.toDateString() === hoje.toDateString();
      if (periodo === 'SEMANAL') {
        const umaSemanaAtras = new Date();
        umaSemanaAtras.setDate(hoje.getDate() - 7);
        return dataRef >= umaSemanaAtras;
      }
      if (periodo === 'MENSAL') return dataRef.getMonth() === hoje.getMonth() && dataRef.getFullYear() === hoje.getFullYear();
      if (periodo === 'ANUAL') return dataRef.getFullYear() === hoje.getFullYear();
      if (periodo === 'INTERVALO') {
        const inicio = dataInicio ? new Date(dataInicio + 'T00:00:00') : null;
        const fim = dataFim ? new Date(dataFim + 'T23:59:59') : null;
        return (!inicio || dataRef >= inicio) && (!fim || dataRef <= fim);
      }
      return true;
    });

    // Ordenação: Se for Diário, queremos do horário mais antigo para o mais novo para o gráfico fazer sentido
    return periodo === 'DIARIO' 
        ? filtrados.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
        : filtrados.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [financeiro, periodo, dataInicio, dataFim, filtroBarbeiro]);

  const stats = useMemo(() => {
    const bruto = dadosFiltradosTotal.reduce((acc, curr) => acc + (curr.valor_total || 0), 0);
    const liquidoBarbearia = dadosFiltradosTotal.reduce((acc, curr) => acc + (curr.valor_barbearia || 0), 0);
    const pagoBarbeiros = dadosFiltradosTotal.reduce((acc, curr) => acc + (curr.valor_barbeiro || 0), 0);

    // Ajuste do Timeline: Se for Diário, agrupa por HORA
    const timeline = {};
    dadosFiltradosTotal.forEach(f => {
      const dataObj = new Date(f.createdAt);
      const label = periodo === 'DIARIO' 
        ? dataObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        : dataObj.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      
      timeline[label] = (timeline[label] || 0) + (f.valor_total || 0);
    });

    const porBarbeiro = barbeiros.map((b, idx) => {
      const lancamentos = dadosFiltradosTotal.filter(f => (f.fk_barbeiro?._id || f.fk_barbeiro) === b._id);
      return {
        name: b.nome.split(' ')[0],
        fullName: b.nome,
        valor_barbeiro: lancamentos.reduce((acc, curr) => acc + (curr.valor_barbeiro || 0), 0),
        bruto: lancamentos.reduce((acc, curr) => acc + (curr.valor_total || 0), 0),
        qtd: lancamentos.length,
        color: COLORS[idx % COLORS.length]
      };
    }).filter(item => item.qtd > 0);

    // Se for diário, não damos reverse, deixamos a ordem cronológica
    let chartData = Object.keys(timeline).map(label => ({ label, valor: timeline[label] }));
    if (periodo !== 'DIARIO') chartData = chartData.reverse();

    return {
      faturamentoBruto: bruto,
      lucroLiquido: liquidoBarbearia,
      comissoes: pagoBarbeiros,
      servicos: dadosFiltradosTotal.length,
      chartData,
      porBarbeiro
    };
  }, [dadosFiltradosTotal, barbeiros, periodo]);

  const dadosPaginados = useMemo(() => {
    // Para a tabela, sempre mostramos o mais recente no topo
    const tableData = [...dadosFiltradosTotal].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const startIndex = (currentPage - 1) * itemsPerPage;
    return tableData.slice(startIndex, startIndex + itemsPerPage);
  }, [dadosFiltradosTotal, currentPage]);

  const totalPages = Math.ceil(dadosFiltradosTotal.length / itemsPerPage);
  useEffect(() => { setCurrentPage(1); }, [periodo, filtroBarbeiro]);

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    // <AdminLayout>
    <>
      <div className="p-4 md:p-8 flex flex-col min-h-screen md:h-full print:block print:bg-white print:p-0">
        
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 print:hidden">
          <div>
            <h1 className="text-xl md:text-2xl font-black italic lowercase tracking-tighter">
              admin.<span className="text-[#e6b32a]">analytics</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[2px]">Performance em Tempo Real</p>
          </div>
          <div className="flex gap-2 sm:gap-3 flex-shrink-0">
             <button onClick={() => setIsFilterOpen(true)} className="w-10 h-10 flex items-center justify-center bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl active:scale-95 transition-transform" aria-label="Filtros">
              <IoFilter size={20} />
            </button>
            <button onClick={() => window.print()} className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-[#e6b32a] text-black hover:scale-105 transition-all shadow-lg shadow-[#e6b32a]/20">
              <IoPrintOutline size={14}/> <span className="hidden sm:inline">Gerar PDF</span>
            </button>
          </div>
        </header>

        {/* --- CARDS --- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8 print:hidden">
          <div className={`p-3 md:p-6 rounded-xl md:rounded-[2rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-2 md:gap-3 mb-1 text-gray-400"><IoWalletOutline size={12} className="md:w-[14px] md:h-[14px]" /> <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Bruto Total</span></div>
            <p className="text-sm md:text-xl font-black text-[#e6b32a] truncate">R$ {stats.faturamentoBruto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`p-3 md:p-6 rounded-xl md:rounded-[2rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-2 md:gap-3 mb-1 text-gray-400"><IoBusinessOutline size={12} className="md:w-[14px] md:h-[14px]" /> <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Lucro Barbearia</span></div>
            <p className="text-sm md:text-xl font-black text-green-500 truncate">R$ {stats.lucroLiquido.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`p-3 md:p-6 rounded-xl md:rounded-[2rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-2 md:gap-3 mb-1 text-gray-400"><IoPeopleOutline size={12} className="md:w-[14px] md:h-[14px]" /> <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Comissões</span></div>
            <p className="text-sm md:text-xl font-black text-blue-500 truncate">R$ {stats.comissoes.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <div className={`p-3 md:p-6 rounded-xl md:rounded-[2rem] border ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center gap-2 md:gap-3 mb-1 text-gray-400"><IoStatsChartOutline size={12} className="md:w-[14px] md:h-[14px]" /> <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest">Serviços</span></div>
            <p className="text-sm md:text-xl font-black">{stats.servicos}</p>
          </div>
        </div>

        {/* --- GRAFICOS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8 print:hidden">
          <div className={`lg:col-span-2 p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 md:mb-8 flex items-center gap-2">
              <IoStatsChartOutline className="text-[#e6b32a]" size={14} /> {periodo === 'DIARIO' ? 'Fluxo de Caixa (Horários)' : 'Faturamento Diário'}
            </h3>
            <div className="h-48 md:h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={stats.chartData}>
                  <defs>
                    <linearGradient id="colorGold" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e6b32a" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#e6b32a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.05} />
                  <XAxis dataKey="label" fontSize={10} axisLine={false} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="valor" stroke="#e6b32a" strokeWidth={4} fill="url(#colorGold)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className={`p-4 md:p-8 rounded-xl md:rounded-[2.5rem] border ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4 md:mb-8 flex items-center gap-2">
              <IoPieChartOutline className="text-[#e6b32a]" size={14} /> Por Barbeiro
            </h3>
            <div className="h-48 md:h-64 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.porBarbeiro} dataKey="bruto" nameKey="name" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={8} stroke="none">
                    {stats.porBarbeiro.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
        {/* --- TABELA --- */}
        <div className={`flex-1 rounded-xl md:rounded-[3rem] border overflow-hidden min-h-0 ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-2xl'}`}>
          <div className="overflow-x-auto min-h-[280px] md:min-h-[400px] custom-scrollbar">
            <div className="md:hidden flex flex-col divide-y divide-white/5">
            {dadosPaginados.map((item) => (
              <div key={item._id} className="p-4 flex flex-col gap-3">

                {/* DATA */}
                <div className="flex justify-between">
                  <span className="text-[10px] text-gray-400 font-bold">
                    {new Date(item.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold">
                    {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* BARBEIRO */}
                <div className="flex flex-col">
                  <span className="text-xs font-black uppercase">
                    {item.fk_barbeiro?.nome || 'Barbeiro'}
                  </span>
                  <span className="text-[10px] text-gray-500 uppercase">
                    {item.fk_agendamento?.nome_cliente || item.fk_agendamento?.fk_cliente?.nome || '---'}
                  </span>
                </div>

                {/* VALORES */}
                <div className="grid grid-cols-2 gap-2 text-[11px] font-bold">
                  <div>
                    <span className="text-gray-500 block text-[9px]">Bruto</span>
                    R$ {item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>

                  <div>
                    <span className="text-gray-500 block text-[9px]">Comissão</span>
                    {item.porcentagem_aplicada}%
                  </div>

                  <div className="text-blue-400">
                    <span className="text-gray-500 block text-[9px]">Pago Barbeiro</span>
                    R$ {item.valor_barbeiro?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>

                  <div className="text-[#e6b32a]">
                    <span className="text-gray-500 block text-[9px]">Líquido</span>
                    R$ {item.valor_barbearia?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </div>

              </div>
            ))}
          </div>
            <table className="hidden md:table w-full border-collapse min-w-[640px]">
              <thead>
                <tr className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <th className="p-3 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-500 text-left whitespace-nowrap">Horário / Data</th>
                  <th className="p-3 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-500 text-left whitespace-nowrap">Profissional / Cliente</th>
                  <th className="p-3 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-500 text-right whitespace-nowrap">Bruto</th>
                  <th className="p-3 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-500 text-right whitespace-nowrap">Comissão (%)</th>
                  <th className="p-3 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-500 text-right whitespace-nowrap">Pago Barbeiro</th>
                  <th className="p-3 md:p-6 text-[8px] md:text-[9px] font-black uppercase text-gray-500 text-right whitespace-nowrap">Líquido</th>
                </tr>
              </thead>
              <tbody>
                {dadosPaginados.map((item) => (
                  <tr key={item._id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="p-3 md:p-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] md:text-[10px] font-bold text-gray-400">
                           {new Date(item.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className="text-[7px] md:text-[8px] text-gray-500 uppercase">{new Date(item.createdAt).toLocaleDateString('pt-BR')}</span>
                      </div>
                    </td>
                    <td className="p-3 md:p-6">
                      <div className="flex flex-col min-w-[100px]">
                        <span className="text-[10px] md:text-xs font-black uppercase truncate">{item.fk_barbeiro?.nome || 'Barbeiro'}</span>
                        <span className="text-[7px] md:text-[8px] text-gray-500 uppercase tracking-tighter truncate">
                          {item.fk_agendamento?.nome_cliente || item.fk_agendamento?.fk_cliente?.nome || '---'}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 md:p-6 text-[10px] md:text-xs font-bold text-right whitespace-nowrap">R$ {item.valor_total?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 md:p-6 text-right">
                      <span className="bg-white/5 px-2 py-1 rounded-md text-[8px] md:text-[9px] font-black">{item.porcentagem_aplicada}%</span>
                    </td>
                    <td className="p-3 md:p-6 text-[10px] md:text-xs font-black text-blue-400 text-right whitespace-nowrap">R$ {item.valor_barbeiro?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                    <td className="p-3 md:p-6 text-[10px] md:text-sm font-black text-[#e6b32a] text-right whitespace-nowrap">R$ {item.valor_barbearia?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {totalPages > 1 && (
            <div className="p-4 md:p-6 border-t border-white/5 print:hidden">
              <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
          )}
        </div>

        <SidebarFiltros isOpen={isFilterOpen} onClose={() => setIsFilterOpen(false)} title="filtros.analytics">
          <div className="space-y-6">
            <SelectPersonalizado 
              label="Profissional" 
              value={filtroBarbeiro} 
              onChange={(e) => setFiltroBarbeiro(e.target?.value || e)}
              options={[{ label: 'Todos', value: 'TODOS' }, ...barbeiros.map(b => ({ label: b.nome, value: b._id }))]}
            />
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase text-gray-500 tracking-widest">Período</label>
              <div className="grid grid-cols-2 gap-2">
                {['DIARIO', 'SEMANAL', 'MENSAL', 'ANUAL', 'TODOS'].map(p => (
                  <button key={p} onClick={() => {setPeriodo(p); setDataInicio(''); setDataFim('');}} className={`py-3 rounded-xl text-[8px] font-black uppercase border transition-all ${periodo === p ? 'bg-[#e6b32a] border-[#e6b32a] text-black shadow-lg shadow-[#e6b32a]/20' : 'bg-transparent border-black/10 dark:border-white/10 text-gray-500'}`}>{p}</button>
                ))}
              </div>
            </div>
          </div>
        </SidebarFiltros>
      </div>
    </>
    // </AdminLayout>
  );
}