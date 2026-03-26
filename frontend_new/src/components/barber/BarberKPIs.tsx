import { motion } from 'framer-motion';
import { DollarSign, CalendarCheck, Clock, CheckCircle } from 'lucide-react';

interface BarberKPIsProps {
  commissionToday: number;
  agendadosCount: number;
  pendingCount: number;
  completedCount: number;
}

const BarberKPIs = ({ commissionToday, pendingCount, agendadosCount, completedCount }: BarberKPIsProps) => {
  const kpis = [
    { label: 'Minha Comissão', value: `R$ ${commissionToday.toFixed(0)}`, icon: DollarSign, color: 'text-primary' },
    { label: 'Total Agendamentos', value: agendadosCount, icon: CalendarCheck, color: 'text-info' },
    { label: 'Pendentes', value: pendingCount.toString(), icon: Clock, color: 'text-yellow-600' },
    { label: 'Concluídos', value: completedCount.toString(), icon: CheckCircle, color: 'text-success' },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      {kpis.map((kpi, i) => (
        <motion.div
          key={kpi.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">{kpi.label}</span>
            <kpi.icon className={`h-5 w-5 ${kpi.color}`} />
          </div>
          <p className="font-display text-3xl font-bold">{kpi.value}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default BarberKPIs;
