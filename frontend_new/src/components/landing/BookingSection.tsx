import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { services, barbers, timeSlots } from '@/data/mockData';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Check, ChevronLeft, ChevronRight, User, Scissors, CalendarDays, ClipboardCheck } from 'lucide-react';
import { toast } from 'sonner';
import barber1 from '@/assets/barber-1.jpg';
import barber2 from '@/assets/barber-2.jpg';
import barber3 from '@/assets/barber-3.jpg';

const avatars: Record<string, string> = { '1': barber1, '2': barber2, '3': barber3 };

const steps = [
  { label: 'Serviço', icon: Scissors },
  { label: 'Barbeiro', icon: User },
  { label: 'Data & Hora', icon: CalendarDays },
  { label: 'Confirmar', icon: ClipboardCheck },
];

const BookingSection = () => {
  const [step, setStep] = useState(0);
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [selectedBarber, setSelectedBarber] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');

  const canNext = () => {
    if (step === 0) return !!selectedService;
    if (step === 1) return !!selectedBarber;
    if (step === 2) return !!selectedDate && !!selectedTime;
    if (step === 3) return clientName.length > 2 && clientPhone.length > 8;
    return false;
  };

  const handleConfirm = () => {
    toast.success('Agendamento confirmado! 🎉', {
      description: 'Você receberá uma confirmação em breve.',
    });
    setStep(0);
    setSelectedService(null);
    setSelectedBarber(null);
    setSelectedDate(undefined);
    setSelectedTime(null);
    setClientName('');
    setClientPhone('');
  };

  const service = services.find(s => s.id === selectedService);
  const barber = barbers.find(b => b.id === selectedBarber);

  return (
    <section id="agendar" className="section-padding">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            Agende seu <span className="amber-gradient-text">Horário</span>
          </h2>
        </motion.div>

        {/* Stepper */}
        <div className="flex items-center justify-between mb-10 px-4">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
                  i <= step ? 'amber-gradient text-primary-foreground' : 'bg-secondary text-muted-foreground'
                }`}>
                  {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
                </div>
                <span className={`text-xs mt-2 hidden sm:block ${i <= step ? 'text-primary' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className={`h-px w-8 sm:w-16 lg:w-24 mx-2 ${i < step ? 'bg-primary' : 'bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Steps content */}
        <div className="glass-card p-6 sm:p-8 min-h-[320px]">
          <AnimatePresence mode="wait">
            {step === 0 && (
              <motion.div key="step0" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {services.map(s => (
                    <button
                      key={s.id}
                      onClick={() => setSelectedService(s.id)}
                      className={`p-4 rounded-xl text-left transition-all border ${
                        selectedService === s.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/30 bg-secondary/30'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{s.icon}</span>
                        <div className="flex-1 min-w-0">
                          <p className="font-display font-semibold truncate">{s.name}</p>
                          <p className="text-sm text-muted-foreground">{s.duration} min • R$ {s.price}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 1 && (
              <motion.div key="step1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {barbers.map(b => (
                    <button
                      key={b.id}
                      onClick={() => setSelectedBarber(b.id)}
                      className={`p-6 rounded-xl text-center transition-all border ${
                        selectedBarber === b.id
                          ? 'border-primary bg-primary/10'
                          : 'border-border/50 hover:border-primary/30 bg-secondary/30'
                      }`}
                    >
                      <img src={avatars[b.id]} alt={b.name} className="w-16 h-16 rounded-full object-cover mx-auto mb-3 border border-primary/20" />
                      <p className="font-display font-semibold">{b.name}</p>
                      <p className="text-xs text-primary">{b.specialty}</p>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="step2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex justify-center">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={(date) => date < new Date() || date.getDay() === 0}
                      className="p-3 pointer-events-auto rounded-xl border border-border/50 bg-secondary/30"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground mb-3 font-medium">Horários disponíveis</p>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {timeSlots.map(t => (
                        <button
                          key={t}
                          onClick={() => setSelectedTime(t)}
                          className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                            selectedTime === t
                              ? 'amber-gradient text-primary-foreground border-transparent'
                              : 'border-border/50 hover:border-primary/30 bg-secondary/30 text-foreground'
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="step3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="space-y-6">
                  {/* Summary */}
                  <div className="bg-secondary/30 rounded-xl p-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Resumo do agendamento</p>
                    <div className="flex justify-between text-sm">
                      <span>Serviço</span>
                      <span className="font-medium">{service?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Barbeiro</span>
                      <span className="font-medium">{barber?.name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Data</span>
                      <span className="font-medium">{selectedDate?.toLocaleDateString('pt-BR')}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Horário</span>
                      <span className="font-medium">{selectedTime}</span>
                    </div>
                    <div className="flex justify-between pt-2 border-t border-border/50">
                      <span className="font-display font-semibold">Total</span>
                      <span className="font-display font-bold text-primary text-lg">R$ {service?.price}</span>
                    </div>
                  </div>
                  {/* Client info */}
                  <div className="space-y-3">
                    <Input
                      placeholder="Seu nome completo"
                      value={clientName}
                      onChange={e => setClientName(e.target.value)}
                      className="bg-secondary/30 border-border/50"
                    />
                    <Input
                      placeholder="Seu telefone"
                      value={clientPhone}
                      onChange={e => setClientPhone(e.target.value)}
                      className="bg-secondary/30 border-border/50"
                    />
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="border-border/50"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Voltar
          </Button>
          {step < 3 ? (
            <Button
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className="amber-gradient text-primary-foreground"
            >
              Próximo <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleConfirm}
              disabled={!canNext()}
              className="amber-gradient text-primary-foreground glow-amber"
            >
              Confirmar Agendamento
            </Button>
          )}
        </div>
      </div>
    </section>
  );
};

export default BookingSection;
