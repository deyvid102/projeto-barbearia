import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import { 
  FaCheckCircle, FaTimesCircle, FaArrowLeft, 
  FaCalendarAlt, FaHistory 
} from 'react-icons/fa';
import { IoFilter } from 'react-icons/io5';

import Pagination from '../../components/Pagination';
import SidebarFiltros from '../../components/SideBarFiltros.jsx';
import SelectPersonalizado from '../../components/SelectPersonalizado';

export default function AdminLogs() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [logs, setLogs] = useState([]);
  const [barbeiros, setBarbeiros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Estados dos Filtros
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroBarbeiro, setFiltroBarbeiro] = useState('todos');
  const [filtroData, setFiltroData] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      const [resL, resB] = await Promise.all([api.get('/agendamentos'), api.get('/barbeiros')]);
      setLogs((resL.data || resL || []).filter(a => a.status !== 'A'));
      setBarbeiros(resB.data || resB || []);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const logsFiltrados = logs.filter(log => {
    const matchStatus = filtroStatus === 'TODOS' ? true : log.status === filtroStatus;
    const bId = log.fk_barbeiro?._id || log.fk_barbeiro;
    const matchBarbeiro = filtroBarbeiro === 'todos' ? true : bId?.toString() === filtroBarbeiro;
    const matchData = filtroData ? new Date(log.datahora).toISOString().split('T')[0] === filtroData : true;
    return matchStatus && matchBarbeiro && matchData;
  }).sort((a, b) => new Date(b.updatedAt || b.datahora) - new Date(a.updatedAt || a.datahora));

  const currentLogs = logsFiltrados.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] text-gray-900 dark:text-gray-100 p-4 md:p-8 font-sans transition-colors">
      
      <header className="max-w-6xl mx-auto flex justify-between items-center mb-12">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-xl bg-white dark:bg-white/5 border border-black/5 dark:border-white/10 flex items-center justify-center hover:text-[#e6b32a] transition-all">
            <FaArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-xl font-black italic lowercase tracking-tighter text-gray-900 dark:text-white">
              agendamentos.<span className="text-[#e6b32a]">logs</span>
            </h1>
            <p className="text-[8px] text-gray-500 uppercase font-black tracking-[3px]">histórico de movimentações</p>
          </div>
        </div>

        <button 
          onClick={() => setIsFilterOpen(true)}
          className="w-10 h-10 flex items-center justify-center bg-[#e6b32a] text-black rounded-xl hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#e6b32a]/20"
        >
          <IoFilter size={20} />
        </button>
      </header>

      <main className="max-w-4xl mx-auto">
        <div className="space-y-4">
          {currentLogs.length === 0 ? (
            <div className="text-center py-20 bg-white dark:bg-[#111] rounded-[2rem] border border-dashed border-black/10 dark:border-white/10">
              <FaHistory className="mx-auto mb-4 opacity-10" size={40} />
              <p className="text-gray-400 uppercase font-black text-[10px] tracking-widest">nenhum registro encontrado</p>
            </div>
          ) : (
            <>
              {currentLogs.map((log) => (
                <div key={log._id} className="bg-white dark:bg-[#111] p-6 rounded-[2.5rem] border border-black/5 dark:border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-xl transition-all group">
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${
                      log.status === 'F' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {log.status === 'F' ? <FaCheckCircle size={24} /> : <FaTimesCircle size={24} />}
                    </div>
                    <div>
                      <h4 className="font-black text-lg lowercase tracking-tight mb-1">{log.fk_cliente?.nome || 'cliente'}</h4>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                        {log.tipoCorte} • <span className="text-[#e6b32a]">{log.fk_barbeiro?.nome}</span>
                      </p>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-2xl border border-black/5 dark:border-white/5">
                    <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1 flex items-center gap-2">
                      <FaCalendarAlt className="text-[#e6b32a]" size={10} /> data agendada
                    </p>
                    <p className="text-xs font-bold font-mono">
                      {new Date(log.datahora).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  <div className="text-right">
                    <span className={`font-mono font-black text-xl ${log.status === 'F' ? 'text-emerald-500' : 'text-gray-400'}`}>
                      R$ {(log.valor || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    <p className="text-[8px] font-black text-gray-400 uppercase mt-1">{log.status === 'F' ? 'Finalizado' : 'Cancelado'}</p>
                  </div>
                </div>
              ))}
              <Pagination currentPage={currentPage} totalPages={Math.ceil(logsFiltrados.length / itemsPerPage)} onPageChange={setCurrentPage} totalItems={logsFiltrados.length} />
            </>
          )}
        </div>
      </main>

      {/* SIDEBAR DE FILTROS REUTILIZÁVEL */}
      <SidebarFiltros 
        isOpen={isFilterOpen} 
        onClose={() => setIsFilterOpen(false)} 
        title="filtros.logs"
      >
        <SelectPersonalizado 
          label="profissional"
          value={filtroBarbeiro}
          onChange={(val) => { setFiltroBarbeiro(val); setCurrentPage(1); }}
          options={[
            { value: 'todos', label: 'Todos os Profissionais' },
            ...barbeiros.map(b => ({ value: b._id, label: b.nome }))
          ]}
        />

        <section>
          <label className="text-[8px] font-black uppercase text-gray-500 block mb-3 tracking-[3px] ml-1">status</label>
          <div className="grid grid-cols-1 gap-2">
            {['TODOS', 'F', 'C'].map(s => (
              <button 
                key={s} 
                onClick={() => { setFiltroStatus(s); setCurrentPage(1); }} 
                className={`py-3 rounded-xl text-[8px] font-black uppercase border transition-all ${filtroStatus === s ? 'bg-[#e6b32a] border-[#e6b32a] text-black' : 'bg-transparent border-black/10 dark:border-white/10 text-gray-500'}`}
              >
                {s === 'TODOS' ? 'Todos' : s === 'F' ? 'Finalizados' : 'Cancelados'}
              </button>
            ))}
          </div>
        </section>

        <section>
          <label className="text-[8px] font-black uppercase text-gray-500 block mb-3 tracking-[3px] ml-1">data específica</label>
          <input 
            type="date" 
            value={filtroData} 
            onChange={(e) => { setFiltroData(e.target.value); setCurrentPage(1); }} 
            className="w-full bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-xl py-3 px-4 text-[10px] font-black text-gray-900 dark:text-white outline-none focus:border-[#e6b32a]" 
          />
        </section>

        <button 
          onClick={() => { setFiltroStatus('TODOS'); setFiltroBarbeiro('todos'); setFiltroData(''); setCurrentPage(1); }}
          className="w-full text-[8px] font-black uppercase text-rose-500 tracking-widest opacity-60 hover:opacity-100"
        >
          limpar filtros
        </button>
      </SidebarFiltros>
    </div>
  );
}