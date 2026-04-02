import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import { ThemeProvider } from './components/ThemeContext';

// Landing Page Principal
import PaginaBarbearia from './pages/PaginaBarbearia';

// Cliente
import NovoAgendamento from './pages/cliente/NovoAgendamento';

// Barbeiro
import LoginBarbeiro from './pages/barbeiro/LoginBarbeiro';
import BarbeiroDashboard from './pages/barbeiro/BarbeiroDashboard';
import BarbeiroHistorico from './pages/barbeiro/BarbeiroHistorico';
import BarbeiroEstatisticas from './pages/barbeiro/BarbeiroEstatisticas';
import BarbeiroConfiguracoes from './pages/barbeiro/BarbeiroConfiguracoes';
import BarbeiroCalendario from './pages/barbeiro/BarbeiroCalendario';

// Admin
import AdminLayout from './layout/AdminLayout';
import AdministradorDashboard from './pages/admin/AdminDashboard';
import GestaoUnificada from './pages/admin/Gestao';
import BarbeiroGerenciamento from './pages/admin/BarbeiroGerenciamento';
import ValoresGerenciamento from './pages/admin/ValoresGerenciamento';
import AdminLogs from './pages/admin/AdminLogs';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import BarbeariaAgenda from './pages/admin/BarbeariaAgenda';
import Personalizacao from './pages/admin/Personalizacao'; // Importação da nova página

// Componente para Log de Rotas (Debug)
function RouteLogger() {
  const location = useLocation();
  useEffect(() => {
    console.log(`[BarberFlow] Navegou para: ${location.pathname}`);
  }, [location]);
  return null;
}

const RootRedirect = () => {
  const defaultBarbeariaNome = "barbermax"; 
  console.log(`[BarberFlow] Redirecionando raiz para /${defaultBarbeariaNome}`);
  return <Navigate to={`/${defaultBarbeariaNome}`} replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <RouteLogger />
        <Routes>
          {/* 1. ROTAS FIXAS */}
          
          {/* --- AREA DO BARBEIRO --- */}
          <Route path="/barbeiro/login/:nomeBarbearia" element={<LoginBarbeiro />} />
          <Route path="/barbeiro/dashboard/:id" element={<BarbeiroDashboard />} />
          <Route path="/barbeiro/historico/:id" element={<BarbeiroHistorico />} />
          <Route path="/barbeiro/estatisticas/:id" element={<BarbeiroEstatisticas />} />
          <Route path="/barbeiro/configuracoes/:id" element={<BarbeiroConfiguracoes />} />
          <Route path="/barbeiro/calendario/:id" element={<BarbeiroCalendario />} />
          <Route path="/barbeiro/:id" element={<BarbeiroDashboard />} />

          {/* --- AREA DO ADMIN --- */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="/admin/dashboard/:id" element={<AdministradorDashboard />} />
            <Route path="/admin/barbeiros/:id" element={<BarbeiroGerenciamento />} />
            <Route path="/admin/valores/:id" element={<ValoresGerenciamento />} />
            <Route path="/admin/gestao/:id" element={<GestaoUnificada />} />
            <Route path="/admin/logs/:id" element={<AdminLogs />} />
            <Route path="/admin/analytics/:id" element={<AdminAnalytics />} />
            <Route path="/admin/agenda/:id" element={<BarbeariaAgenda />} />
            <Route path="/admin/personalizacao/:id" element={<Personalizacao />} /> 
          </Route>

          {/* --- AGENDAMENTO PÚBLICO --- */}
          <Route path="/agendar/:nomeBarbearia" element={<NovoAgendamento />} />
          <Route path="/cliente/novo-agendamento/:id" element={<NovoAgendamento />} />

          {/* 2. ROTAS DINÂMICAS */}
          <Route path="/:nomeBarbearia" element={<PaginaBarbearia />} />

          {/* 3. REDIRECIONAMENTOS E ERROS */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}