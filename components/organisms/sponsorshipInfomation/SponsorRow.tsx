import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2 } from 'lucide-react';
import { useId, useRef } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Image } from '@/components/atoms/image';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

import type { SponsorEntry } from './sponsorEntries';

interface Props {
  sponsor: SponsorEntry;
  focusName: boolean;
  position: number;
  onNameChange: (name: string) => void;
  onPick: (files: File[]) => void;
  onClear: () => void;
  onRemove: () => void;
  onMove: (offset: number) => void;
}

export function SponsorRow({
  sponsor,
  focusName,
  position,
  onNameChange,
  onPick,
  onClear,
  onRemove,
  onMove,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const nameId = useId();
  const src = useResolvedImageSource(sponsor.logo);
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
  } = useSortable({ id: sponsor.id });
  const label = sponsor.name.trim() || `후원사 ${position}`;

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="flex flex-col gap-2 border-b border-border-divider py-3"
    >
      <div className="flex items-center gap-1">
        <label className="flex-1 text-sm font-medium" htmlFor={nameId}>
          후원사 이름
        </label>
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
              onMove(event.key === 'ArrowUp' ? -1 : 1);
            }
          }}
        >
          <GripVertical size={16} />
        </button>
        <UtilityButton
          variant="danger"
          aria-label={`${label} 항목 삭제`}
          onClick={onRemove}
        >
          <Trash2 size={15} />
        </UtilityButton>
      </div>
      <input
        type="text"
        autoFocus={focusName}
        id={nameId}
        className="w-full rounded-md border border-border-divider px-3 py-2 text-sm"
        placeholder="예: 한빛재단"
        value={sponsor.name}
        onChange={event => onNameChange(event.target.value)}
      />
      <div className="flex flex-wrap items-center gap-2">
        <input
          ref={fileInput}
          type="file"
          accept="image/*"
          multiple={!sponsor.logo}
          hidden
          onChange={event => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = '';
            if (files.length) onPick(files);
          }}
        />
        <button
          type="button"
          className="inline-flex min-h-10 items-center gap-2 rounded-md border border-border-divider px-3 py-1 text-sm"
          onClick={() => fileInput.current?.click()}
        >
          {src ? (
            <span className="block h-8 w-12">
              <Image
                src={src}
                alt=""
                fill
                className="object-contain"
                sizes="48px"
              />
            </span>
          ) : (
            <Plus size={15} aria-hidden="true" />
          )}
          {sponsor.logo ? '로고 변경' : '로고 등록'}
        </button>
        {sponsor.logo && (
          <UtilityButton onClick={onClear}>로고 삭제</UtilityButton>
        )}
      </div>
    </li>
  );
}
