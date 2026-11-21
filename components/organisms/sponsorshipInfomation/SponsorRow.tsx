import { useId } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { Image } from '@/components/atoms/image';
import { Label } from '@/components/atoms/label';
import { PictureInput } from '@/components/atoms/picture';
import { SortableEditorRow } from '@/features/DndKit/Sort/SortableEditorRow';
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
  const nameId = useId();
  const logoId = useId();
  const src = useResolvedImageSource(sponsor.logo);
  const label = sponsor.name.trim() || `후원사 ${position}`;

  return (
    <SortableEditorRow
      id={sponsor.id}
      label={label}
      removeLabel={`${label} 항목 삭제`}
      heading={
        <label className="text-sm font-medium" htmlFor={nameId}>
          후원사 이름
        </label>
      }
      onMove={onMove}
      onRemove={onRemove}
      className="flex flex-col gap-2 border-b border-border-divider py-3"
    >
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
        <Label htmlFor={logoId} className="shrink-0 text-center font-semibold">
          로고
        </Label>
        <PictureInput
          id={logoId}
          aria-label={sponsor.logo ? '로고 변경' : '로고 등록'}
          multiple={!sponsor.logo}
          onChange={event => {
            const files = Array.from(event.target.files ?? []);
            event.target.value = '';
            if (files.length) onPick(files);
          }}
        >
          {src ? (
            <Image
              src={src}
              alt=""
              fill
              className="object-contain"
              sizes="60px"
            />
          ) : undefined}
        </PictureInput>
        {sponsor.logo && (
          <UtilityButton onClick={onClear}>로고 삭제</UtilityButton>
        )}
      </div>
    </SortableEditorRow>
  );
}
