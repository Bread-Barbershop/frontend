import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2 } from 'lucide-react';

import { UtilityButton } from '@/components/atoms/button';

import type { ReactNode } from 'react';

interface Props {
  id: string;
  label: string;
  removeLabel: string;
  heading: ReactNode;
  className: string;
  children: ReactNode;
  onRemove: () => void;
  onMove: (offset: number) => void;
}

export function SortableEditorRow({
  id,
  label,
  removeLabel,
  heading,
  className,
  children,
  onRemove,
  onMove,
}: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={className}
    >
      <div className="flex items-center gap-1">
        <div className="min-w-0 flex-1">{heading}</div>
        <button
          type="button"
          ref={setActivatorNodeRef}
          {...attributes}
          {...listeners}
          aria-label={`${label} 순서 변경`}
          title="드래그하거나 위아래 방향키로 순서 변경"
          className="grid size-8 touch-none cursor-grab place-items-center rounded text-text-secondary"
          onKeyDown={event => {
            if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
              event.preventDefault();
              event.stopPropagation();
              onMove(event.key === 'ArrowUp' ? -1 : 1);
            }
          }}
        >
          <GripVertical size={16} />
        </button>
        <UtilityButton
          variant="danger"
          aria-label={removeLabel}
          onClick={onRemove}
        >
          <Trash2 size={15} />
        </UtilityButton>
      </div>
      {children}
    </li>
  );
}
