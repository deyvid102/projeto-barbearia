import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';

// Landing Page Principal
import PaginaBarbearia from './pages/PaginaBarbearia';

// Único import de cliente mantido (Agendamento sem login)
import NovoAgendamento from './pages/cliente/NovoAgendamento';

// Imports barbeiro
import LoginBarbeiro from './pages/barbeiro/LoginBarbeiro';
import BarbeiroDashboard from './pages/barbeiro/BarbeiroDashboard';
import BarbeiroHistorico from './pages/barbeiro/BarbeiroHistorico';
import BarbeiroEstatisticas from './pages/barbeiro/BarbeiroEstatisticas';
import BarbeiroConfiguracoes from './pages/barbeiro/BarbeiroConfiguracoes';
import BarbeiroCalendario from './pages/barbeiro/BarbeiroCalendario';

// Import admin
import AdministradorDashboard from './pages/admin/AdministradorDashboard';
import BarbeiroGerenciamento from './pages/admin/BarbeiroGerenciamento';
import ValoresGerenciamento from './pages/admin/ValoresGerenciamento';
import AdminLogs from './pages/admin/AdminLogs';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import BarbeariaAgenda from './pages/admin/BarbeariaAgenda';

/**
 * Redirecionamento da raiz "/" para o nome amigável da barbearia.
 */
const RootRedirect = () => {
  // Nome padrão para testes/acesso inicial
  const defaultBarbeariaNome = "barbeariaadmin"; 
  return <Navigate to={`/${defaultBarbeariaNome}`} replace />;
};

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* --- ROTAS DE AGENDAMENTO (PÚBLICAS) --- */}
          {/* O parâmetro :nomeBarbearia é essencial para buscar os dados na API */}
          <Route path="/agendar/:nomeBarbearia" element={<NovoAgendamento />} />
          
          {/* Rota legada mantida para evitar quebras de links antigos */}
          <Route path="/cliente/novo-agendamento/:id" element={<NovoAgendamento />} />

          {/* --- ROTAS BARBEIRO --- */}
          <Route path="/barbeiro/login" element={<LoginBarbeiro />} />
          <Route path="/barbeiro/dashboard/:id" element={<BarbeiroDashboard />} />
          <Route path="/barbeiro/historico/:id" element={<BarbeiroHistorico />} />
          <Route path="/barbeiro/estatisticas/:id" element={<BarbeiroEstatisticas />} />
          <Route path="/barbeiro/configuracoes/:id" element={<BarbeiroConfiguracoes />} />
          <Route path="/barbeiro/calendario/:id" element={<BarbeiroCalendario />} />
          <Route path="/barbeiro/:id" element={<BarbeiroDashboard />} />

          {/* --- ROTAS ADMINISTRAÇÃO --- */}
          <Route path="/admin/dashboard/:id" element={<AdministradorDashboard />} />
          <Route path="/admin/barbeiros/:id" element={<BarbeiroGerenciamento />} />
          <Route path="/admin/valores/:id" element={<ValoresGerenciamento />} />
          <Route path="/admin/logs/:id" element={<AdminLogs />} />
          <Route path="/admin/analytics/:id" element={<AdminAnalytics />} />
          <Route path="/admin/agenda/:id" element={<BarbeariaAgenda />} />

          {/* --- VITRINE DA BARBEARIA --- */}
          {/* Captura o nome da URL (ex: /barbeariaadmin) */}
          <Route path="/:nomeBarbearia" element={<PaginaBarbearia />} />

          {/* --- REDIRECIONAMENTOS --- */}
          <Route path="/" element={<RootRedirect />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}