import { TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTheme } from '@/components/ThemeProvider';

interface BarberChartsProps {
  revenueData: Array<{ day: string; commission: number }>;
  serviceDistribution: Array<{ name: string; value: number; fill: string }>;
  avgTicket: number;
  periodLabel: string;
}

const BarberCharts = ({ revenueData, serviceDistribution, avgTicket, periodLabel }: BarberChartsProps) => {
  const { theme } = useTheme();
  const gridColor = theme === 'dark' ? 'hsl(220, 15%, 18%)' : 'hsl(220, 15%, 85%)';
  const axisColor = theme === 'dark' ? 'hsl(220, 10%, 55%)' : 'hsl(220, 10%, 45%)';
  const tooltipBg = theme === 'dark' ? 'hsl(220, 18%, 12%)' : 'hsl(0, 0%, 100%)';
  const tooltipBorder = theme === 'dark' ? 'hsl(220, 15%, 22%)' : 'hsl(220, 15%, 85%)';
  const tooltipColor = theme === 'dark' ? 'hsl(40, 10%, 92%)' : 'hsl(220, 20%, 10%)';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 glass-card p-6">
        <h3 className="font-display font-semibold mb-4">Faturamento {periodLabel}</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis dataKey="day" stroke={axisColor} fontSize={12} />
              <YAxis stroke={axisColor} fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', color: tooltipColor }} />
              <Line type="monotone" dataKey="commission" stroke="hsl(38, 92%, 50%)" strokeWidth={2} dot={{ fill: 'hsl(38, 92%, 50%)' }} name="Comissão" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

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
              <Tooltip contentStyle={{ backgroundColor: tooltipBg, border: `1px solid ${tooltipBorder}`, borderRadius: '0.75rem', color: tooltipColor }} />
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
  );
};

export default BarberCharts;
