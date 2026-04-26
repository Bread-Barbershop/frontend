import { cn } from '@/shared/utils/cn';

import { dividerVariants, DividerVariants } from './Divider.style';

interface DividerProps extends DividerVariants {
  className?: string;
}

export const Divider = ({ className, padding }: DividerProps) => {
  return (
    <div className={cn(dividerVariants({ padding }), className)}>
      <div className="w-0.5 h-1.5 rounded-sm bg-text-secondary" />
      <div className="w-0.5 h-2 rounded-sm bg-text-secondary" />
      <div className="w-0.5 h-1.5 rounded-sm bg-text-secondary" />
    </div>
  );
};
