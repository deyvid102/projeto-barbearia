import { motion } from 'framer-motion';
import heroImage from '@/assets/hero-barbershop.jpg';
import { Button } from '@/components/ui/button';
import { Scissors } from 'lucide-react';

const HeroSection = ({ onBookClick }: { onBookClick: () => void }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img src={heroImage} alt="Barbearia premium" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="h-px w-12 bg-primary" />
            <Scissors className="h-5 w-5 text-primary" />
            <div className="h-px w-12 bg-primary" />
          </div>
          <h1 className="font-display text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            A Arte do <span className="amber-gradient-text">Corte Perfeito</span>
          </h1>
          <p className="text-muted-foreground text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Experiência premium em barbearia. Profissionais especializados, ambiente exclusivo e resultados impecáveis.
          </p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
          >
            <Button
              onClick={onBookClick}
              size="lg"
              className="amber-gradient text-primary-foreground font-display text-lg px-10 py-6 rounded-xl glow-amber hover:opacity-90 transition-opacity"
            >
              Agendar Agora
            </Button>
          </motion.div>
        </motion.div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;
