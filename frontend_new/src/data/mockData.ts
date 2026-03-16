export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number; // minutes
  icon: string;
}

export interface Barber {
  id: string;
  name: string;
  bio: string;
  specialty: string;
  avatar: string;
  commission: number; // percentage
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  barberId: string;
  serviceId: string;
  date: string;
  time: string;
  status: 'confirmed' | 'in-progress' | 'completed' | 'cancelled';
  totalPrice: number;
}

export const services: Service[] = [
  { id: '1', name: 'Corte Clássico', description: 'Corte tradicional com acabamento perfeito e toalha quente.', price: 45, duration: 30, icon: '✂️' },
  { id: '2', name: 'Barba Completa', description: 'Modelagem e aparação de barba com navalha e produtos premium.', price: 35, duration: 25, icon: '🪒' },
  { id: '3', name: 'Corte + Barba', description: 'Combo completo de corte e barba com tratamento VIP.', price: 70, duration: 50, icon: '💈' },
  { id: '4', name: 'Degradê Premium', description: 'Degradê perfeito com transição suave e finalização com gel.', price: 55, duration: 40, icon: '🔥' },
  { id: '5', name: 'Pigmentação', description: 'Pigmentação capilar para cobertura de falhas ou grisalhos.', price: 80, duration: 45, icon: '🎨' },
  { id: '6', name: 'Tratamento Capilar', description: 'Hidratação profunda e tratamento com óleos essenciais.', price: 60, duration: 35, icon: '💆' },
];

export const barbers: Barber[] = [
  { id: '1', name: 'Carlos Silva', bio: '10 anos de experiência em cortes clássicos e modernos.', specialty: 'Cortes Clássicos', avatar: '/barber-1.jpg', commission: 40 },
  { id: '2', name: 'Rafael Santos', bio: 'Especialista em degradê e design de barba artístico.', specialty: 'Degradê & Barba', avatar: '/barber-2.jpg', commission: 45 },
  { id: '3', name: 'Lucas Oliveira', bio: 'Jovem talento premiado em campeonatos de barbearia.', specialty: 'Cortes Modernos', avatar: '/barber-3.jpg', commission: 35 },
];

export const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00', '17:30', '18:00', '18:30',
];

export const appointments: Appointment[] = [
  { id: '1', clientName: 'João Pedro', clientPhone: '(11) 99999-0001', barberId: '1', serviceId: '1', date: '2026-03-16', time: '09:00', status: 'completed', totalPrice: 45 },
  { id: '2', clientName: 'Marcos Vieira', clientPhone: '(11) 99999-0002', barberId: '1', serviceId: '3', date: '2026-03-16', time: '10:00', status: 'completed', totalPrice: 70 },
  { id: '3', clientName: 'André Lima', clientPhone: '(11) 99999-0003', barberId: '2', serviceId: '4', date: '2026-03-16', time: '09:30', status: 'in-progress', totalPrice: 55 },
  { id: '4', clientName: 'Fernando Costa', clientPhone: '(11) 99999-0004', barberId: '1', serviceId: '2', date: '2026-03-16', time: '14:00', status: 'confirmed', totalPrice: 35 },
  { id: '5', clientName: 'Ricardo Alves', clientPhone: '(11) 99999-0005', barberId: '2', serviceId: '1', date: '2026-03-16', time: '11:00', status: 'confirmed', totalPrice: 45 },
  { id: '6', clientName: 'Bruno Souza', clientPhone: '(11) 99999-0006', barberId: '3', serviceId: '6', date: '2026-03-16', time: '10:00', status: 'completed', totalPrice: 60 },
  { id: '7', clientName: 'Gabriel Santos', clientPhone: '(11) 99999-0007', barberId: '3', serviceId: '5', date: '2026-03-16', time: '13:00', status: 'confirmed', totalPrice: 80 },
  { id: '8', clientName: 'Diego Ferreira', clientPhone: '(11) 99999-0008', barberId: '1', serviceId: '4', date: '2026-03-16', time: '15:00', status: 'confirmed', totalPrice: 55 },
  { id: '9', clientName: 'Thiago Martins', clientPhone: '(11) 99999-0009', barberId: '2', serviceId: '3', date: '2026-03-16', time: '14:30', status: 'confirmed', totalPrice: 70 },
  { id: '10', clientName: 'Paulo Henrique', clientPhone: '(11) 99999-0010', barberId: '3', serviceId: '1', date: '2026-03-16', time: '15:30', status: 'confirmed', totalPrice: 45 },
];

export const weeklyRevenue = [
  { day: 'Seg', revenue: 420, commission: 168 },
  { day: 'Ter', revenue: 380, commission: 152 },
  { day: 'Qua', revenue: 510, commission: 204 },
  { day: 'Qui', revenue: 460, commission: 184 },
  { day: 'Sex', revenue: 620, commission: 248 },
  { day: 'Sáb', revenue: 780, commission: 312 },
  { day: 'Dom', revenue: 0, commission: 0 },
];

export const barberPerformance = [
  { name: 'Carlos Silva', revenue: 2450, appointments: 42, avgTicket: 58.3 },
  { name: 'Rafael Santos', revenue: 2180, appointments: 38, avgTicket: 57.4 },
  { name: 'Lucas Oliveira', revenue: 1890, appointments: 35, avgTicket: 54.0 },
];

export const serviceDistribution = [
  { name: 'Corte Clássico', value: 35, fill: 'hsl(38, 92%, 50%)' },
  { name: 'Barba Completa', value: 20, fill: 'hsl(28, 95%, 45%)' },
  { name: 'Corte + Barba', value: 25, fill: 'hsl(48, 90%, 55%)' },
  { name: 'Degradê Premium', value: 12, fill: 'hsl(220, 15%, 40%)' },
  { name: 'Outros', value: 8, fill: 'hsl(220, 15%, 25%)' },
];

export const financialLogs = [
  { id: '1', date: '2026-03-16', client: 'João Pedro', barber: 'Carlos Silva', service: 'Corte Clássico', status: 'completed' as const, grossValue: 45, commissionRate: 40, barberValue: 18, houseValue: 27 },
  { id: '2', date: '2026-03-16', client: 'Marcos Vieira', barber: 'Carlos Silva', service: 'Corte + Barba', status: 'completed' as const, grossValue: 70, commissionRate: 40, barberValue: 28, houseValue: 42 },
  { id: '3', date: '2026-03-16', client: 'André Lima', barber: 'Rafael Santos', service: 'Degradê Premium', status: 'in-progress' as const, grossValue: 55, commissionRate: 45, barberValue: 24.75, houseValue: 30.25 },
  { id: '4', date: '2026-03-15', client: 'Paulo Mendes', barber: 'Lucas Oliveira', service: 'Tratamento Capilar', status: 'completed' as const, grossValue: 60, commissionRate: 35, barberValue: 21, houseValue: 39 },
  { id: '5', date: '2026-03-15', client: 'Vinicius Rocha', barber: 'Rafael Santos', service: 'Barba Completa', status: 'completed' as const, grossValue: 35, commissionRate: 45, barberValue: 15.75, houseValue: 19.25 },
  { id: '6', date: '2026-03-15', client: 'Eduardo Dias', barber: 'Carlos Silva', service: 'Pigmentação', status: 'completed' as const, grossValue: 80, commissionRate: 40, barberValue: 32, houseValue: 48 },
  { id: '7', date: '2026-03-14', client: 'Mateus Gomes', barber: 'Lucas Oliveira', service: 'Corte Clássico', status: 'completed' as const, grossValue: 45, commissionRate: 35, barberValue: 15.75, houseValue: 29.25 },
  { id: '8', date: '2026-03-14', client: 'Henrique Silva', barber: 'Rafael Santos', service: 'Corte + Barba', status: 'completed' as const, grossValue: 70, commissionRate: 45, barberValue: 31.50, houseValue: 38.50 },
];
