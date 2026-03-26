import { useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarIcon, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { barbers } from '@/data/mockData';
import { toast } from 'sonner';

interface Block {
  id: string;
  barberId: string;
  date: Date;
  startTime: string;
  endTime: string;
  reason: string;
}

const ScheduleBlocker = () => {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [selectedBarber, setSelectedBarber] = useState(barbers[0].id);
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState('13:00');
  const [endTime, setEndTime] = useState('17:00');
  const [reason, setReason] = useState('');

  const addBlock = () => {
    if (!date) {
      toast.error('Selecione uma data');
      return;
    }
    const newBlock: Block = {
      id: Date.now().toString(),
      barberId: selectedBarber,
      date,
      startTime,
      endTime,
      reason: reason || 'Compromisso pessoal',
    };
    setBlocks(prev => [...prev, newBlock]);
    setDate(undefined);
    setReason('');
    toast.success('Bloqueio adicionado com sucesso!');
  };

  const removeBlock = (id: string) => {
    setBlocks(prev => prev.filter(b => b.id !== id));
    toast.success('Bloqueio removido');
  };

  return (
    <div className="glass-card p-6">
      <h3 className="font-display font-semibold mb-6">Bloqueios de Horário Específicos</h3>
      <p className="text-sm text-muted-foreground mb-4">
        Adicione bloqueios para dias e horários específicos quando um barbeiro tiver compromissos.
      </p>

      <div className="flex flex-col gap-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 items-end">
          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Barbeiro</label>
            <Select value={selectedBarber} onValueChange={setSelectedBarber}>
              <SelectTrigger className="bg-secondary/30 border-border/50">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {barbers.map(b => (
                  <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Data</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className={cn("w-full justify-start text-left font-normal bg-secondary/30 border-border/50", !date && "text-muted-foreground")}>
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : "Selecionar"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ptBR}
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Início</label>
            <Input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className="bg-secondary/30 border-border/50" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Fim</label>
            <Input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className="bg-secondary/30 border-border/50" />
          </div>

          <div>
            <label className="text-xs text-muted-foreground mb-1.5 block">Motivo</label>
            <Input placeholder="Ex: Médico" value={reason} onChange={e => setReason(e.target.value)} className="bg-secondary/30 border-border/50" />
          </div>
        </div>

        <Button onClick={addBlock} className="amber-gradient text-primary-foreground w-fit gap-2">
          <Plus className="h-4 w-4" /> Adicionar Bloqueio
        </Button>
      </div>

      {blocks.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-muted-foreground mb-3">Bloqueios Ativos</h4>
          {blocks.map(block => {
            const barber = barbers.find(b => b.id === block.barberId);
            return (
              <div key={block.id} className="flex items-center gap-4 p-3 rounded-xl bg-secondary/30">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm">{barber?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(block.date, "dd/MM/yyyy")} • {block.startTime} - {block.endTime} • {block.reason}
                  </p>
                </div>
                <Button size="icon" variant="ghost" className="text-destructive h-8 w-8" onClick={() => removeBlock(block.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ScheduleBlocker;
