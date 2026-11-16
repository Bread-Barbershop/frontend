'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

const FIELDS = [
  ['hallName', '예식장 이름'],
  ['hallAddress', '예식장 주소'],
  ['eventDate', '예식 날짜 · 시간'],
  ['groomName', '신랑 이름'],
  ['brideName', '신부 이름'],
  ['partnerCode', '제휴 코드 (선택)'],
] as const;

export function WreathBlock({ blockInfo, id }: { blockInfo: EditorBlock<'wreath'>; id: string }) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const props = blockInfo.props;
  const loadEventInfo = () => {
    const blocks = useEditorStore.getState().block;
    const place = blocks.find(b => b.component === 'place')?.props as EditorBlock<'place'>['props'] | undefined;
    const calendar = blocks.find(b => b.component === 'calendar')?.props as EditorBlock<'calendar'>['props'] | undefined;
    const couple = blocks.find(b => b.component === 'coupleIntroduction')?.props as EditorBlock<'coupleIntroduction'>['props'] | undefined;
    updateBlock(id, {
      hallName: place?.placeName || props.hallName,
      hallAddress: place?.placeAddress || props.hallAddress,
      eventDate: [calendar?.date, calendar?.time].filter(Boolean).join(' ') || props.eventDate,
      groomName: couple?.groom || props.groomName,
      brideName: couple?.bride || props.brideName,
    });
  };
  return (
    <LeftEditorWrapper ariaLabel="축하 화환" className="gap-3">
      <NavigationBar>축하 화환 편집</NavigationBar>
      <div className="flex flex-col gap-3 py-2">
        <label className="flex flex-col gap-1 text-sm">제목
          <input className="h-10 rounded-md border border-border-divider px-3" maxLength={60}
            value={props.title} onChange={e => updateBlock(id, { title: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1 text-sm">안내 방식
          <select className="h-10 rounded-md border border-border-divider px-3"
            value={props.mode} onChange={e => updateBlock(id, { mode: e.target.value })}>
            <option value="decline">정중히 사양</option>
            <option value="order">화환 주문 안내</option>
          </select>
        </label>
        <label className="flex flex-col gap-1 text-sm">{props.mode === 'order' ? '주문 안내 문구' : '사양 안내 문구'}
          <textarea className="min-h-24 rounded-md border border-border-divider p-3 text-sm" maxLength={500}
            value={props.mode === 'order' ? props.orderMessage : props.declineMessage}
            onChange={e => updateBlock(id, props.mode === 'order'
              ? { orderMessage: e.target.value } : { declineMessage: e.target.value })} />
        </label>
        {props.mode === 'order' && <>
          <button type="button" className="rounded-md border border-border-divider py-2 text-sm text-primary"
            onClick={loadEventInfo}>초대장 행사 정보 불러오기</button>
          {FIELDS.map(([key, label]) => (
            <label key={key} className="flex flex-col gap-1 text-sm">{label}
              <input className="h-10 min-w-0 rounded-md border border-border-divider px-3" maxLength={250}
                value={props[key]} onChange={e => updateBlock(id, { [key]: e.target.value })} />
            </label>
          ))}
          <p className="text-xs text-text-secondary">
            제휴사의 주문 연동 규격 확정 전까지는 업체 주문 안내 페이지로 이동하며,
            행사 정보 자동 입력은 보장되지 않습니다.
          </p>
        </>}
      </div>
    </LeftEditorWrapper>
  );
}
