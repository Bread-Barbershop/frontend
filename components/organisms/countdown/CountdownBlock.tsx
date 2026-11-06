'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

export function CountdownBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'countdown'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const { title, eventDateTime, onDayMessage, afterMessage } = blockInfo.props;
  const fields = [
    { name: 'title', label: '제목', value: title, max: 40 },
    { name: 'onDayMessage', label: '행사 당일 문구', value: onDayMessage, max: 100 },
    { name: 'afterMessage', label: '행사 종료 후 문구', value: afterMessage, max: 100 },
  ] as const;

  return (
    <LeftEditorWrapper ariaLabel="D-Day 카운트다운" className="gap-3">
      <NavigationBar>D-Day 카운트다운 편집</NavigationBar>
      <div className="flex w-full flex-col gap-4 py-2">
        <div className="flex flex-col gap-1">
          <label htmlFor={`countdown-event-${id}`} className="text-sm text-text-primary">행사 일시 (한국 시간)</label>
          <input
            id={`countdown-event-${id}`}
            type="datetime-local"
            value={eventDateTime || ''}
            onChange={event => updateBlock(id, { eventDateTime: event.currentTarget.value })}
            className="h-10 w-full rounded-md border border-border-divider px-3 text-sm text-text-primary outline-none focus:border-primary"
          />
        </div>
        {fields.map(field => (
          <div className="flex flex-col gap-1" key={field.name}>
            <label htmlFor={`countdown-${field.name}-${id}`} className="text-sm text-text-primary">{field.label}</label>
            <input
              id={`countdown-${field.name}-${id}`}
              value={field.value}
              maxLength={field.max}
              onChange={event => updateBlock(id, { [field.name]: event.currentTarget.value })}
              className="h-10 w-full rounded-md border border-border-divider px-3 text-sm text-text-primary outline-none focus:border-primary"
            />
          </div>
        ))}
        <p className="text-xs text-text-secondary">설정한 날짜를 기준으로 날짜 이전에는 카운트다운, 행사 당일에는 축하 문구, 다음 날부터는 감사 문구를 표시합니다.</p>
      </div>
    </LeftEditorWrapper>
  );
}
