import { useState } from 'react';
import { Scissors, Menu, X } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <Scissors className="h-6 w-6 text-primary" />
          <span className="font-display font-bold text-lg">BarberSaaS <span className="text-primary">Elite</span></span>
        </Link>

        {/* Desktop */}
        {isLanding && (
          <div className="hidden md:flex items-center gap-8">
            <a href="#servicos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Serviços</a>
            <a href="#equipe" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Equipe</a>
            <a href="#info" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contato</a>
          </div>
        )}

        <div className="hidden md:flex items-center gap-3">
          <Link to="/barbeiro">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Barbeiro</Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">Admin</Button>
          </Link>
          {isLanding && (
            <a href="#agendar">
              <Button size="sm" className="amber-gradient text-primary-foreground">Agendar</Button>
            </a>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden text-foreground" onClick={() => setOpen(!open)}>
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-4 space-y-3">
          {isLanding && (
            <>
              <a href="#servicos" onClick={() => setOpen(false)} className="block text-sm py-2 text-muted-foreground">Serviços</a>
              <a href="#equipe" onClick={() => setOpen(false)} className="block text-sm py-2 text-muted-foreground">Equipe</a>
              <a href="#info" onClick={() => setOpen(false)} className="block text-sm py-2 text-muted-foreground">Contato</a>
            </>
          )}
          <Link to="/barbeiro" onClick={() => setOpen(false)} className="block text-sm py-2 text-muted-foreground">Dashboard Barbeiro</Link>
          <Link to="/admin" onClick={() => setOpen(false)} className="block text-sm py-2 text-muted-foreground">Dashboard Admin</Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
