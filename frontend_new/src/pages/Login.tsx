import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { LogIn, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import ThemeToggle from '@/components/ThemeToggle';
import logo from '@/assets/logo_nome.png';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Mock login — will be replaced by backend auth
    setTimeout(() => {
      if (email === 'admin@barbermax.com' && password === '123456') {
        toast.success('Bem-vindo, Admin!');
        navigate('/admin');
      } else if (email === 'barbeiro@barbermax.com' && password === '123456') {
        toast.success('Bem-vindo, Barbeiro!');
        navigate('/barbeiro');
      } else {
        toast.error('Credenciais inválidas', {
          description: 'Verifique seu e-mail e senha.',
        });
      }
      setLoading(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <img src={logo} alt="BarberMAX" className="h-20 w-auto mx-auto mb-4" />
          <h1 className="font-display text-2xl font-bold">
            Barber<span className="text-primary">MAX</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">Acesso exclusivo para profissionais</p>
        </div>

        <form onSubmit={handleLogin} className="glass-card p-6 sm:p-8 space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">E-mail</label>
            <Input
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bg-secondary/30 border-border/50"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Senha</label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="bg-secondary/30 border-border/50 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full amber-gradient text-primary-foreground font-display"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Entrando...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn className="h-4 w-4" />
                Entrar
              </span>
            )}
          </Button>

          <div className="text-center">
            <button type="button" className="text-xs text-muted-foreground hover:text-primary transition-colors">
              Esqueceu sua senha?
            </button>
          </div>
        </form>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Credenciais de teste:<br />
          <span className="text-primary">admin@barbermax.com</span> / 123456<br />
          <span className="text-primary">barbeiro@barbermax.com</span> / 123456
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
