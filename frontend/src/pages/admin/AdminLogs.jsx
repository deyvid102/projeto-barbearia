import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { FaHistory, FaCheckCircle, FaTimesCircle, FaArrowLeft } from 'react-icons/fa';

export default function AdminLogs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      // Buscamos todos os agendamentos para filtrar o histórico
      const res = await api.get('/agendamentos');
      const dados = res.data || res || [];
      
      // Filtramos apenas o que não está mais em aberto ('A') e ordenamos pelos mais recentes
      const historico = dados
        .filter(a => a.status !== 'A')
        .sort((a, b) => new Date(b.updatedAt || b.datahora) - new Date(a.updatedAt || a.datahora));
      
      setLogs(historico);
    } catch (error) {
      console.error("erro ao buscar logs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] flex items-center justify-center">
      <div className="w-8 h-8 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0a] text-slate-900 dark:text-gray-100 transition-colors duration-300">
      <div className="max-w-[1000px] mx-auto p-4 md:p-8 pb-20">
        
        <header className="flex items-center gap-6 border-b border-slate-100 dark:border-white/5 pb-8 mb-12">
          <button 
            onClick={() => navigate(-1)} 
            className="w-12 h-12 rounded-2xl bg-slate-50 dark:bg-white/5 flex items-center justify-center border border-slate-200 dark:border-white/10 hover:border-[#e6b32a] transition-all"
          >
            <FaArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-3xl font-black lowercase tracking-tighter">agendamentos.<span className="text-[#e6b32a]">logs</span></h1>
            <p className="text-[10px] text-slate-400 uppercase font-black tracking-[4px] mt-2">histórico de movimentações</p>
          </div>
        </header>

        {logs.length === 0 ? (
          <div className="text-center py-20 bg-slate-50 dark:bg-[#111] rounded-[3rem] border border-dashed border-slate-200 dark:border-white/10">
            <p className="text-slate-400 uppercase font-black text-[10px] tracking-widest">nenhum registro encontrado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.map((log) => (
              <div 
                key={log._id}
                className="bg-white dark:bg-[#111] p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:shadow-lg transition-all"
              >
                <div className="flex items-center gap-5">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                    log.status === 'F' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                  }`}>
                    {log.status === 'F' ? <FaCheckCircle size={20} /> : <FaTimesCircle size={20} />}
                  </div>
                  
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-black text-lg lowercase tracking-tight">
                        {log.fk_cliente?.nome || 'cliente final'}
                      </h4>
                      <span className="text-[8px] font-black uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-white/5 text-slate-400">
                        {log.tipoCorte}
                      </span>
                    </div>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                      atendido por: <span className="text-[#e6b32a]">{log.fk_barbeiro?.nome || 'barbeiro'}</span>
                    </p>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-slate-50 dark:border-white/5 pt-4 md:pt-0">
                  <span className="font-mono font-black text-lg">
                    R$ {(log.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <p className="text-[9px] font-black text-slate-400 uppercase">
                    {new Date(log.updatedAt || log.datahora).toLocaleString('pt-BR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}