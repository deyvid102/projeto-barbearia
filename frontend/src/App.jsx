import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ThemeProvider } from './components/ThemeContext'; // Importe o Provedor
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
import RegisterBarbeiro from './pages/barbeiro/RegisterBarbeiro';
import BarbeiroDashboard from './pages/barbeiro/BarbeiroDashboard';
import BarbeiroHistorico from './pages/barbeiro/BarbeiroHistorico';
import BarbeiroEstatisticas from './pages/barbeiro/BarbeiroEstatisticas';
import BarbeiroConfiguracoes from './pages/barbeiro/BarbeiroConfiguracoes';
import BarbeiroCalendario from './pages/barbeiro/BarbeiroCalendario';

// import admin
import AdministradorDashboard from './pages/admin/AdministradorDashboard';
import BarbeiroGerenciamento from './pages/admin/BarbeiroGerenciamento';
import ValoresGerenciamento from './pages/admin/ValoresGerenciamento';

// componente para proteger o registro
const ProtectedRegisterRoute = ({ children }) => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const barbeariaId = params.get('barbearia');

  if (!barbeariaId) {
    return <Navigate to="/cliente/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    /* O ThemeProvider deve envolver tudo para que o contexto funcione */
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<SelectProfile />} />
          
          {/* rotas de cliente */}
          <Route path="/cliente/login" element={<LoginCliente />} />
          <Route 
            path="/cliente/register" 
            element={
              <ProtectedRegisterRoute>
                <RegisterCliente />
              </ProtectedRegisterRoute>
            } 
          />
          <Route path="/cliente/:id" element={<ClienteDashboard />} />
          <Route path="/cliente/novo-agendamento/:id" element={<NovoAgendamento />} />
          <Route path="/cliente/historico/:id" element={<ClienteHistorico />} />
          <Route path="/cliente/configuracoes/:id" element={<ClienteConfiguracoes />} />
          
          {/* rotas de barbeiro */}
          <Route path="/barbeiro/login" element={<LoginBarbeiro />} />
          <Route path="/barbeiro/register" element={<RegisterBarbeiro />} />
          <Route path="/barbeiro/:id" element={<BarbeiroDashboard />} />
          <Route path="/barbeiro/historico/:id" element={<BarbeiroHistorico />} />
          <Route path="/barbeiro/estatisticas/:id" element={<BarbeiroEstatisticas />} />
          <Route path="/barbeiro/configuracoes/:id" element={<BarbeiroConfiguracoes />} />
          <Route path="/barbeiro/calendario/:id" element={<BarbeiroCalendario />} />

          {/* rotas de admin */}
          <Route path="/admin/dashboard/:id" element={<AdministradorDashboard />} />
          <Route path="/admin/barbeiros/:id" element={<BarbeiroGerenciamento />} />
          <Route path="/admin/valores/:id" element={<ValoresGerenciamento />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}