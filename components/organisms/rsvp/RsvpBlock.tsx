'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { safeRsvpFormUrl } from './rsvpFormUrl';

export function RsvpBlock({
  blockInfo,
  id,
}: {
  blockInfo: EditorBlock<'rsvp'>;
  id: string;
}) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const { title, description, buttonText, formUrl } = blockInfo.props;
  const validFormUrl = safeRsvpFormUrl(formUrl);
  const setField = (key: 'title' | 'description' | 'buttonText' | 'formUrl', value: string) =>
    updateBlock(id, { [key]: value });

  return (
    <LeftEditorWrapper ariaLabel="참석 여부 RSVP" className="gap-3">
      <NavigationBar>참석 여부 편집</NavigationBar>
      <div className="flex w-full flex-col gap-4 py-2">
        {([
          { key: 'title', label: '제목', value: title, maxLength: 40 },
          { key: 'description', label: '참석 안내 문구', value: description, maxLength: 250 },
          { key: 'buttonText', label: '버튼 문구', value: buttonText, maxLength: 40 },
          { key: 'formUrl', label: 'Google 설문 응답 링크', value: formUrl, maxLength: 2048 },
        ] as const).map(field => (
          <label key={field.key} className="flex flex-col gap-1 text-sm text-text-primary">
            {field.label}
            <input
              value={field.value ?? ''}
              maxLength={field.maxLength}
              onChange={event => setField(field.key, event.currentTarget.value)}
              placeholder={field.key === 'formUrl' ? 'https://forms.gle/...' : '내용을 입력해주세요'}
              className="h-10 min-w-0 rounded-md border border-border-divider px-3 text-sm outline-none focus:border-primary"
            />
          </label>
        ))}
        {formUrl && !validFormUrl && (
          <p role="alert" className="text-xs text-red-600">Google Forms 전용 HTTPS 링크를 입력해주세요.</p>
        )}
        <div className="rounded-md bg-[#FAFAFB] p-3 text-xs leading-relaxed text-text-secondary">
          Google Forms에서 참석 여부·식사 여부 등 질문을 만든 뒤, 설문의 [응답] 메뉴에서 Google 스프레드시트를 연결해주세요.
          이 블록은 하객을 Google 설문으로 이동시키며, 응답 정보는 주최자가 관리하는 Google 계정에 수집됩니다.
        </div>
      </div>
    </LeftEditorWrapper>
  );
}
