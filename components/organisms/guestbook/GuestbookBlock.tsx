'use client';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { safeRsvpFormUrl } from '../rsvp/rsvpFormUrl';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

const FIELDS = [
  ['title', '제목', 60],
  ['description', '축하 메시지 안내 문구', 300],
  ['buttonText', '버튼 문구', 50],
  ['formUrl', 'Google Forms 응답자용 링크', 2048],
] as const;

export function GuestbookBlock({ blockInfo, id }: { blockInfo: EditorBlock<'guestbook'>; id: string }) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const { formUrl } = blockInfo.props;
  return (
    <LeftEditorWrapper ariaLabel="디지털 방명록" className="gap-3">
      <NavigationBar>디지털 방명록 편집</NavigationBar>
      <div className="flex flex-col gap-4 py-2">
        {FIELDS.map(([key, label, limit]) => (
          <label key={key} className="flex flex-col gap-1 text-sm">{label}
            <input className="h-10 min-w-0 rounded-md border border-border-divider px-3"
              value={blockInfo.props[key]} maxLength={limit}
              placeholder={key === 'formUrl' ? 'https://forms.gle/...' : '내용을 입력해 주세요'}
              onChange={e => updateBlock(id, { [key]: e.target.value })} />
          </label>
        ))}
        {formUrl && !safeRsvpFormUrl(formUrl) && (
          <p role="alert" className="text-xs text-red-600">
            응답자용 Google Forms HTTPS 링크를 사용해 주세요. 편집/관리 링크는 지원하지 않습니다.
          </p>
        )}
        <p className="rounded-md bg-[#FAFAFB] p-3 text-xs leading-relaxed text-text-secondary">
          이름과 축하 메시지를 받는 Google Forms 설문을 만든 뒤 [응답] 탭에서 스프레드시트를
          연결해 주세요. 실제 응답은 주최자 Google 계정의 Forms에 제출되고 연결된 Sheets에
          한 행씩 쌓입니다. 로그인 없는 제출 가능 여부를 시크릿 창에서 확인해 주세요.
          이 블록은 응답을 공개하거나 서비스 서버에 별도 저장하지 않습니다.
        </p>
      </div>
    </LeftEditorWrapper>
  );
}
