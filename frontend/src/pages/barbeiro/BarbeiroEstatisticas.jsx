import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';

export default function BarbeiroEstatisticas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agendamentos, setAgendamentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get(`/agendamentos?fk_barbeiro=${id}`);
        const dados = res.data || res;
        // Consideramos apenas agendamentos finalizados (F) para lucro
        setAgendamentos(Array.isArray(dados) ? dados.filter(a => a.status === 'F') : []);
      } catch (err) {
        console.error("erro ao buscar estatísticas");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Lógica de cálculos
  const agora = new Date();
  
  const lucroTotal = agendamentos.reduce((acc, a) => acc + (a.valor || 0), 0);
  
  const lucroMes = agendamentos.filter(a => {
    const d = new Date(a.datahora);
    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  }).reduce((acc, a) => acc + (a.valor || 0), 0);

  const lucroAno = agendamentos.filter(a => {
    return new Date(a.datahora).getFullYear() === agora.getFullYear();
  }).reduce((acc, a) => acc + (a.valor || 0), 0);

  // Cálculo de serviços mais realizados
  const contagem = agendamentos.reduce((acc, a) => {
    acc[a.tipoCorte] = (acc[a.tipoCorte] || 0) + 1;
    return acc;
  }, {});

  const labels = { 'C': 'cabelo', 'B': 'barba', 'CB': 'cabelo+barba' };
  const servicoMaisRealizado = Object.keys(contagem).reduce((a, b) => contagem[a] > contagem[b] ? a : b, 'C');

  if (loading) return <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-gray-500">carregando dados...</div>;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-gray-100 p-6 font-sans">
      <div className="max-w-md mx-auto space-y-8">
        <header>
          <button onClick={() => navigate(-1)} className="text-xs text-gray-500 uppercase font-black mb-4 tracking-widest hover:text-white transition-colors">← voltar</button>
          <h1 className="text-2xl font-black italic lowercase tracking-tighter">lucros.estatisticas</h1>
        </header>

        {/* cards de faturamento */}
        <div className="space-y-3">
          <div className="bg-[#111] p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
            <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-2">faturamento total</p>
            <h2 className="text-4xl font-black text-[#e6b32a] font-mono">r$ {lucroTotal.toFixed(2)}</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="bg-[#111] p-5 rounded-[2rem] border border-white/5">
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">este mês</p>
              <h3 className="text-lg font-black text-white font-mono">r$ {lucroMes.toFixed(2)}</h3>
            </div>
            <div className="bg-[#111] p-5 rounded-[2rem] border border-white/5">
              <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest mb-1">este ano</p>
              <h3 className="text-lg font-black text-white font-mono">r$ {lucroAno.toFixed(2)}</h3>
            </div>
          </div>
        </div>

        {/* ranking de serviços */}
        <div className="bg-[#111] p-8 rounded-[3rem] border border-white/5">
          <h2 className="text-[10px] text-[#e6b32a] font-black uppercase tracking-[3px] mb-6">ranking de serviços</h2>
          
          <div className="space-y-6">
            {Object.entries(labels).map(([key, label]) => {
              const qtd = contagem[key] || 0;
              const porcentagem = agendamentos.length > 0 ? (qtd / agendamentos.length) * 100 : 0;
              
              return (
                <div key={key} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-sm font-black lowercase">{label}</span>
                    <span className="text-[10px] font-bold text-gray-500 uppercase">{qtd} cortes</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#e6b32a] rounded-full transition-all duration-1000" 
                      style={{ width: `${porcentagem}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-[9px] text-gray-500 uppercase font-black tracking-widest">especialidade da casa</p>
            <p className="text-xl font-black text-white lowercase mt-1">{labels[servicoMaisRealizado]}</p>
          </div>
        </div>
      </div>
    </div>
  );
}