import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext';
import SelectProfile from './pages/SelectProfile';

// imports cliente
import LoginCliente from './pages/cliente/LoginCliente';
import RegisterCliente from './pages/cliente/RegisterCliente';
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import NovoAgendamento from './pages/cliente/NovoAgendamento';
import ClienteHistorico from './pages/cliente/ClienteHistorico';
import ClienteConfiguracoes from './pages/cliente/ClienteConfiguracoes';

// imports barbeiro
import LoginBarbeiro from './pages/barbeiro/LoginBarbeiro';
import BarbeiroDashboard from './pages/barbeiro/BarbeiroDashboard';
import BarbeiroHistorico from './pages/barbeiro/BarbeiroHistorico';
import BarbeiroEstatisticas from './pages/barbeiro/BarbeiroEstatisticas';
import BarbeiroConfiguracoes from './pages/barbeiro/BarbeiroConfiguracoes';
import BarbeiroCalendario from './pages/barbeiro/BarbeiroCalendario';

// import admin
import AdministradorDashboard from './pages/admin/AdministradorDashboard';
import BarbeiroGerenciamento from './pages/admin/BarbeiroGerenciamento';
import ValoresGerenciamento from './pages/admin/ValoresGerenciamento';
import AdminLogs from './pages/admin/AdminLogs';
import AdminAnalytics from './pages/admin/AdminAnalytics';
import BarbeariaAgenda from './pages/admin/BarbeariaAgenda';

const ProtectedRegisterRoute = ({ children }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const barbeariaId = params.get('barbearia');
  if (!barbeariaId) return <Navigate to="/cliente/login" replace />;
  return children;
};

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SelectProfile />} />
          
          {/* Rotas de cliente */}
          <Route path="/cliente/login" element={<LoginCliente />} />
          <Route path="/cliente/register" element={<ProtectedRegisterRoute><RegisterCliente /></ProtectedRegisterRoute>} />
          <Route path="/cliente/:id" element={<ClienteDashboard />} />
          <Route path="/cliente/novo-agendamento/:id" element={<NovoAgendamento />} />
          <Route path="/cliente/historico/:id" element={<ClienteHistorico />} />
          <Route path="/cliente/configuracoes/:id" element={<ClienteConfiguracoes />} />
          
          {/* Rotas de barbeiro */}
          <Route path="/barbeiro/login" element={<LoginBarbeiro />} />
          
          {/* Ambas as rotas abaixo carregam o Dashboard para evitar erros de navegação */}
          <Route path="/barbeiro/:id" element={<BarbeiroDashboard />} />
          <Route path="/barbeiro/dashboard/:id" element={<BarbeiroDashboard />} />
          
          <Route path="/barbeiro/historico/:id" element={<BarbeiroHistorico />} />
          <Route path="/barbeiro/estatisticas/:id" element={<BarbeiroEstatisticas />} />
          <Route path="/barbeiro/configuracoes/:id" element={<BarbeiroConfiguracoes />} />
          <Route path="/barbeiro/calendario/:id" element={<BarbeiroCalendario />} />

          {/* Rotas de admin */}
          <Route path="/admin/dashboard/:id" element={<AdministradorDashboard />} />
          <Route path="/admin/barbeiros/:id" element={<BarbeiroGerenciamento />} />
          <Route path="/admin/valores/:id" element={<ValoresGerenciamento />} />
          <Route path="/admin/logs/:id" element={<AdminLogs />} />
          <Route path="/admin/analytics/:id" element={<AdminAnalytics />} />
          <Route path="/admin/agenda/:id" element={<BarbeariaAgenda />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}