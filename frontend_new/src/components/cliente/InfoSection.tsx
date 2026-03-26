import { motion } from 'framer-motion';
import { MapPin, Clock, Instagram, Facebook, MessageCircle } from 'lucide-react';

const InfoSection = () => {
  return (
    <section id="info" className="section-padding bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Como nos <span className="amber-gradient-text">Encontrar</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Map placeholder */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-1 md:col-span-2"
          >
            <div className="bg-secondary/50 rounded-lg h-64 md:h-full flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <MapPin className="h-10 w-10 mx-auto mb-3 text-primary" />
                <p className="font-display font-semibold">Rua Augusta, 1500</p>
                <p className="text-sm">São Paulo, SP - 01304-001</p>
              </div>
            </div>
          </motion.div>

          {/* Info */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-6"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="h-5 w-5 text-primary" />
                <h3 className="font-display font-semibold">Horários</h3>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Seg - Sex</span>
                  <span>09:00 - 19:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Sábado</span>
                  <span>09:00 - 17:00</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Domingo</span>
                  <span className="text-destructive">Fechado</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-6"
            >
              <h3 className="font-display font-semibold mb-4">Redes Sociais</h3>
              <div className="flex gap-3">
                {[
                  { icon: Instagram, label: 'Instagram' },
                  { icon: Facebook, label: 'Facebook' },
                  { icon: MessageCircle, label: 'WhatsApp' },
                ].map(({ icon: Icon, label }) => (
                  <button
                    key={label}
                    className="w-10 h-10 rounded-lg bg-secondary/50 flex items-center justify-center hover:bg-primary/20 hover:text-primary transition-colors"
                    aria-label={label}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="max-w-6xl mx-auto mt-16 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
        <p>© 2026 BarberSaaS Elite. Todos os direitos reservados.</p>
      </div>
    </section>
  );
};

export default InfoSection;
