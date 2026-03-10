import React from 'react';
import PadraoLayout from './PadraoLayout';
import PremiumRetroLayout from './PremiumRetroLayout';

const layoutsDisponiveis = {
  "padrao": PadraoLayout,
  "premium_retro": PremiumRetroLayout // Chave exata do seu JSON de teste
};

export default function BarbeariasLayout({ barbearia, barbeiros, loading, error }) {
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
       <div className="w-10 h-10 border-4 border-[#EAB308] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !barbearia) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white p-6 text-center">
      <h1 className="text-4xl font-black italic mb-4">404.</h1>
      <p className="text-gray-400">Barbearia não encontrada.</p>
    </div>
  );

  // Seleção dinâmica baseada no layout_key do banco
  const SelectedLayout = layoutsDisponiveis[barbearia.layout_key] || PadraoLayout;

  return <SelectedLayout barbearia={barbearia} barbeiros={barbeiros} />;
}