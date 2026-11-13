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
  const setField = (
    key: 'title' | 'description' | 'buttonText' | 'formUrl',
    value: string
  ) => updateBlock(id, { [key]: value });

  return (
    <LeftEditorWrapper ariaLabel="참석 여부" className="gap-3">
      <NavigationBar>참석 여부 편집</NavigationBar>
      <div className="flex w-full flex-col gap-4 py-2">
        {(
          [
            { key: 'title', label: '제목', value: title, maxLength: 40 },
            {
              key: 'description',
              label: '참석 안내 문구',
              value: description,
              maxLength: 250,
            },
            {
              key: 'buttonText',
              label: '버튼 문구',
              value: buttonText,
              maxLength: 40,
            },
            {
              key: 'formUrl',
              label: 'Google 설문 응답 링크',
              value: formUrl,
              maxLength: 2048,
            },
          ] as const
        ).map(field => (
          <label
            key={field.key}
            className="flex flex-col gap-1 text-sm text-text-primary"
          >
            {field.label}
            <input
              value={field.value ?? ''}
              maxLength={field.maxLength}
              onChange={event => setField(field.key, event.currentTarget.value)}
              placeholder={
                field.key === 'formUrl'
                  ? 'https://forms.gle/...'
                  : '내용을 입력해주세요'
              }
              className="h-10 min-w-0 rounded-md border border-border-divider px-3 text-sm outline-none focus:border-primary"
            />
          </label>
        ))}
        {formUrl && !validFormUrl && (
          <p role="alert" className="text-xs text-red-600">
            응답자용 Google Forms HTTPS 링크를 입력해 주세요.
          </p>
        )}
        <div className="rounded-md bg-[#FAFAFB] p-3 text-xs leading-relaxed text-text-secondary">
          <p>Google Forms에서 응답자용 링크를 복사해 입력하세요.</p>
          <p className="mt-2">
            응답은 주최자가 관리하는 Google 계정의 설문에 제출됩니다. 응답
            권한과 스프레드시트 저장은 주최자 설정에 따라 달라집니다. 익명
            응답을 받으려면 시크릿 창에서 로그인 없이 설문을 열고 직접 제출해
            보세요. 시트에 응답을 누적하려면 Google Forms의 [응답] 탭에서
            스프레드시트를 연결하고, 테스트 제출 후 Forms 응답과 시트에 새 행이
            추가되었는지 확인하세요.
          </p>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}
