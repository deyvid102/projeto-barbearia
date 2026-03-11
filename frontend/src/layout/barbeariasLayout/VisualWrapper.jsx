import React from 'react';

// Estilos globais simplificados para cada tema
const styles = {
  padrao: {
    bg: 'bg-white',
    text: 'text-gray-900',
    accent: '#EAB308',
    font: 'font-sans'
  },
  premium_retro: {
    bg: 'bg-[#f4f1ea]',
    text: 'text-[#1a1a1a]',
    accent: '#C5A059',
    font: 'font-serif'
  }
};

export default function VisualWrapper({ layoutKey, children }) {
  const theme = styles[layoutKey] || styles.padrao;

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${theme.font} transition-colors duration-300`}>
      {/* Aqui você pode injetar variáveis CSS para usar nos componentes filhos */}
      <style>{`
        :root {
          --accent-color: ${theme.accent};
          --bg-barber: ${layoutKey === 'premium_retro' ? '#f4f1ea' : '#ffffff'};
        }
      `}</style>
      {children}
    </div>
  );
}