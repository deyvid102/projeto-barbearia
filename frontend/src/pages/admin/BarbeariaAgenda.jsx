import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../../services/Api.js';
import { useTheme } from '../../components/ThemeContext';
import CustomAlert from '../../components/CustomAlert';
import SelectPersonalizado from '../../components/SelectPersonalizado';

import { 
  IoSaveOutline,
  IoCalendarOutline,
  IoMoonOutline,
  IoSunnyOutline
} from 'react-icons/io5';

export default function BarbeariaAgendaSemanal() {
  const { id } = useParams(); // ID da BARBEARIA
  const { isDarkMode } = useTheme();
  
  const [barbeiros, setBarbeiros] = useState([]);
  const [barbeiroSelecionado, setBarbeiroSelecionado] = useState('');
  const [grade, setGrade] = useState([]);
  const [loading, setLoading] = useState(false);
  const [alertConfig, setAlertConfig] = useState({ show: false, title: '', message: '', type: 'error' });

  const diasSemanaRef = useMemo(() => [
    { label: 'Domingo', valor: 0 },
    { label: 'Segunda', valor: 1 },
    { label: 'Terça', valor: 2 },
    { label: 'Quarta', valor: 3 },
    { label: 'Quinta', valor: 4 },
    { label: 'Sexta', valor: 5 },
    { label: 'Sábado', valor: 6 }
  ], []);

  // 1. BUSCAR TODOS OS BARBEIROS VINCULADOS
  const carregarBarbeiros = useCallback(async () => {
    if (!id) return;
    try {
      const res = await api.get(`/barbearias/${id}/barbeiros`);
      setBarbeiros(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error("❌ Erro ao listar barbeiros:", err);
      setBarbeiros([]);
    }
  }, [id]);

  useEffect(() => { carregarBarbeiros(); }, [carregarBarbeiros]);

  // 2. BUSCAR AGENDA OU GERAR VAZIA
  const carregarGrade = useCallback(async () => {
    // Se "Todos" estiver selecionado, apenas geramos uma grade padrão para edição
    if (barbeiroSelecionado === 'todos') {
      gerarGradeVazia();
      return;
    }

    if (!barbeiroSelecionado) return;

    setLoading(true);
    try {
      const response = await api.get(`/agendas/barbeiro/${barbeiroSelecionado}`);
      
      if (response && response.grade && response.grade.length > 0) {
        const gradeMontada = diasSemanaRef.map(dia => {
            const salvo = response.grade.find(s => s.dia_semana === dia.valor);
            return salvo ? {
                ...salvo,
                intervalo_inicio: salvo.intervalos?.[0]?.inicio || "12:00",
                intervalo_fim: salvo.intervalos?.[0]?.fim || "13:00"
            } : {
                dia_semana: dia.valor,
                nome_dia: dia.label,
                status: 'fechado',
                abertura: "08:00",
                fechamento: "19:00",
                tem_intervalo: false,
                intervalo_inicio: "12:00",
                intervalo_fim: "13:00"
            };
        });
        setGrade(gradeMontada);
      } else {
        gerarGradeVazia();
      }
    } catch (err) {
      gerarGradeVazia();
    } finally {
      setLoading(false);
    }
  }, [barbeiroSelecionado, diasSemanaRef]);

  const gerarGradeVazia = () => {
    setGrade(diasSemanaRef.map(dia => ({
        dia_semana: dia.valor,
        nome_dia: dia.label,
        status: 'fechado',
        abertura: "08:00",
        fechamento: "19:00",
        tem_intervalo: false,
        intervalo_inicio: "12:00",
        intervalo_fim: "13:00"
    })));
  };

  useEffect(() => { carregarGrade(); }, [carregarGrade]);

  const handleUpdateDia = (index, campo, valor) => {
    setGrade(prev => {
      const novaGrade = [...prev];
      novaGrade[index] = { ...novaGrade[index], [campo]: valor };
      return novaGrade;
    });
  };

  const salvarEscala = async () => {
    if (!barbeiroSelecionado || !id) {
      setAlertConfig({ show: true, title: 'Atenção', message: 'Selecione um profissional ou "Todos" antes de salvar.', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const gradeFormatada = grade.map(dia => ({
        dia_semana: Number(dia.dia_semana),
        nome_dia: dia.nome_dia,
        status: dia.status,
        abertura: dia.abertura,
        fechamento: dia.fechamento,
        tem_intervalo: Boolean(dia.tem_intervalo),
        intervalos: dia.tem_intervalo ? [{
          inicio: dia.intervalo_inicio,
          fim: dia.intervalo_fim
        }] : []
      }));

      // LÓGICA PARA TODOS OS BARBEIROS
      if (barbeiroSelecionado === 'todos') {
        const promises = barbeiros.map(b => {
          const payload = {
            fk_barbearia: id,
            fk_barbeiro: b._id,
            grade: gradeFormatada
          };
          return api.post('/agendas', payload);
        });

        await Promise.all(promises);
        setAlertConfig({ show: true, title: 'Sucesso', message: 'Agenda de TODOS os profissionais atualizada!', type: 'success' });
      } else {
        // LÓGICA PARA UM BARBEIRO INDIVIDUAL
        const payload = {
          fk_barbearia: id,
          fk_barbeiro: barbeiroSelecionado,
          grade: gradeFormatada
        };
        await api.post('/agendas', payload);
        setAlertConfig({ show: true, title: 'Sucesso', message: 'Agenda do profissional atualizada!', type: 'success' });
      }
    } catch (err) {
      setAlertConfig({ 
        show: true, 
        title: 'Erro ao Salvar', 
        message: err.response?.data?.error || 'Erro ao comunicar com o servidor.', 
        type: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Prepara as opções do Select incluindo a opção "Todos"
  const optionsBarbeiros = useMemo(() => {
    const lista = barbeiros.map(b => ({ label: b.nome, value: b._id }));
    return [{ label: 'Todos os barbeiros', value: 'todos' }, ...lista];
  }, [barbeiros]);

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 pb-24">
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md">
          <div className="w-12 h-12 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {alertConfig.show && (
        <CustomAlert {...alertConfig} onClose={() => setAlertConfig({ ...alertConfig, show: false })} />
      )}

      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black italic lowercase tracking-tighter">
            escala.<span className="text-[#e6b32a]">semanal</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-[3px] opacity-30 mt-2 ml-1">
            Defina os horários de atendimento {barbeiroSelecionado === 'todos' ? 'geral da unidade' : 'do profissional'}
          </p>
        </div>

        <SelectPersonalizado 
          label="Selecionar Barbeiro"
          value={barbeiroSelecionado}
          onChange={setBarbeiroSelecionado}
          options={optionsBarbeiros}
          isDarkMode={isDarkMode}
        />
      </header>

      <main className={`p-6 md:p-10 rounded-[3rem] border ${isDarkMode ? 'bg-[#0d0d0d] border-white/5' : 'bg-white border-slate-100'}`}>
        {!barbeiroSelecionado ? (
          <div className="py-20 text-center opacity-20">
             <IoCalendarOutline size={48} className="mx-auto mb-4" />
             <p className="font-black uppercase text-xs tracking-widest">Escolha um profissional ou a opção geral</p>
          </div>
        ) : (
          <div className="space-y-4">
            {barbeiroSelecionado === 'todos' && (
              <div className="mb-6 p-4 rounded-2xl bg-[#e6b32a]/10 border border-[#e6b32a]/20 text-center">
                <p className="text-[10px] font-black uppercase text-[#e6b32a] tracking-widest">
                  ⚠️ Atenção: As alterações abaixo serão aplicadas a todos os {barbeiros.length} barbeiros.
                </p>
              </div>
            )}
            
            {grade.map((dia, index) => {
              const isActive = dia.status === 'ativo';
              return (
                <div 
                  key={dia.dia_semana} 
                  className={`flex flex-wrap items-center justify-between gap-4 p-6 rounded-[2rem] border transition-all ${
                    isActive 
                      ? (isDarkMode ? 'bg-white/5 border-white/5' : 'bg-slate-50 border-slate-200') 
                      : 'opacity-30 grayscale border-dashed border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-6 min-w-[200px]">
                    <div 
                      onClick={() => handleUpdateDia(index, 'status', isActive ? 'fechado' : 'ativo')}
                      className={`w-14 h-7 rounded-full relative cursor-pointer transition-all ${isActive ? 'bg-[#e6b32a]' : 'bg-gray-600'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all ${isActive ? 'left-8' : 'left-1'}`} />
                    </div>
                    <span className="font-black text-lg lowercase tracking-tighter">
                      {dia.nome_dia}
                    </span>
                  </div>

                  {isActive && (
                    <div className="flex flex-1 flex-wrap items-center gap-8">
                      <div className="flex items-center gap-3 bg-black/10 p-2 px-4 rounded-xl border border-white/5">
                        <IoSunnyOutline className="text-[#e6b32a]" />
                        <input 
                          type="time" 
                          value={dia.abertura} 
                          onChange={(e) => handleUpdateDia(index, 'abertura', e.target.value)}
                          className="bg-transparent font-bold text-sm outline-none text-[#e6b32a]"
                        />
                        <span className="text-[10px] font-black opacity-30">ATÉ</span>
                        <input 
                          type="time" 
                          value={dia.fechamento} 
                          onChange={(e) => handleUpdateDia(index, 'fechamento', e.target.value)}
                          className="bg-transparent font-bold text-sm outline-none text-[#e6b32a]"
                        />
                      </div>

                      <div className="flex items-center gap-4">
                         <label className="flex items-center gap-3 cursor-pointer group">
                            <input 
                              type="checkbox" 
                              checked={dia.tem_intervalo} 
                              onChange={(e) => handleUpdateDia(index, 'tem_intervalo', e.target.checked)}
                              className="hidden"
                            />
                            <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${dia.tem_intervalo ? 'bg-[#e6b32a] border-[#e6b32a]' : 'border-white/20'}`}>
                                {dia.tem_intervalo && <div className="w-2 h-2 bg-black rounded-full" />}
                            </div>
                            <span className="text-[10px] font-black uppercase opacity-50 group-hover:opacity-100 transition-opacity">Intervalo</span>
                         </label>

                         {dia.tem_intervalo && (
                           <div className="flex items-center gap-2 bg-black/5 p-2 px-4 rounded-xl">
                              <IoMoonOutline className="opacity-30" size={12}/>
                              <input 
                                type="time" 
                                value={dia.intervalo_inicio} 
                                onChange={(e) => handleUpdateDia(index, 'intervalo_inicio', e.target.value)}
                                className="bg-transparent font-bold text-xs outline-none"
                              />
                              <span className="opacity-20">/</span>
                              <input 
                                type="time" 
                                value={dia.intervalo_fim} 
                                onChange={(e) => handleUpdateDia(index, 'intervalo_fim', e.target.value)}
                                className="bg-transparent font-bold text-xs outline-none"
                              />
                           </div>
                         )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            <button 
              onClick={salvarEscala}
              className="w-full mt-10 py-6 bg-[#e6b32a] text-black rounded-[2rem] font-black text-sm uppercase tracking-[4px] shadow-2xl hover:brightness-110 active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <IoSaveOutline size={20}/> 
              {barbeiroSelecionado === 'todos' ? 'Aplicar em todos os profissionais' : 'Salvar Agenda Semanal'}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}