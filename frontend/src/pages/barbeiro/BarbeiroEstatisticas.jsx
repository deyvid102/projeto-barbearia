import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';

export default function BarbeiroEstatisticas() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [agendamentos, setAgendamentos] = useState([]);
  const [servicosAdmin, setServicosAdmin] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const resAgendamentos = await api.get(`/agendamentos?fk_barbeiro=${id}`);
        const agendadosFinalizados = (resAgendamentos.data || resAgendamentos).filter(a => a.status === 'F');
        setAgendamentos(agendadosFinalizados);

        try {
          const resServicos = await api.get('/servicos');
          setServicosAdmin(resServicos.data || resServicos);
        } catch {
          const mockServicos = [{_id:'C', nome:'cabelo', sigla:'C'}, {_id:'B', nome:'barba', sigla:'B'}, {_id:'CB', nome:'cabelo+barba', sigla:'CB'}];
          setServicosAdmin(mockServicos);
        }
      } catch (err) {
        console.error(err);
      } finally { setLoading(false); }
    };
    fetchData();
  }, [id]);

  const agora = new Date();
  const lucroTotal = agendamentos.reduce((acc, a) => acc + (a.valor || 0), 0);
  const lucroMes = agendamentos.filter(a => {
    const d = new Date(a.datahora);
    return d.getMonth() === agora.getMonth() && d.getFullYear() === agora.getFullYear();
  }).reduce((acc, a) => acc + (a.valor || 0), 0);

  const rankingDinamico = servicosAdmin.map(servico => {
    const qtd = agendamentos.filter(ag => ag.tipoCorte === servico.nome || ag.tipoCorte === servico._id || ag.tipoCorte === servico.sigla).length;
    return { label: servico.nome, qtd, porcentagem: agendamentos.length > 0 ? (qtd / agendamentos.length) * 100 : 0 };
  }).sort((a, b) => b.qtd - a.qtd);

  if (loading) return <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center text-[10px] font-black uppercase tracking-widest text-slate-400">sincronizando...</div>;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-8">
        
        <header className="flex items-center gap-6 pt-4">
          <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-black dark:hover:border-[#e6b32a] transition-all">←</button>
          <div>
            <h1 className="text-3xl font-black italic lowercase tracking-tighter leading-none">lucros.estatisticas</h1>
            <p className="text-[10px] text-[#e6b32a] uppercase font-black tracking-[4px] mt-2">desempenho</p>
          </div>
        </header>

        {/* Layout Grid para PC: Esquerda (Faturamento), Direita (Ranking) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          <div className="space-y-4">
            <div className="bg-slate-900 dark:bg-[#111] p-10 rounded-[3rem] border border-slate-800 dark:border-white/5 shadow-2xl">
              <p className="text-[11px] text-slate-400 uppercase font-black tracking-widest mb-3">faturamento total acumulado</p>
              <h2 className="text-5xl md:text-6xl font-black text-white dark:text-[#e6b32a] font-mono tracking-tighter">r$ {lucroTotal.toFixed(2)}</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-[#111] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                <p className="text-[10px] text-slate-400 uppercase font-black mb-2">este mês</p>
                <h3 className="text-2xl font-black font-mono">r$ {lucroMes.toFixed(2)}</h3>
              </div>
              <div className="bg-slate-50 dark:bg-[#111] p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5">
                <p className="text-[10px] text-slate-400 uppercase font-black mb-2">ticket médio</p>
                <h3 className="text-2xl font-black font-mono">r$ {(lucroTotal / (agendamentos.length || 1)).toFixed(2)}</h3>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-[#111] p-10 rounded-[3rem] border border-slate-100 dark:border-white/5 flex flex-col justify-between">
            <div className="space-y-8">
              <h2 className="text-[11px] text-[#e6b32a] font-black uppercase tracking-[5px]">ranking de serviços</h2>
              <div className="space-y-8">
                {rankingDinamico.map((item, idx) => (
                  <div key={idx} className="space-y-3">
                    <div className="flex justify-between items-end">
                      <span className="text-lg font-black lowercase">{item.label}</span>
                      <span className="text-[11px] font-bold text-slate-400 uppercase">{item.qtd} atendimentos</span>
                    </div>
                    <div className="h-2 w-full bg-slate-200 dark:bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-slate-900 dark:bg-[#e6b32a] transition-all duration-1000" style={{ width: `${item.porcentagem}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-white/5">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">serviço mais buscado</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white lowercase mt-1">{rankingDinamico[0]?.label || 'sem dados'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}