import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SelectProfile from './pages/SelectProfile';
import LoginCliente from './pages/cliente/LoginCliente';
import RegisterCliente from './pages/cliente/RegisterCliente';
import ClienteDashboard from './pages/cliente/ClienteDashboard';
import LoginBarbeiro from './pages/barbeiro/LoginBarbeiro';
import RegisterBarbeiro from './pages/barbeiro/RegisterBarbeiro';
import BarbeiroDashboard from './pages/barbeiro/BarbeiroDashboard';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SelectProfile />} />
        
        {/* Rotas de Cliente */}
        <Route path="/cliente/login" element={<LoginCliente />} />
        <Route path="/cliente/register" element={<RegisterCliente />} />
        <Route path="/cliente/:id" element={<ClienteDashboard />} />
        
        {/* Rotas de Barbeiro */}
        <Route path="/barbeiro/login" element={<LoginBarbeiro />} />
        <Route path="/barbeiro/register" element={<RegisterBarbeiro />} />
        <Route path="/barbeiro/:id" element={<BarbeiroDashboard />} />
      </Routes>
    </Router>
  );
}