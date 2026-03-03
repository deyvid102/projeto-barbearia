import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../../services/Api.js'; 
import { useTheme } from '../../components/ThemeContext';
import AdminLayout from '../../layout/layout';
import { 
  IoPersonOutline, IoTimeOutline, IoAlertCircleOutline, 
  IoArrowBackOutline, IoSearchOutline 
} from 'react-icons/io5';

export default function AdminLogs() {
  const { id } = useParams(); 
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      
      // 1. SCAN DO USER DATA
      const storageUser = localStorage.getItem('user');
      const userData = JSON.parse(storageUser || '{}');
      
      console.log("--- DEBUG USER DATA ---");
      console.log("Dados do LocalStorage:", userData);

      // 2. TENTAR ENCONTRAR O ID DA BARBEARIA NO OBJETO
      // Tentamos vários nomes comuns: fk_barbearia, barbeariaId, id_barbearia
      const barbeariaIDEncontrado = 
        (userData.fk_barbearia?._id || userData.fk_barbearia) || 
        userData.barbeariaId || 
        userData.id_barbearia;

      // 3. DEFINIR ID DE BUSCA
      // Se o ID da URL for o do usuário, e achamos o da barbearia, trocamos.
      let idParaBusca = id;
      
      if (barbeariaIDEncontrado && id === userData._id) {
        idParaBusca = barbeariaIDEncontrado;
        console.log("⚠️ Trocando ID de busca para a BARBEARIA:", idParaBusca);
      } else {
        console.log("ℹ️ Mantendo ID da URL para busca:", idParaBusca);
      }

      const response = await api.get(`/logs/barbearia/${idParaBusca}`);
      
      setLogs(Array.isArray(response) ? response : []);

    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const formatarData = (dataStr) => {
    if (!dataStr) return '--/--';
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
      <div className="p-4 md:p-8 flex flex-col h-full">
        <header className="mb-8 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black italic lowercase tracking-tighter">
              logs.<span className="text-[#e6b32a]">atividades</span>
            </h1>
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[2px]">Histórico de Auditoria</p>
          </div>
          <button 
            onClick={() => navigate(-1)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
              isDarkMode ? 'bg-white/5 hover:bg-white/10 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
            }`}
          >
            <IoArrowBackOutline size={14}/> Voltar
          </button>
        </header>

        <div className={`flex-1 rounded-[2.5rem] border overflow-hidden ${
          isDarkMode ? 'bg-[#111] border-white/5' : 'bg-white border-slate-200 shadow-2xl'
        }`}>
          <div className="overflow-x-auto h-[calc(100vh-280px)] custom-scrollbar">
            <table className="w-full border-collapse">
              <thead>
                <tr className={`text-left ${isDarkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Data</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Cliente</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500 text-center">Ação</th>
                  <th className="p-5 text-[10px] font-black uppercase tracking-widest text-gray-500">Responsável</th>
                </tr>
              </thead>
              <tbody>
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <tr key={log._id} className={`border-b transition-colors ${
                      isDarkMode ? 'border-white/5 hover:bg-white/[0.02]' : 'border-slate-100 hover:bg-slate-50'
                    }`}>
                      <td className="p-5 text-[11px] font-bold text-gray-400">
                        {formatarData(log.data_log || log.createdAt)}
                      </td>
                      <td className="p-5">
                        <span className="text-xs font-black uppercase text-[#e6b32a]">
                          {log.fk_cliente?.nome || 'Cliente'}
                        </span>
                      </td>
                      <td className="p-5 text-center">
                        <span className={`px-3 py-1 rounded-md text-[9px] font-black ${
                          log.status_acao === 'C' ? 'bg-red-500/10 text-red-500' : 
                          log.status_acao === 'F' ? 'bg-emerald-500/10 text-emerald-500' : 
                          'bg-blue-500/10 text-blue-500'
                        }`}>
                          {log.status_acao === 'A' ? 'AGENDADO' : 
                           log.status_acao === 'C' ? 'CANCELADO' : 'FINALIZADO'}
                        </span>
                      </td>
                      <td className="p-5">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase opacity-60">
                          <IoPersonOutline size={12} className="text-[#e6b32a]" />
                          {log.canceladoPor || log.finalizadoPor || log.fk_barbeiro?.nome || 'Sistema'}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="p-24 text-center">
                      <IoSearchOutline size={40} className="mx-auto text-gray-700 mb-4" />
                      <p className="text-gray-500 font-bold italic">Nenhum log encontrado para este ID.</p>
                      <p className="text-[10px] uppercase text-gray-600 mt-1">ID pesquisado: {id}</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}