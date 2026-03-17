import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { DollarSign, CalendarCheck, CheckCircle, TrendingUp } from 'lucide-react';
import { appointments, services, barbers, weeklyRevenue, serviceDistribution } from '@/data/mockData';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import ScheduleGrid from "../components/ScheduleGrid";

const barberId = '1'; // Simulated logged-in barber
const barber = barbers.find(b => b.id === barberId)!;
const myAppointments = appointments.filter(a => a.barberId === barberId);
const completedToday = myAppointments.filter(a => a.status === 'completed');
const pendingToday = myAppointments.filter(a => a.status === 'confirmed');
const commissionToday = completedToday.reduce((sum, a) => sum + (a.totalPrice * barber.commission / 100), 0);
const avgTicket = completedToday.length > 0 ? completedToday.reduce((s, a) => s + a.totalPrice, 0) / completedToday.length : 0;

const statusColors: Record<string, string> = {
  confirmed: 'border-l-info',
  'in-progress': 'border-l-primary',
  completed: 'border-l-success',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmado',
  'in-progress': 'Em andamento',
  completed: 'Finalizado',
};

const BarberDashboard = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
            Olá, <span className="amber-gradient-text">{barber.name}</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-8">Aqui está seu resumo de hoje.</p>
        </motion.div>

        {/* KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Minha Comissão Hoje', value: `R$ ${commissionToday.toFixed(0)}`, icon: DollarSign, color: 'text-primary' },
            { label: 'Pendentes', value: pendingToday.length.toString(), icon: CalendarCheck, color: 'text-info' },
            { label: 'Concluídos', value: completedToday.length.toString(), icon: CheckCircle, color: 'text-success' },
          ].map((kpi, i) => (
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Chart */}
          <div className="lg:col-span-2 glass-card p-6">
            <h3 className="font-display font-semibold mb-4">Faturamento Semanal</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                  <XAxis dataKey="day" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '0.75rem', color: 'hsl(40, 10%, 92%)' }}
                  />
                  <Line type="monotone" dataKey="commission" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(38, 92%, 50%)' }} name="Comissão" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Service Distribution */}
          <div className="glass-card p-6">
            <h3 className="font-display font-semibold mb-2">Serviços Realizados</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={serviceDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {serviceDistribution.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '0.75rem', color: 'hsl(40, 10%, 92%)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-1 mt-2">
              {serviceDistribution.map(s => (
                <div key={s.name} className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.fill }} />
                  <span className="text-muted-foreground">{s.name}</span>
                  <span className="ml-auto font-medium">{s.value}%</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border/50 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span className="text-sm text-muted-foreground">Ticket Médio:</span>
              <span className="font-display font-bold text-primary">R$ {avgTicket.toFixed(0)}</span>
            </div>
          </div>
        </div>
        {/* Agenda em formato de planilha */}
        <div className="glass-card p-6 mt-6">

          <h3 className="font-display font-semibold mb-6">
            Agenda de Hoje
          </h3>

          <ScheduleGrid />

        </div>
      </div>
    </div>
  );
};

export default BarberDashboard;
