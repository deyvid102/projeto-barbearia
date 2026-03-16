import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js'; 
import { useTheme } from '../../components/ThemeContext';
import AdminLayout from '../../layout/AdminLayout';
import SelectPersonalizado from '../../components/SelectPersonalizado';
import Pagination from '../../components/Pagination'; 
import { IoPrintOutline } from 'react-icons/io5';

export default function AdminLogs() {
  const { id } = useParams(); 
  const { isDarkMode } = useTheme();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nomeBarbearia, setNomeBarbearia] = useState('Barbearia');

  const [periodo, setPeriodo] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroBarbeiro, setFiltroBarbeiro] = useState('TODOS');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      
      let idBarbeariaFinal = id;
      if (!idBarbeariaFinal || idBarbeariaFinal === 'undefined') {
        const storageUser = localStorage.getItem('user');
        const userData = JSON.parse(storageUser || '{}');
        idBarbeariaFinal = userData.fk_barbearia?._id || userData.fk_barbearia;
      }

      if (idBarbeariaFinal) {
        const response = await api.get(`/logs/barbearia/${idBarbeariaFinal}`);
        const logsData = response.data || response || [];
        
        const logsFiltradosBase = Array.isArray(logsData) 
          ? logsData.filter(log => log && (log.status_acao === 'F' || log.status_acao === 'C'))
          : [];
        
        setLogs(logsFiltradosBase);

        const primeiroLog = logsFiltradosBase.find(l => l.fk_barbearia);
        if (primeiroLog?.fk_barbearia) {
          const empresa = primeiroLog.fk_barbearia;
          setNomeBarbearia(empresa.nome_fantasia || empresa.nome || 'Barbearia');
        }
      }
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const logsFiltradosTotal = useMemo(() => {
    const hoje = new Date();
    return logs.filter(log => {
      if (!log) return false;
      const dataLog = new Date(log.data_log || log.createdAt);
      
      let matchPeriodo = true;
      if (periodo === 'DIARIO') matchPeriodo = dataLog.toDateString() === hoje.toDateString();
      else if (periodo === 'MENSAL') matchPeriodo = dataLog.getMonth() === hoje.getMonth() && dataLog.getFullYear() === hoje.getFullYear();
      else if (periodo === 'ANUAL') matchPeriodo = dataLog.getFullYear() === hoje.getFullYear();
      else if (periodo === 'INTERVALO') {
        const inicio = dataInicio ? new Date(dataInicio + 'T00:00:00') : null;
        const fim = dataFim ? new Date(dataFim + 'T23:59:59') : null;
        matchPeriodo = (!inicio || dataLog >= inicio) && (!fim || dataLog <= fim);
      }

      const matchStatus = filtroStatus === 'TODOS' || log.status_acao === filtroStatus;
      const idBarbeiro = log.fk_barbeiro?._id || log.fk_barbeiro;
      const matchBarbeiro = filtroBarbeiro === 'TODOS' || idBarbeiro === filtroBarbeiro;

      return matchPeriodo && matchStatus && matchBarbeiro;
    });
  }, [logs, periodo, dataInicio, dataFim, filtroStatus, filtroBarbeiro]);

  const logsPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return logsFiltradosTotal.slice(startIndex, startIndex + itemsPerPage);
  }, [logsFiltradosTotal, currentPage]);

  const totalPages = Math.ceil(logsFiltradosTotal.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [periodo, filtroStatus, filtroBarbeiro]);

  const listaBarbeiros = useMemo(() => {
    const map = new Map();
    logs.forEach(l => {
      if (l.fk_barbeiro?._id) map.set(l.fk_barbeiro._id, l.fk_barbeiro.nome);
    });
    return Array.from(map.entries()).map(([value, label]) => ({ label, value }));
  }, [logs]);

  const formatarDataHora = (dataStr) => {
    if (!dataStr) return '--/-- --:--';
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <AdminLayout>
      <div className={`min-h-[60vh] flex flex-col items-center justify-center gap-4 transition-colors duration-300 ${isDarkMode ? 'bg-[#0d0d0d]' : 'bg-transparent'}`}>
        <div className="relative flex items-center justify-center">
          <div className="w-12 h-12 border-4 border-[#e6b32a]/20 rounded-full" />
          <div className="absolute w-12 h-12 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className={`text-[10px] font-black uppercase tracking-[3px] animate-pulse ${isDarkMode ? 'text-white/40' : 'text-slate-400'}`}>
          Carregando Logs...
        </p>
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 flex flex-col min-h-screen md:h-full print:block print:bg-white print:p-0">
        
        <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 print:hidden">
          <div>
            <h1 className="text-xl md:text-2xl font-black italic lowercase tracking-tighter">
              histórico.<span className="text-[#e6b32a]">atividades</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[2px]">Auditoria de Registros</p>
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-2 px-4 md:px-6 py-2 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest bg-[#e6b32a] text-black hover:scale-105 transition-all shadow-lg shadow-[#e6b32a]/20 w-fit">
            <IoPrintOutline size={14}/> <span className="hidden sm:inline">Gerar PDF</span>
          </button>
        </header>

        {/* Filtros */}
        <div className={`mb-4 md:mb-6 p-4 md:p-6 rounded-xl md:rounded-[2rem] border flex flex-col sm:flex-row flex-wrap gap-3 md:gap-4 items-stretch sm:items-end print:hidden ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
          <div className="w-full sm:flex-1 sm:min-w-[140px] min-w-0">
            <SelectPersonalizado 
              label="Período" value={periodo} 
              onChange={(e) => setPeriodo(e.target?.value || e)}
              options={[
                { label: 'Todo o tempo', value: 'TODOS' },
                { label: 'Hoje', value: 'DIARIO' },
                { label: 'Este Mês', value: 'MENSAL' },
                { label: 'Este Ano', value: 'ANUAL' },
                { label: 'Intervalo Personalizado', value: 'INTERVALO' },
              ]}
            />
          </div>

          {periodo === 'INTERVALO' && (
            <div className="flex gap-2 w-full sm:flex-1 sm:min-w-[200px] min-w-0">
              <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={`flex-1 min-w-0 text-[10px] font-bold p-3 rounded-xl bg-transparent border h-[46px] outline-none ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-300'}`} />
              <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={`flex-1 min-w-0 text-[10px] font-bold p-3 rounded-xl bg-transparent border h-[46px] outline-none ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-300'}`} />
            </div>
          )}

          <div className="w-full sm:flex-1 sm:min-w-[120px] min-w-0">
            <SelectPersonalizado 
              label="Status" value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target?.value || e)}
              options={[{ label: 'Todos', value: 'TODOS' }, { label: 'Finalizados', value: 'F' }, { label: 'Cancelados', value: 'C' }]}
            />
          </div>

          <div className="w-full sm:flex-1 sm:min-w-[120px] min-w-0">
            <SelectPersonalizado 
              label="Profissional" value={filtroBarbeiro} 
              onChange={(e) => setFiltroBarbeiro(e.target?.value || e)}
              options={[{ label: 'Todos', value: 'TODOS' }, ...listaBarbeiros]}
            />
          </div>
        </div>

        {/* Tabela */}
        <div className={`flex-1 rounded-xl md:rounded-[2.5rem] border overflow-hidden min-h-0 print:border-none ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-2xl'}`}>
          <div className="overflow-x-auto min-h-[280px] md:min-h-[400px] custom-scrollbar">
            <table className="w-full border-collapse min-w-[520px]">
              <thead>
                <tr className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} print:bg-white print:border-b-2 print:border-black`}>
                  <th className="p-3 md:p-5 text-[9px] md:text-[10px] font-black uppercase text-gray-500 text-left whitespace-nowrap">Agendamento</th>
                  <th className="p-3 md:p-5 text-[9px] md:text-[10px] font-black uppercase text-gray-500 text-left whitespace-nowrap">Profissional</th>
                  <th className="p-3 md:p-5 text-[9px] md:text-[10px] font-black uppercase text-gray-500 text-left whitespace-nowrap">Cliente</th>
                  <th className="p-3 md:p-5 text-[9px] md:text-[10px] font-black uppercase text-gray-500 text-center whitespace-nowrap">Status</th>
                  <th className="p-3 md:p-5 text-[9px] md:text-[10px] font-black uppercase text-gray-500 text-center whitespace-nowrap">Bruto</th>
                  <th className="p-3 md:p-5 text-[9px] md:text-[10px] font-black uppercase text-gray-500 text-center whitespace-nowrap">Comissão</th>
                  <th className="p-3 md:p-5 text-[9px] md:text-[10px] font-black uppercase text-gray-500 text-center whitespace-nowrap">Pago Barbeiro</th>
                  <th className="p-3 md:p-5 text-[9px] md:text-[10px] font-black uppercase text-gray-500 text-center whitespace-nowrap">Líquido</th>
                  <th className="p-3 md:p-5 text-[9px] md:text-[10px] font-black uppercase text-gray-500 text-center whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody>
                {logsPaginados.map((log) => (
                  <tr key={log._id} className="border-b border-white/5 hover:bg-white/[0.01] transition-colors print:border-slate-200">
                    <td className="p-3 md:p-5 text-[10px] md:text-[11px] font-black text-[#e6b32a] print:text-black whitespace-nowrap">{formatarDataHora(log.fk_agendamento?.datahora)}</td>
                    <td className="p-3 md:p-5 text-[10px] md:text-xs font-bold uppercase print:text-black whitespace-nowrap">
                      {log.status_acao === 'C' && log.canceladoPor === 'Cliente' ? 'O CLIENTE' : (log.fk_barbeiro?.nome || 'SISTEMA')}
                    </td>

                    <td className="p-3 md:p-5 text-[10px] md:text-xs font-bold uppercase print:text-black whitespace-nowrap">
                      {(() => {
                        const nome = log.fk_agendamento?.nome_cliente || 
                                     log.fk_agendamento?.cliente_nome || 
                                     log.fk_agendamento?.nome ||
                                     log.nome_cliente || 
                                     log.cliente_nome;
                        return nome || "CLIENTE";
                      })()}
                    </td>

                    <td className="p-3 md:p-5 text-center">
                      <span className={`text-[8px] md:text-[9px] font-black px-2 py-1 rounded whitespace-nowrap ${log.status_acao === 'C' ? 'bg-red-500/10 text-red-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {log.status_acao === 'C' ? 'CANCELADO' : 'FINALIZADO'}
                      </span>
                    </td>

                    <td className="p-3 md:p-5 text-xs font-bold text-right whitespace-nowrap">
                      R$ {log.valor_total?.toLocaleString('pt-BR',{minimumFractionDigits:2}) || "0,00"}
                    </td>

                    <td className="p-3 md:p-5 text-right">
                      <span className="bg-white/5 px-2 py-1 rounded text-[9px] font-black">
                        {log.porcentagem_aplicada || 0}%
                      </span>
                    </td>

                    <td className="p-3 md:p-5 text-xs font-black text-blue-400 text-right whitespace-nowrap">
                      R$ {log.valor_barbeiro?.toLocaleString('pt-BR',{minimumFractionDigits:2}) || "0,00"}
                    </td>

                    <td className="p-3 md:p-5 text-sm font-black text-[#e6b32a] text-right whitespace-nowrap">
                      R$ {log.valor_barbearia?.toLocaleString('pt-BR',{minimumFractionDigits:2}) || "0,00"}
                    </td>
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
      </div>
    </AdminLayout>
  );
}