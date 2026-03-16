import { motion } from 'framer-motion';
import { services } from '@/data/mockData';
import { Clock } from 'lucide-react';

const ServicesSection = () => {
  return (
    <section id="servicos" className="section-padding">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Nossos <span className="amber-gradient-text">Serviços</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Cada serviço é uma experiência pensada nos mínimos detalhes.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, i) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="glass-card-hover p-6"
            >
              <div className="text-3xl mb-4">{service.icon}</div>
              <h3 className="font-display text-xl font-semibold mb-2">{service.name}</h3>
              <p className="text-muted-foreground text-sm mb-4 leading-relaxed">{service.description}</p>
              <div className="flex items-center justify-between pt-4 border-t border-border/50">
                <span className="font-display text-2xl font-bold text-primary">
                  R$ {service.price}
                </span>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  {service.duration} min
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
