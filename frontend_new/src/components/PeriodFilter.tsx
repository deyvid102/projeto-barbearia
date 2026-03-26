import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type Period = 'daily' | 'weekly' | 'monthly';

interface PeriodFilterProps {
  value: Period;
  onChange: (value: Period) => void;
}

const PeriodFilter = ({ value, onChange }: PeriodFilterProps) => {
  return (
    <ToggleGroup
      type="single"
      value={value}
      onValueChange={(v) => { if (v) onChange(v as Period); }}
      className="bg-secondary/50 rounded-lg p-1"
    >
      <ToggleGroupItem value="daily" className="text-xs px-3 py-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md">
        Diário
      </ToggleGroupItem>
      <ToggleGroupItem value="weekly" className="text-xs px-3 py-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md">
        Semanal
      </ToggleGroupItem>
      <ToggleGroupItem value="monthly" className="text-xs px-3 py-1.5 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-md">
        Mensal
      </ToggleGroupItem>
    </ToggleGroup>
  );
};

export default PeriodFilter;
