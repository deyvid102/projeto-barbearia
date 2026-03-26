import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ThemeToggle from './ThemeToggle';
import logo from '@/assets/logo_nome.png';

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link to="/" className="flex items-center gap-2">
          <img src={logo} alt="BarberMAX" className="h-9 w-auto" />
          <span className="font-display font-bold text-lg">Barber<span className="text-primary">MAX</span></span>
        </Link>

        {isLanding && (
          <div className="hidden md:flex items-center gap-8">
            <a href="#servicos" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Serviços</a>
            <a href="#equipe" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Equipe</a>
            <a href="#info" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Contato</a>
          </div>
        )}

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link to="/login">
            <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground gap-1.5">
              <LogIn className="h-4 w-4" />
              Entrar
            </Button>
          </Link>
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button className="text-foreground" onClick={() => setOpen(!open)}>
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-background/95 backdrop-blur-xl border-b border-border/50 px-4 py-4 space-y-3">
          {isLanding && (
            <>
              <a href="#servicos" onClick={() => setOpen(false)} className="block text-sm py-2 text-muted-foreground">Serviços</a>
              <a href="#equipe" onClick={() => setOpen(false)} className="block text-sm py-2 text-muted-foreground">Equipe</a>
              <a href="#info" onClick={() => setOpen(false)} className="block text-sm py-2 text-muted-foreground">Contato</a>
            </>
          )}
          <Link to="/login" onClick={() => setOpen(false)} className="flex items-center gap-2 text-sm py-2 text-muted-foreground">
            <LogIn className="h-4 w-4" /> Entrar como Profissional
          </Link>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
