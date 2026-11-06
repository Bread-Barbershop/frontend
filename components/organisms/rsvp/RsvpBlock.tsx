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
    <LeftEditorWrapper ariaLabel="참석 여부 RSVP" className="gap-3">
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
            Google Forms 전용 HTTPS 링크를 입력해주세요.
          </p>
        )}
        <div className="rounded-md bg-[#FAFAFB] p-3 text-xs leading-relaxed text-text-secondary">
          <p>
            Google Forms에서 응답자용 링크를 복사해 입력하세요. /edit,
            /responses, /create가 포함된 관리 링크는 사용할 수 없습니다.
          </p>
          <p className="mt-2">
            익명 응답을 받으려면 시크릿 창에서 로그인 없이 열고 제출할 수 있는지
            확인하세요. 응답을 스프레드시트에 저장하려면 Google Forms의 [응답]
            탭에서 시트를 연결한 뒤, 테스트 제출로 Forms 응답과 시트에 새 행이
            추가되는지 확인하세요. 앱은 실제 응답 권한이나 시트 저장 상태를
            검증하지 않습니다.
          </p>
        </div>
      </div>
    </LeftEditorWrapper>
  );
}
