import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { cn } from '@/shared/utils/cn';

interface ButtonSelectorProps<T extends string> {
  label?: string;
  selectorOption: readonly { value: T; label: string }[];
  selectedValue?: T;
  onChange: (value: T) => void;
  className?: string;
  disabled?: boolean;
}

export const ButtonSelector = <T extends string>({
  label,
  selectorOption,
  selectedValue,
  onChange,
  className,
  disabled,
}: ButtonSelectorProps<T>) => (
  <div className={cn('flex items-center gap-2', className)}>
    {label && <Label className="shrink-0 font-semibold">{label}</Label>}
    <div className="flex min-w-0 flex-wrap gap-1.5">
      {selectorOption.map(item => (
        <Button
          key={item.value}
          value={item.value}
          aria-pressed={selectedValue === item.value}
          className="w-12 text-sm font-normal aria-pressed:border-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          disabled={disabled}
          onClick={() => onChange(item.value)}
        >
          {item.label}
        </Button>
      ))}
    </div>
  </div>
);
