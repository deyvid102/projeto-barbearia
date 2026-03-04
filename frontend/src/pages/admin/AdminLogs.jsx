import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js'; 
import { useTheme } from '../../components/ThemeContext';
import AdminLayout from '../../layout/layout';
import SelectPersonalizado from '../../components/SelectPersonalizado';
import Pagination from '../../components/Pagination'; 
import { 
  IoSearchOutline, IoPrintOutline 
} from 'react-icons/io5';

export default function AdminLogs() {
  const { id } = useParams(); 
  const { isDarkMode } = useTheme();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [nomeBarbearia, setNomeBarbearia] = useState('Barbearia');

  // Estados dos Filtros
  const [periodo, setPeriodo] = useState('TODOS');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');
  const [filtroStatus, setFiltroStatus] = useState('TODOS');
  const [filtroBarbeiro, setFiltroBarbeiro] = useState('TODOS');

  // Estados de Paginação
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const storageUser = localStorage.getItem('user');
      const userData = JSON.parse(storageUser || '{}');
      let idBarbeariaFinal = userData.fk_barbearia?._id || userData.fk_barbearia;

      if (!idBarbeariaFinal && id) {
        const resBarbeiro = await api.get(`/barbeiros/${id}/barbearia`);
        idBarbeariaFinal = resBarbeiro.fk_barbearia;
      }

      if (idBarbeariaFinal) {
        const response = await api.get(`/logs/barbearia/${idBarbeariaFinal}`);
        const logsData = Array.isArray(response) ? response : response.data || [];
        
        const logsFiltradosBase = logsData.filter(
          log => log.status_acao === 'F' || log.status_acao === 'C'
        );
        
        setLogs(logsFiltradosBase);

        // BUSCA O NOME DA BARBEARIA PELO fk_barbearia
        const logComEmpresa = logsFiltradosBase.find(l => l.fk_barbearia);
        if (logComEmpresa && typeof logComEmpresa.fk_barbearia === 'object') {
          const empresa = logComEmpresa.fk_barbearia;
          setNomeBarbearia(empresa.nome_fantasia || empresa.nome || 'Barbearia');
        } else {
          setNomeBarbearia(userData.fk_barbearia?.nome_fantasia || userData.fk_barbearia?.nome || 'Barbearia');
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

  const labelPeriodoPDF = useMemo(() => {
    if (periodo === 'INTERVALO') {
      const format = (d) => d ? new Date(d + 'T12:00:00').toLocaleDateString('pt-BR') : '...';
      return `Período: ${format(dataInicio)} até ${format(dataFim)}`;
    }
    const labels = { 'DIARIO': 'Hoje', 'MENSAL': 'Este Mês', 'ANUAL': 'Este Ano', 'TODOS': 'Todo o Histórico' };
    return `Período: ${labels[periodo] || periodo}`;
  }, [periodo, dataInicio, dataFim]);

  const logsFiltradosTotal = useMemo(() => {
    const hoje = new Date();
    return logs.filter(log => {
      const dataLog = new Date(log.data_log || log.createdAt);
      let matchPeriodo = true;
      
      if (periodo === 'DIARIO') {
        matchPeriodo = dataLog.toDateString() === hoje.toDateString();
      } else if (periodo === 'MENSAL') {
        matchPeriodo = dataLog.getMonth() === hoje.getMonth() && dataLog.getFullYear() === hoje.getFullYear();
      } else if (periodo === 'ANUAL') {
        matchPeriodo = dataLog.getFullYear() === hoje.getFullYear();
      } else if (periodo === 'INTERVALO') {
        const inicio = dataInicio ? new Date(dataInicio + 'T00:00:00') : null;
        const fim = dataFim ? new Date(dataFim + 'T23:59:59') : null;
        matchPeriodo = (!inicio || dataLog >= inicio) && (!fim || dataLog <= fim);
      }

      const matchStatus = filtroStatus === 'TODOS' || log.status_acao === filtroStatus;
      const matchBarbeiro = filtroBarbeiro === 'TODOS' || log.fk_barbeiro?.nome === filtroBarbeiro;

      return matchPeriodo && matchStatus && matchBarbeiro;
    });
  }, [logs, periodo, dataInicio, dataFim, filtroStatus, filtroBarbeiro]);

  const logsPaginados = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return logsFiltradosTotal.slice(startIndex, startIndex + itemsPerPage);
  }, [logsFiltradosTotal, currentPage]);

  const totalPages = Math.ceil(logsFiltradosTotal.length / itemsPerPage);

  useEffect(() => { setCurrentPage(1); }, [periodo, filtroStatus, filtroBarbeiro, dataInicio, dataFim]);

  const listaBarbeiros = useMemo(() => {
    const nomes = logs.map(l => l.fk_barbeiro?.nome).filter(Boolean);
    return [...new Set(nomes)].map(n => ({ label: n, value: n }));
  }, [logs]);

  const formatarDataHora = (dataStr) => {
    if (!dataStr) return '--/-- --:--';
    const d = new Date(dataStr);
    return d.toLocaleDateString('pt-BR') + ' ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) return (
    <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-[#0a0a0a]' : 'bg-white'}`}>
      <div className="w-10 h-10 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <AdminLayout>
      <div className="p-4 md:p-8 flex flex-col h-full print:block print:bg-white print:p-0">
        
        {/* CABEÇALHO TELA */}
        <header className="mb-8 flex justify-between items-end print:hidden">
          <div>
            <h1 className="text-2xl font-black italic lowercase tracking-tighter">
              logs.<span className="text-[#e6b32a]">atividades</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[2px]">Relatório de Auditoria</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest bg-[#e6b32a] text-black hover:scale-105 transition-all shadow-lg shadow-[#e6b32a]/20">
              <IoPrintOutline size={14}/> Gerar PDF
            </button>
          </div>
        </header>

        {/* --- CABEÇALHO EXCLUSIVO PARA O PDF --- */}
        <div className="hidden print:block mb-8 border-b-2 border-black pb-4">
          <h1 className="text-2xl font-black uppercase tracking-tighter text-black">Relatório de Auditoria (Logs)</h1>
          <div className="mt-4 grid grid-cols-2 gap-4 text-[10pt] font-bold uppercase text-black">
            <p>Barbearia: <span className="font-normal">{nomeBarbearia}</span></p>
            <p className="text-right">{new Date().toLocaleDateString('pt-BR')} às {new Date().toLocaleTimeString('pt-BR')}</p>
            <p className="text-black">{labelPeriodoPDF}</p>
            <p className="text-right">Total de Registros: {logsFiltradosTotal.length}</p>
            <p>Filtro Status: <span className="font-normal">{filtroStatus === 'TODOS' ? 'Todos' : (filtroStatus === 'F' ? 'Finalizados' : 'Cancelados')}</span></p>
            <p className="text-right">Profissional: <span className="font-normal">{filtroBarbeiro}</span></p>
          </div>
        </div>

        {/* Filtros TELA */}
        <div className={`mb-6 p-6 rounded-[2rem] border flex flex-wrap gap-4 items-end print:hidden ${isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200'}`}>
          <div className="flex-1 min-w-[200px]">
            <SelectPersonalizado 
              label="Período" 
              value={periodo} 
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
            <div className="flex gap-2 flex-1 min-w-[240px]">
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[9px] font-black uppercase text-gray-500 ml-1">Início</span>
                <input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} className={`text-[10px] font-bold p-3 rounded-xl bg-transparent border h-[46px] outline-none focus:border-[#e6b32a] ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-300 text-slate-700'}`} />
              </div>
              <div className="flex flex-col gap-1 flex-1">
                <span className="text-[9px] font-black uppercase text-gray-500 ml-1">Fim</span>
                <input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} className={`text-[10px] font-bold p-3 rounded-xl bg-transparent border h-[46px] outline-none focus:border-[#e6b32a] ${isDarkMode ? 'border-white/10 text-white' : 'border-slate-300 text-slate-700'}`} />
              </div>
            </div>
          )}

          <div className="flex-1 min-w-[150px]">
            <SelectPersonalizado 
              label="Status" 
              value={filtroStatus} 
              onChange={(e) => setFiltroStatus(e.target?.value || e)}
              options={[
                { label: 'Todos', value: 'TODOS' },
                { label: 'Finalizados', value: 'F' },
                { label: 'Cancelados', value: 'C' },
              ]}
            />
          </div>

          <div className="flex-1 min-w-[150px]">
            <SelectPersonalizado 
              label="Profissional" 
              value={filtroBarbeiro} 
              onChange={(e) => setFiltroBarbeiro(e.target?.value || e)}
              options={[{ label: 'Todos', value: 'TODOS' }, ...listaBarbeiros]}
            />
          </div>
        </div>

        {/* Tabela */}
        <div id="pdf-table-area" className={`flex-1 rounded-[2.5rem] border overflow-hidden print:border-none print:m-0 print:bg-white ${isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-2xl'}`}>
          <div className="overflow-x-auto print:overflow-visible min-h-[400px]">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`${isDarkMode ? 'bg-white/5' : 'bg-slate-50'} print:bg-white print:border-b-2 print:border-black`}>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-500 text-left print:text-black">Realizado em</th>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-500 text-left print:text-black">Agendamento</th>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-500 text-left print:text-black">Cliente</th>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-500 text-center print:text-black">Status</th>
                  <th className="p-5 text-[10px] font-black uppercase text-gray-500 text-left print:text-black">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {(typeof window !== 'undefined' && window.matchMedia('print').matches ? logsFiltradosTotal : logsPaginados).map((log) => (
                  <tr key={log._id} className="border-b border-white/5 print:border-slate-300 print:bg-white">
                    <td className="p-5 text-[11px] font-bold text-gray-400 print:text-black">{formatarDataHora(log.data_log || log.createdAt)}</td>
                    <td className="p-5 text-[11px] font-black text-[#e6b32a] print:text-black">{formatarDataHora(log.fk_agendamento?.datahora)}</td>
                    <td className="p-5 text-xs font-black uppercase print:text-black">{log.fk_cliente?.nome || 'Cliente'}</td>
                    <td className="p-5 text-center">
                      <span className={`text-[9px] font-black ${log.status_acao === 'C' ? 'text-red-500' : 'text-emerald-500'} print:text-black print:font-bold`}>
                        {log.status_acao === 'C' ? 'CANCELADO' : 'FINALIZADO'}
                      </span>
                    </td>
                    <td className="p-5 text-xs font-bold uppercase print:text-black">
                      {log.status_acao === 'C' && log.canceladoPor === 'Cliente' ? 'O CLIENTE' : (log.fk_barbeiro?.nome || 'SISTEMA')}
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
      </div>

      <style>{`
        @media print {
          @page { size: A4; margin: 10mm; }
          
          /* Forçar cores claras no PDF ignorando o Dark Mode da UI */
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
          
          /* Força o navegador a imprimir cores de fundo e sombras */
          * { 
            -webkit-print-color-adjust: exact !important; 
            color-adjust: exact !important; 
            print-color-adjust: exact !important;
          }

          /* Ajuste de contraste para textos que eram dourados ou cinzas na tela */
          .text-gray-400, .text-[#e6b32a], .text-emerald-500, .text-red-500 {
            color: black !important;
          }
        }
      `}</style>
    </AdminLayout>
  );
}