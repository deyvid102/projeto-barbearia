import React from 'react';
// Importe os arquivos que acabamos de ajustar
import PadraoLayout from './PadraoLayout'; 
import PremiumRetroLayout from './PremiumRetroLayout';

export default function BarbeariasLayout({ barbearia, barbeiros, view = 'home', ...props }) {
  const layouts = {
    "padrao": PadraoLayout,
    "premium_retro": PremiumRetroLayout
  };

  const SelectedLayout = layouts[barbearia?.layout_key] || PadraoLayout;

  return (
    <SelectedLayout 
      barbearia={barbearia} 
      barbeiros={barbeiros} 
      view={view} 
      {...props} 
    />
  );
}