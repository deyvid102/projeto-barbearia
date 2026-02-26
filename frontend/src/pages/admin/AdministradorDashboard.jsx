import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell 
} from 'recharts';
import { 
  IoArrowBack, IoPeople, IoCalendar, 
  IoDocumentText, IoStatsChart, IoAnalytics, IoCut, 
  IoCheckmarkCircle, IoCloseCircle 
} from 'react-icons/io5';

export default function AdministradorDashboard() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme(); 
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [agendamentos, setAgendamentos] = useState([]);
  const [totalServicosCadastrados, setTotalServicosCadastrados] = useState(0);
  const [loading, setLoading] = useState(true);

  const COLORS = ['#e6b32a', '#3b82f6', '#10b981', '#8b5cf6', '#f43f5e'];

  useEffect(() => {
    if (id) fetchGlobalData();
  }, [id]);

  const fetchGlobalData = async () => {
    try {
      setLoading(true);
      const resAdmin = await api.get(`/barbeiros/${id}`);
      const adminData = resAdmin.data || resAdmin;
      const targetId = (adminData.fk_barbearia?._id || adminData.fk_barbearia)?.toString();

      const [resB, resA, resS] = await Promise.all([
        api.get('/barbeiros'),
        api.get('/agendamentos'),
        api.get('/servicos') // Ajuste o endpoint se for /valores ou outro
      ]);
      
      const todosB = Array.isArray(resB.data) ? resB.data : (Array.isArray(resB) ? resB : []);
      const todosA = Array.isArray(resA.data) ? resA.data : (Array.isArray(resA) ? resA : []);
      const todosS = Array.isArray(resS.data) ? resS.data : (Array.isArray(resS) ? resS : []);

      const filtradosB = todosB.filter(b => (b.fk_barbearia?._id || b.fk_barbearia)?.toString() === targetId);
      const filtradosA = todosA.filter(a => (a.fk_barbearia?._id || a.fk_barbearia)?.toString() === targetId);
      // Filtra os tipos de serviços cadastrados para esta barbearia
      const filtradosS = todosS.filter(s => (s.fk_barbearia?._id || s.fk_barbearia)?.toString() === targetId);

      setBarbeiros(filtradosB);
      setAgendamentos(filtradosA);
      setTotalServicosCadastrados(filtradosS.length);
    } catch (error) {
      console.error("erro dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const statsPorBarbeiro = barbeiros.map((b, index) => {
    const atendimentos = agendamentos.filter(a => (a.fk_barbeiro?._id || a.fk_barbeiro)?.toString() === b._id?.toString() && a.status === 'F');
    const lucro = atendimentos.reduce((acc, curr) => acc + (Number(curr.valor) || 0), 0);
    return { 
      name: b.nome ? b.nome.split(' ')[0] : 'prof.', 
      fullName: b.nome || 'profissional',
      lucro, 
      qtd: atendimentos.length,
      color: COLORS[index % COLORS.length]
    };
  });

  // Lógica para Agenda de Hoje
  const hojeStr = new Date().toISOString().split('T')[0];
  const temAgendaHoje = agendamentos.some(a => a.datahora.startsWith(hojeStr) && a.status !== 'C');
  const dataHojeFormatada = new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

  const lucroTotal = statsPorBarbeiro.reduce((acc, curr) => acc + curr.lucro, 0);
  const totalLogs = agendamentos.length;

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-[#0a0a0a] text-gray-100' : 'bg-gray-50 text-slate-900'} p-4 md:p-8 pb-24 font-sans transition-colors duration-300`}>
      <div className="max-w-6xl mx-auto space-y-8">
        
        <header className="flex flex-col md:flex-row md:justify-between md:items-center border-b border-black/5 dark:border-white/5 pb-8 gap-6">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(`/barbeiro/${id}`)}
              className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all active:scale-90 ${
                isDarkMode ? 'bg-white/5 border-white/10 hover:border-[#e6b32a]' : 'bg-white border-slate-200 hover:border-black'
              }`}
            >
              <IoArrowBack size={20} />
            </button>
            <div>
              <h1 className="text-2xl md:text-3xl font-black italic lowercase tracking-tighter">
                admin.<span className="text-[#e6b32a]">panel</span>
              </h1>
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-[4px] mt-1">unidade ativa</p>
            </div>
          </div>
          
          <div className="md:text-right">
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">faturamento total</p>
            <p className="text-4xl font-black text-[#e6b32a] font-mono tracking-tighter">
              R$ {lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </header>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <button 
            onClick={() => navigate(`/admin/analytics/${id}`)}
            className="col-span-2 lg:col-span-1 bg-[#e6b32a] p-6 rounded-[2rem] text-left hover:scale-[1.03] active:scale-95 transition-all relative overflow-hidden group shadow-lg shadow-[#e6b32a]/10"
          >
            <IoAnalytics size={24} className="mb-4 text-black" />
            <h2 className="text-xl font-black tracking-tighter text-black uppercase">analytics</h2>
            <IoStatsChart size={90} className="absolute -right-4 -bottom-4 text-black/10 group-hover:rotate-12 transition-transform" />
          </button>

          <NavCard onClick={() => navigate(`/admin/barbeiros/${id}`)} icon={<IoPeople/>} label="barbeiros" value={barbeiros.length} isDarkMode={isDarkMode} />
          
          <NavCard onClick={() => navigate(`/admin/logs/${id}`)} icon={<IoDocumentText/>} label="logs" value={totalLogs} textColor="text-blue-400" isDarkMode={isDarkMode} />
          
          {/* Card Agenda com Status de Hoje */}
          <NavCard 
            onClick={() => navigate(`/admin/agenda/${id}`)} 
            icon={<IoCalendar/>} 
            label={`hoje ${dataHojeFormatada}`} 
            value={temAgendaHoje ? <IoCheckmarkCircle className="text-emerald-500" /> : <IoCloseCircle className="text-red-500" />} 
            isDarkMode={isDarkMode}
            subtext={temAgendaHoje ? "há horários" : "sem agenda"}
          />
          
          <NavCard 
            onClick={() => navigate(`/admin/valores/${id}`)} 
            icon={<IoCut/>} 
            label="serviços" 
            value={totalServicosCadastrados} 
            textColor="text-emerald-400" 
            isDarkMode={isDarkMode} 
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className={`p-6 md:p-8 rounded-[2.5rem] border flex flex-col h-[400px] ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-8 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-[#e6b32a]" /> faturamento/prof
            </h3>
            <div className="flex-1 w-full min-h-0">
              {statsPorBarbeiro.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsPorBarbeiro}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.03} />
                    <XAxis dataKey="name" fontSize={10} axisLine={false} tickLine={false} tick={{fill: '#888'}} />
                    <Tooltip 
                      cursor={{fill: 'rgba(150,150,150,0.1)'}} 
                      content={<CustomTooltip isDarkMode={isDarkMode} />} 
                      wrapperStyle={{ zIndex: 1000 }}
                    />
                    <Bar dataKey="lucro" radius={[10, 10, 10, 10]} barSize={35}>
                      {statsPorBarbeiro.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : <NoData />}
            </div>
          </div>

          <div className={`p-6 md:p-8 rounded-[2.5rem] border flex flex-col h-[400px] relative ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-100'}`}>
            <h3 className="text-[10px] font-black uppercase tracking-widest mb-8 text-gray-500 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-blue-500" /> volume total
            </h3>
            <div className="flex-1 w-full min-h-0 relative">
              {statsPorBarbeiro.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statsPorBarbeiro}
                      dataKey="qtd"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={95}
                      paddingAngle={8}
                      stroke="none"
                    >
                      {statsPorBarbeiro.map((entry, index) => (
                        <Cell key={index} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                       content={<CustomTooltip isDarkMode={isDarkMode} />} 
                       wrapperStyle={{ zIndex: 1000 }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : <NoData />}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-[8px] font-black uppercase text-gray-500 tracking-widest">atendimentos</p>
                <p className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {statsPorBarbeiro.reduce((acc, curr) => acc + curr.qtd, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavCard({ icon, label, value, textColor = "text-[#e6b32a]", onClick, isDarkMode, subtext }) {
  return (
    <button 
      onClick={onClick}
      className={`p-5 rounded-[2rem] border hover:scale-[1.03] active:scale-95 transition-all duration-300 text-left group flex flex-col justify-between h-full ${
        isDarkMode ? 'bg-[#111] border-white/5 hover:bg-[#161616]' : 'bg-white border-slate-200 hover:border-black/10 shadow-sm'
      }`}
    >
      <div className="flex justify-between items-center mb-4 text-gray-500 group-hover:text-[#e6b32a] transition-colors">
        <div className="text-xl">{icon}</div>
      </div>
      <div>
        <p className="text-[9px] font-black uppercase text-gray-400 mb-1">{label}</p>
        <div className={`text-3xl font-black tracking-tighter ${textColor} flex items-center`}>
          {value}
        </div>
        {subtext && <p className="text-[8px] font-bold text-gray-500 mt-1 uppercase italic">{subtext}</p>}
      </div>
    </button>
  );
}

function NoData() {
  return (
    <div className="h-full flex flex-col items-center justify-center opacity-10">
      <IoAnalytics size={40} />
      <p className="text-[10px] font-black uppercase mt-2">sem dados</p>
    </div>
  );
}

const CustomTooltip = ({ active, payload, isDarkMode }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className={`p-4 rounded-2xl border shadow-2xl min-w-[140px] ${isDarkMode ? 'bg-[#1a1a1a] border-white/10' : 'bg-white border-slate-200'}`} style={{ position: 'relative', zIndex: 9999 }}>
        <p className="text-[10px] font-black uppercase text-gray-500 mb-1">{data.fullName}</p>
        <p className={`text-xl font-black font-mono ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>R$ {data.lucro.toLocaleString('pt-BR')}</p>
        <p className="text-[9px] text-[#e6b32a] uppercase font-bold mt-1">{data.qtd} serviços</p>
      </div>
    );
  }
  return null;
};