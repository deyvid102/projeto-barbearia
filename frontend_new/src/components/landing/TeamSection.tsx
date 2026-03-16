import { motion } from 'framer-motion';
import { barbers } from '@/data/mockData';
import barber1 from '@/assets/barber-1.jpg';
import barber2 from '@/assets/barber-2.jpg';
import barber3 from '@/assets/barber-3.jpg';

const avatars: Record<string, string> = {
  '1': barber1,
  '2': barber2,
  '3': barber3,
};

const TeamSection = () => {
  return (
    <section id="equipe" className="section-padding bg-secondary/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Nossa <span className="amber-gradient-text">Equipe</span>
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Profissionais apaixonados pelo que fazem.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {barbers.map((barber, i) => (
            <motion.div
              key={barber.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="glass-card-hover text-center p-8"
            >
              <div className="relative w-28 h-28 mx-auto mb-6">
                <img
                  src={avatars[barber.id]}
                  alt={barber.name}
                  className="w-full h-full rounded-full object-cover border-2 border-primary/30"
                />
                <div className="absolute inset-0 rounded-full ring-2 ring-primary/20 ring-offset-2 ring-offset-background" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-1">{barber.name}</h3>
              <span className="text-primary text-sm font-medium">{barber.specialty}</span>
              <p className="text-muted-foreground text-sm mt-3 leading-relaxed">{barber.bio}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TeamSection;
