// src/pages/PaginaBarbearia.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { api } from '../services/Api.js';
import BarbeariasLayout from '../layout/barbeariasLayout';

export default function PaginaBarbearia() {
  const { nomeBarbearia } = useParams(); // Puxa o 'slug' da URL (ex: vintage-barber)
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
        setData(prev => ({ ...prev, loading: true }));

        // 1. Busca a barbearia pelo NOME (slug) vindo da URL
        const res = await api.get(`/barbearias/perfil/${nomeBarbearia}`);
        const barbeariaDoc = res.data || res;

        if (!barbeariaDoc || !barbeariaDoc._id) {
          throw new Error("Barbearia não encontrada");
        }

        // 2. Busca todos os barbeiros para filtrar os que pertencem a esta barbearia
        const resB = await api.get('/barbeiros');
        const lista = Array.isArray(resB) ? resB : (resB.data || []);
        
        const barbeirosFiltrados = lista.filter(b => {
          const idVinculo = b.fk_barbearia?._id || b.fk_barbearia;
          return String(idVinculo) === String(barbeariaDoc._id);
        });

        // 3. Atualiza o estado com o objeto completo (contendo o layout_key)
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

  // O componente BarbeariasLayout vai decidir entre Padrao ou PremiumRetro
  // baseado no data.barbearia.layout_key
  return (
    <BarbeariasLayout 
      barbearia={data.barbearia} 
      barbeiros={data.barbeiros} 
      loading={data.loading} 
      error={data.error} 
    />
  );
}