// src/pages/PaginaBarbearia.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/Api.js';
import BarbeariasLayout from '../layout/barbeariasLayout';

export default function PaginaBarbearia() {
  const { nomeBarbearia } = useParams();
  const [data, setData] = useState({ 
    barbearia: null, 
    barbeiros: [], 
    loading: true, 
    error: false 
  });

  useEffect(() => {
    async function fetchData() {
      if (!nomeBarbearia) return;
      
      try {
        // Iniciamos o loading
        setData(prev => ({ ...prev, loading: true }));

        // Buscamos os dados da barbearia
        const res = await api.get(`/barbearias/perfil/${nomeBarbearia}`);
        const barbeariaDoc = res.data || res;

        if (!barbeariaDoc || !barbeariaDoc._id) {
          throw new Error("Barbearia não encontrada");
        }

        // Buscamos barbeiros
        const resB = await api.get('/barbeiros');
        const lista = Array.isArray(resB) ? resB : (resB.data || []);
        
        const barbeirosFiltrados = lista.filter(b => {
          const idVinculo = b.fk_barbearia?._id || b.fk_barbearia;
          return String(idVinculo) === String(barbeariaDoc._id);
        });

        setData({ 
          barbearia: barbeariaDoc, 
          barbeiros: barbeirosFiltrados, 
          loading: false, 
          error: false 
        });

      } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
        setData({ 
          barbearia: null, 
          barbeiros: [], 
          loading: false, 
          error: true 
        });
      }
    }

    fetchData();
  }, [nomeBarbearia]);

  // 1. TELA DE CARREGAMENTO (Evita o pulo de layout)
  if (data.loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        {/* Spinner Premium */}
        <div className="relative flex items-center justify-center">
          <div className="w-16 h-16 border-4 border-gray-100 rounded-full" />
          <div className="absolute w-16 h-16 border-4 border-[#e6b32a] border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-[10px] font-black uppercase tracking-[4px] text-gray-400 animate-pulse">
          Carregando Barbearia
        </p>
      </div>
    );
  }

  // 2. TELA DE ERRO
  if (data.error || !data.barbearia) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6 text-center">
        <div>
          <h1 className="text-2xl font-black uppercase italic italic tracking-tighter">Ops!</h1>
          <p className="text-gray-500 text-sm mt-2">Barbearia não encontrada ou erro na conexão.</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-6 px-8 py-3 bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-xl"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  // 3. RENDERIZAÇÃO FINAL (Só acontece quando o layout_key já existe)
  return (
    <BarbeariasLayout 
      barbearia={data.barbearia} 
      barbeiros={data.barbeiros} 
      loading={false} 
      error={false} 
    />
  );
}