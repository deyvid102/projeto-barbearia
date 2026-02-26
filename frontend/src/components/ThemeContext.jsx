import React, { createContext, useContext, useEffect, useState } from 'react';

// Criamos o contexto
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // Inicialização síncrona: o React lê o localStorage logo no primeiro ciclo de vida
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      // Se não houver nada salvo, o padrão será light (false)
      return saved === 'dark';
    } catch (e) {
      console.error("erro ao ler tema inicial:", e);
      return false;
    }
  });

  // Efeito para manipular a classe no HTML (importante para Tailwind v4)
  useEffect(() => {
    const root = window.document.documentElement;
    
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);

  // Função de alternância com gravação imediata (previne o valor null)
  const toggleTheme = () => {
    setIsDarkMode(prev => {
      const next = !prev;
      localStorage.setItem('theme', next ? 'dark' : 'light');
      return next;
    });
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook personalizado para facilitar o uso nos componentes (Login, Config, etc)
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme deve ser usado dentro de um ThemeProvider');
  }
  return context;
};