'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { useCallback } from 'react';

import { cn } from '@/shared/utils/cn';

import type { ReactNode } from 'react';

const INTERACTIVE_TARGETS =
  'a, button, input, textarea, select, [contenteditable="true"], [role="button"], [role="slider"], [data-no-block-drag]';

function canDragPreviewBlock(target: EventTarget | null) {
  return target instanceof Element && !target.closest(INTERACTIVE_TARGETS);
}

interface Props {
  id: string;
  label: string;
  selected: boolean;
  backgroundColor: string;
  registerNode: (element: HTMLDivElement | null) => void;
  children: ReactNode;
}

export function SortablePreviewBlock({
  id,
  label,
  selected,
  backgroundColor,
  registerNode,
  children,
}: Props) {
  const {
    setNodeRef,
    setActivatorNodeRef,
    attributes,
    listeners,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });
  const setRefs = useCallback(
    (element: HTMLDivElement | null) => {
      setNodeRef(element);
      registerNode(element);
    },
    [setNodeRef, registerNode]
  );

  return (
    <div
      ref={setRefs}
      data-preview-block-id={id}
      className={cn(
        'group/preview-block relative select-none',
        selected && 'cursor-grab',
        isDragging && 'z-50 cursor-grabbing shadow-xl ring-1 ring-primary'
      )}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        ...(isDragging ? { backgroundColor, opacity: 0.9 } : {}),
      }}
      onDragStart={event => event.preventDefault()}
      onMouseDown={event => {
        if (!canDragPreviewBlock(event.target)) return;
        listeners?.onMouseDown?.(event);
      }}
      onTouchStart={event => {
        if (!canDragPreviewBlock(event.target)) return;
        listeners?.onTouchStart?.(event);
      }}
    >
      {children}
      {selected && (
        <button
          ref={setActivatorNodeRef}
          type="button"
          {...attributes}
          {...listeners}
          aria-label={`${label} 순서 변경`}
          className="absolute top-2 right-2 z-10 flex size-8 items-center justify-center rounded-md border border-neutral-200 bg-white/95 text-neutral-500 opacity-0 shadow-sm transition-opacity group-hover/preview-block:opacity-100 focus-visible:opacity-100 cursor-grab active:cursor-grabbing"
        >
          <GripVertical size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
