import { type ReactNode, useId } from 'react';

import SectionArrow from '@/shared/assets/icons/sectionArrow.svg';
import { cn } from '@/shared/utils/cn';

export function StylePanelSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: ReactNode;
}) {
  const panelId = useId();

  return (
    <div className="w-full">
      <button
        type="button"
        aria-expanded={expanded}
        aria-controls={panelId}
        onClick={onToggle}
        className={cn(
          'flex-center relative h-11 w-full rounded-lg border border-black/5 bg-white text-sm font-semibold transition-default',
          expanded ? 'rounded-b-none border-b-0' : 'shadow-edit'
        )}
      >
        {title}
        <SectionArrow
          aria-hidden="true"
          className={cn(
            'absolute right-6 h-[7px] w-[14px] transition-default',
            expanded && 'rotate-180'
          )}
        />
      </button>
      <div id={panelId} hidden={!expanded}>
        {children}
      </div>
    </div>
  );
}
