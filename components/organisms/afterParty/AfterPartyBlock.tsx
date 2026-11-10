'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { safeNavigationUrl } from '../transportation/navigationUrl';

type Key = keyof EditorBlock<'afterParty'>['props'];
const FIELDS = [
  ['title', '제목', 60],
  ['venue', '장소명', 100],
  ['address', '주소', 250],
  ['dateTime', '일시', 80],
  ['description', '안내 문구', 500],
  ['feeInfo', '회비 및 식사 안내', 250],
  ['attendanceNote', '참석 안내', 250],
  ['mapUrl', '지도 링크 (HTTPS)', 2048],
] as const;

export function AfterPartyBlock({ blockInfo, id }: { blockInfo: EditorBlock<'afterParty'>; id: string }) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  return (
    <LeftEditorWrapper ariaLabel="피로연 및 애프터파티" className="gap-3">
      <NavigationBar>피로연 · 애프터파티 편집</NavigationBar>
      <div className="flex flex-col gap-4 py-2">
        {FIELDS.map(([key, label, limit]) => (
          <label key={key} className="flex flex-col gap-1 text-sm">
            {label}
            <input className="h-10 min-w-0 rounded-md border border-border-divider px-3 text-sm"
              maxLength={limit} value={blockInfo.props[key] ?? ''}
              placeholder={key === 'mapUrl' ? 'https://map.naver.com/...' : '내용을 입력해 주세요'}
              onChange={e => updateBlock(id, { [key as Key]: e.target.value })} />
            {key === 'mapUrl' && blockInfo.props.mapUrl && !safeNavigationUrl(blockInfo.props.mapUrl) && (
              <span role="alert" className="text-xs text-red-600">지원되는 지도 서비스의 HTTPS 링크를 등록해 주세요.</span>
            )}
          </label>
        ))}
      </div>
    </LeftEditorWrapper>
  );
}
