import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectProfile from './pages/SelectProfile';

// imports cliente
import LoginCliente from './pages/cliente/LoginCliente';
import RegisterCliente from './pages/cliente/RegisterCliente';
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import NovoAgendamento from './pages/cliente/NovoAgendamento';
import ClienteHistorico from './pages/cliente/ClienteHistorico';
import ClienteConfiguracoes from './pages/cliente/ClienteConfiguracoes'; // NOVO IMPORT

// imports barbeiro
import LoginBarbeiro from './pages/barbeiro/LoginBarbeiro';
import RegisterBarbeiro from './pages/barbeiro/RegisterBarbeiro';
import BarbeiroDashboard from './pages/barbeiro/BarbeiroDashboard';
import BarbeiroHistorico from './pages/barbeiro/BarbeiroHistorico';
import BarbeiroEstatisticas from './pages/barbeiro/BarbeiroEstatisticas';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectProfile />} />
        
        {/* rotas de cliente */}
        <Route path="/cliente/login" element={<LoginCliente />} />
        <Route path="/cliente/register" element={<RegisterCliente />} />
        <Route path="/cliente/:id" element={<ClienteDashboard />} />
        <Route path="/cliente/novo-agendamento/:id" element={<NovoAgendamento />} />
        <Route path="/cliente/historico/:id" element={<ClienteHistorico />} />
        <Route path="/cliente/configuracoes/:id" element={<ClienteConfiguracoes />} /> {/* NOVA ROTA */}
        
        {/* rotas de barbeiro */}
        <Route path="/barbeiro/login" element={<LoginBarbeiro />} />
        <Route path="/barbeiro/register" element={<RegisterBarbeiro />} />
        <Route path="/barbeiro/:id" element={<BarbeiroDashboard />} />
        <Route path="/barbeiro/historico/:id" element={<BarbeiroHistorico />} />
        <Route path="/barbeiro/estatisticas/:id" element={<BarbeiroEstatisticas />} />
      </Routes>
    </Router>
  );
}