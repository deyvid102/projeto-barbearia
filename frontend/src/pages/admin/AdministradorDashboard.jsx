import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';

export default function AdministradorDashboard() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cores adaptadas para o gráfico (Dourado permanece, Cinzas mudam)
  const COLORS = ['#e6b32a', '#888888', '#444444', '#aaaaaa'];

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

  const statsPorBarbeiro = barbeiros.map(b => {
    const atendimentos = agendamentos.filter(a => 
      (a.fk_barbeiro?._id || a.fk_barbeiro) === b._id && a.status === 'F'
    );
    const lucro = atendimentos.reduce((acc, curr) => acc + (curr.valor || 0), 0);
    return { name: b.nome.split(' ')[0], lucro, qtd: atendimentos.length };
  });

  const lucroTotal = statsPorBarbeiro.reduce((acc, curr) => acc + curr.lucro, 0);
  const qtdAtendimentosTotal = agendamentos.filter(a => a.status === 'F').length;
  const ticketMedio = lucroTotal / (qtdAtendimentosTotal || 1);

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center p-6 transition-colors">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
        <p className="text-[#e6b32a] text-[10px] font-black uppercase tracking-[5px] text-center">carregando central admin...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-4 md:p-8 font-sans pb-24 transition-colors">
      <div className="max-w-6xl mx-auto space-y-6 md:space-y-10">
        
        <header className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-black/5 dark:border-white/5 pb-6 md:pb-8 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/barbeiro/${id}`)}
              className="w-10 h-10 rounded-2xl bg-black/5 dark:bg-white/5 flex items-center justify-center border border-black/10 dark:border-white/10 text-gray-500 dark:text-gray-400 active:scale-90 transition-all"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 16 16"><path fillRule="evenodd" d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"/></svg>
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter text-black dark:text-white">
                admin.<span className="text-[#e6b32a]">panel</span>
              </h1>
              <p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-[3px] md:tracking-[4px] mt-1">visão geral da rede</p>
            </div>
          </div>
          
          <div className="bg-white dark:bg-[#111] p-4 md:p-0 md:bg-transparent rounded-2xl border border-black/5 dark:border-white/5 md:border-none md:text-right">
            <p className="text-[9px] md:text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black tracking-widest">faturamento global</p>
            <p className="text-2xl md:text-3xl font-black text-[#e6b32a] font-mono">
              R$ {lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          <button 
            onClick={() => navigate(`/admin/barbeiros/${id}`)}
            className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-black/5 dark:border-white/5 text-left hover:border-[#e6b32a]/40 transition-all active:scale-95 group relative overflow-hidden shadow-sm dark:shadow-none"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black group-hover:text-[#e6b32a] transition-colors">equipe</p>
              <span className="bg-[#e6b32a] text-black text-[8px] font-black px-2 py-0.5 rounded-full">GERENCIAR</span>
            </div>
            <h2 className="text-4xl font-black text-black dark:text-white">{barbeiros.length}</h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase mt-1">profissionais ativos</p>
          </button>

          <div className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-black/5 dark:border-white/5 shadow-sm dark:shadow-none">
            <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black mb-2">atendimentos</p>
            <h2 className="text-4xl font-black text-black dark:text-white">{qtdAtendimentosTotal}</h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase mt-1">concluídos com sucesso</p>
          </div>

          <button 
            onClick={() => navigate(`/admin/valores/${id}`)}
            className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-black/5 dark:border-white/5 text-left hover:border-[#e6b32a]/40 transition-all active:scale-95 group relative overflow-hidden sm:col-span-2 md:col-span-1 shadow-sm dark:shadow-none"
          >
            <div className="flex justify-between items-center mb-2">
              <p className="text-[10px] text-gray-400 dark:text-gray-500 uppercase font-black group-hover:text-[#e6b32a] transition-colors">tabela de preços</p>
              <span className="bg-[#e6b32a] text-black text-[8px] font-black px-2 py-0.5 rounded-full uppercase">ajustar</span>
            </div>
            <h2 className="text-4xl font-black text-black dark:text-white">
              R$ {ticketMedio.toFixed(0)}
            </h2>
            <p className="text-[10px] text-gray-500 dark:text-gray-600 font-bold uppercase mt-1">ticket médio atual</p>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          <div className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl min-h-[350px]">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-[#e6b32a] rounded-full"></span>
              lucro por profissional (R$)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={statsPorBarbeiro}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" darkStroke="#222" vertical={false} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: 'transparent'}}
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '15px', fontSize: '12px', color: '#fff' }}
                    itemStyle={{ color: '#e6b32a', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="lucro" fill="#e6b32a" radius={[8, 8, 0, 0]} barSize={30} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111] p-6 md:p-8 rounded-[2.5rem] border border-black/5 dark:border-white/5 shadow-xl dark:shadow-2xl min-h-[350px]">
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <span className="w-2 h-2 bg-black dark:bg-white rounded-full"></span>
              volume de cortes (%)
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statsPorBarbeiro}
                    dataKey="qtd"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                  >
                    {statsPorBarbeiro.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '15px', fontSize: '12px', color: '#fff' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[4px] text-[#e6b32a] pl-2">ranking de performance</h3>
          <div className="grid gap-3">
            {statsPorBarbeiro.sort((a, b) => b.lucro - a.lucro).map((b, idx) => (
              <div key={idx} className="bg-white dark:bg-[#111] p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-black/5 dark:border-white/5 flex items-center justify-between hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors shadow-sm dark:shadow-none">
                <div className="flex items-center gap-4">
                  <span className="text-gray-300 dark:text-gray-700 font-black italic text-lg md:text-xl w-6">#{idx + 1}</span>
                  <div className="max-w-[120px] md:max-w-none">
                    <h4 className="font-black text-black dark:text-white lowercase text-base md:text-lg leading-none truncate">{b.name}</h4>
                    <p className="text-[9px] text-gray-400 dark:text-gray-500 uppercase font-black mt-1">{b.qtd} atendimentos</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-base md:text-xl font-black text-black dark:text-white font-mono">
                    R$ {b.lucro.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}