import { useState } from 'react';
import Navbar from '@/components/Navbar';
import { motion } from 'framer-motion';
import { CalendarCheck, CheckCircle, Clock, DollarSign, TrendingUp, Users, Settings, BarChart3, CalendarCog, FileText, Palette } from 'lucide-react';
import { barbers, services, appointments, weeklyRevenue, barberPerformance, financialLogs } from '@/data/mockData';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import ScheduleGrid from "../components/ScheduleGrid";
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

const totalGross = weeklyRevenue.reduce((s, d) => s + d.revenue, 0);
const totalCommissions = weeklyRevenue.reduce((s, d) => s + d.commission, 0);
const netProfit = totalGross - totalCommissions;

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('schedule');
  const [selectedBarber, setSelectedBarber] = useState('all');
  const [scheduleBarber, setScheduleBarber] = useState(barbers[0].id);

  const barberId = '1'; // Simulated logged-in barber
  const barber = barbers.find(b => b.id === barberId)!;
  const myAppointments = appointments.filter(a => a.barberId === barberId);
  const completedToday = myAppointments.filter(a => a.status === 'completed');
  const agendadosHoje = myAppointments.filter(a => a.status === 'confirmed');
  const pendingToday = myAppointments.filter(a => a.status === 'in-progress');
  const rendaDiaria = completedToday.reduce((sum, a) => sum + (a.totalPrice * barber.commission / 100), 0);

  // Schedule state
  const [schedule, setSchedule] = useState(
    ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => ({
      day: d,
      active: d !== 'Dom',
      start: '09:00',
      end: '19:00',
      breakStart: '12:00',
      breakEnd: '13:00',
    }))
  );

  const filteredLogs = selectedBarber === 'all'
    ? financialLogs
    : financialLogs.filter(l => l.barber === barbers.find(b => b.id === selectedBarber)?.name);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto pb-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl sm:text-3xl font-bold mb-1">
            Painel <span className="amber-gradient-text">Administrativo</span>
          </h1>
          <p className="text-muted-foreground text-sm mb-8">Gestão completa da sua barbearia.</p>
        </motion.div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-secondary/50 mb-8 flex-wrap h-auto gap-1">
            {[
              { value: 'schedule', label: 'Agenda', icon: CalendarCog },
              { value: 'overview', label: 'Dashboard', icon: BarChart3 },
              { value: 'resources', label: 'Recursos', icon: Users },
              { value: 'financial', label: 'Financeiro', icon: FileText },
              { value: 'settings', label: 'Configurações', icon: Settings },
            ].map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground gap-1.5 text-xs sm:text-sm">
                <tab.icon className="h-4 w-4" />
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* SCHEDULE */}
          <TabsContent value="schedule" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Faturamento Diário', value: `R$ ${rendaDiaria.toFixed(0)}`, icon: DollarSign, color: 'text-primary' },
                { label: 'Total Agendamentos', value: agendadosHoje.length.toString(), icon: CalendarCheck, color: 'text-info' },
                { label: 'Pendentes', value: pendingToday.length.toString(), icon: Clock, color: 'text-yellow-600' },
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

            {/* Agenda em formato de planilha */}
            <div className="glass-card p-6 mt-6">
              <h3 className="font-display font-semibold mb-6">
                Agenda
              </h3>
              <ScheduleGrid />
            </div>
          </TabsContent>

          {/* OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { label: 'Faturamento Bruto', value: `R$ ${totalGross.toLocaleString()}`, icon: DollarSign },
                { label: 'Lucro Líquido', value: `R$ ${netProfit.toLocaleString()}`, icon: TrendingUp },
                { label: 'Comissões a Pagar', value: `R$ ${totalCommissions.toLocaleString()}`, icon: Users },
              ].map((kpi, i) => (
                <motion.div key={kpi.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="glass-card p-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">{kpi.label}</span>
                    <kpi.icon className="h-5 w-5 text-primary" />
                  </div>
                  <p className="font-display text-3xl font-bold">{kpi.value}</p>
                </motion.div>
              ))}
            </div>

            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-4">Desempenho por Barbeiro</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barberPerformance}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 18%)" />
                    <XAxis dataKey="name" stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <YAxis stroke="hsl(220, 10%, 55%)" fontSize={12} />
                    <Tooltip contentStyle={{ backgroundColor: 'hsl(220, 18%, 12%)', border: '1px solid hsl(220, 15%, 22%)', borderRadius: '0.75rem', color: 'hsl(40, 10%, 92%)' }} />
                    <Bar dataKey="revenue" fill="hsl(38, 92%, 50%)" radius={[6, 6, 0, 0]} name="Faturamento" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Performance table */}
            <div className="glass-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/50">
                    <th className="text-left p-4 font-display font-semibold text-muted-foreground">Barbeiro</th>
                    <th className="text-right p-4 font-display font-semibold text-muted-foreground">Faturamento</th>
                    <th className="text-right p-4 font-display font-semibold text-muted-foreground">Atendimentos</th>
                    <th className="text-right p-4 font-display font-semibold text-muted-foreground">Ticket Médio</th>
                  </tr>
                </thead>
                <tbody>
                  {barberPerformance.map(bp => (
                    <tr key={bp.name} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                      <td className="p-4 font-medium">{bp.name}</td>
                      <td className="p-4 text-right text-primary font-display font-bold">R$ {bp.revenue.toLocaleString()}</td>
                      <td className="p-4 text-right">{bp.appointments}</td>
                      <td className="p-4 text-right">R$ {bp.avgTicket.toFixed(0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* RESOURCES */}
          <TabsContent value="resources" className="space-y-6">
            {/* Services CRUD */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold">Serviços</h3>
                <Button size="sm" className="amber-gradient text-primary-foreground" onClick={() => toast.info('Modal de criação (em desenvolvimento)')}>
                  + Adicionar
                </Button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {services.map(s => (
                  <div key={s.id} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30">
                    <span className="text-2xl">{s.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{s.name}</p>
                      <p className="text-sm text-muted-foreground">R$ {s.price} • {s.duration} min</p>
                    </div>
                    <Button size="sm" variant="outline" className="border-border/50 text-xs">Editar</Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Barbers CRUD */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-display font-semibold">Barbeiros</h3>
                <Button size="sm" className="amber-gradient text-primary-foreground" onClick={() => toast.info('Modal de criação (em desenvolvimento)')}>
                  + Adicionar
                </Button>
              </div>
              <div className="space-y-3">
                {barbers.map(b => (
                  <div key={b.id} className="flex items-center gap-4 p-4 rounded-xl bg-secondary/30">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-display font-bold text-primary">
                      {b.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{b.name}</p>
                      <p className="text-sm text-muted-foreground">{b.specialty} • {b.commission}% comissão</p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="border-border/50 text-xs">Editar</Button>
                      <Button size="sm" variant="outline" className="border-destructive/50 text-destructive text-xs">Excluir</Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="font-display font-semibold">Configurar Grade de Horários</h3>
                <Select value={scheduleBarber} onValueChange={setScheduleBarber}>
                  <SelectTrigger className="w-[200px] bg-secondary/30 border-border/50">
                    <SelectValue placeholder="Barbeiro" />
                  </SelectTrigger>
                  <SelectContent>
                    {barbers.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                {schedule.map((day, i) => (
                  <div key={day.day} className={`flex flex-col sm:flex-row sm:items-center gap-3 p-4 rounded-xl ${day.active ? 'bg-secondary/30' : 'bg-secondary/10 opacity-60'}`}>
                    <div className="flex items-center gap-3 min-w-[100px]">
                      <Switch
                        checked={day.active}
                        onCheckedChange={(checked) => {
                          const next = [...schedule];
                          next[i].active = checked;
                          setSchedule(next);
                        }}
                      />
                      <span className="font-display font-semibold w-10">{day.day}</span>
                    </div>
                    {day.active && (
                      <div className="flex flex-wrap items-center gap-2 text-sm">
                        <Input className="w-24 bg-background border-border/50" type="time" value={day.start} onChange={e => { const n = [...schedule]; n[i].start = e.target.value; setSchedule(n); }} />
                        <span className="text-muted-foreground">até</span>
                        <Input className="w-24 bg-background border-border/50" type="time" value={day.end} onChange={e => { const n = [...schedule]; n[i].end = e.target.value; setSchedule(n); }} />
                        <span className="text-muted-foreground ml-2">Intervalo:</span>
                        <Input className="w-24 bg-background border-border/50" type="time" value={day.breakStart} onChange={e => { const n = [...schedule]; n[i].breakStart = e.target.value; setSchedule(n); }} />
                        <span className="text-muted-foreground">-</span>
                        <Input className="w-24 bg-background border-border/50" type="time" value={day.breakEnd} onChange={e => { const n = [...schedule]; n[i].breakEnd = e.target.value; setSchedule(n); }} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <Button className="amber-gradient text-primary-foreground mt-6" onClick={() => toast.success('Horários salvos com sucesso!')}>
                Salvar Horários
              </Button>
            </div>
          </TabsContent>

          {/* FINANCIAL */}
          <TabsContent value="financial" className="space-y-6">
            <div className="glass-card p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h3 className="font-display font-semibold">Logs Financeiros</h3>
                <Select value={selectedBarber} onValueChange={setSelectedBarber}>
                  <SelectTrigger className="w-[200px] bg-secondary/30 border-border/50">
                    <SelectValue placeholder="Filtrar barbeiro" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    {barbers.map(b => (
                      <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[700px]">
                  <thead>
                    <tr className="border-b border-border/50">
                      {['Data', 'Cliente', 'Profissional', 'Serviço', 'Status', 'Bruto', '%', 'Barbeiro', 'Casa'].map(h => (
                        <th key={h} className="text-left p-3 font-display font-semibold text-muted-foreground text-xs">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                        <td className="p-3">{new Date(log.date).toLocaleDateString('pt-BR')}</td>
                        <td className="p-3">{log.client}</td>
                        <td className="p-3">{log.barber}</td>
                        <td className="p-3">{log.service}</td>
                        <td className="p-3">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            log.status === 'completed' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'
                          }`}>
                            {log.status === 'completed' ? 'Finalizado' : 'Em andamento'}
                          </span>
                        </td>
                        <td className="p-3 font-medium">R$ {log.grossValue}</td>
                        <td className="p-3 text-muted-foreground">{log.commissionRate}%</td>
                        <td className="p-3 text-primary font-medium">R$ {log.barberValue.toFixed(2)}</td>
                        <td className="p-3 font-medium">R$ {log.houseValue.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>

          {/* SETTINGS */}
          <TabsContent value="settings" className="space-y-6">
            <div className="glass-card p-6">
              <h3 className="font-display font-semibold mb-6">Personalização</h3>
              <div className="space-y-6 max-w-lg">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Logo da Barbearia</label>
                  <div className="w-24 h-24 rounded-xl bg-secondary/50 border border-dashed border-border flex items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                    <Palette className="h-8 w-8 text-muted-foreground" />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Nome da Barbearia</label>
                  <Input defaultValue="BarberSaaS Elite" className="bg-secondary/30 border-border/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Endereço</label>
                  <Input defaultValue="Rua Augusta, 1500 - São Paulo, SP" className="bg-secondary/30 border-border/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Instagram</label>
                  <Input defaultValue="@barbersaas.elite" className="bg-secondary/30 border-border/50" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">WhatsApp</label>
                  <Input defaultValue="(11) 99999-0000" className="bg-secondary/30 border-border/50" />
                </div>
                <Button className="amber-gradient text-primary-foreground" onClick={() => toast.success('Configurações salvas!')}>
                  Salvar Configurações
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
