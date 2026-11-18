import { fireEvent, render, screen, within } from '@testing-library/react';
import { createRef } from 'react';

import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { resolveInvitationEffects } from '@/shared/utils/invitationEffects';
import type { BlockType } from '@/shared/types/editor';

import { AfterPartyPreview } from './afterParty/AfterPartyPreview';
import { FaqPreview } from './faq/FaqPreview';
import { GuestbookPreview } from './guestbook/GuestbookPreview';
import { InvitationVisualEffects } from './visualEffects/VisualEffectsPreview';

function persisted<T extends BlockType>(
  component: T,
  overrides: Record<string, unknown>
): EditorBlock<T> {
  useEditorStore
    .getState()
    .addBlock('wedding', component, `saved-${component}`);
  const block = useEditorStore
    .getState()
    .block.find(item => item.component === component)!;
  const restored = normalizeGuestBlock(
    JSON.parse(
      JSON.stringify({ ...block, props: { ...block.props, ...overrides } })
    ),
    0
  );
  if (!restored.ok) throw new Error('Stored block could not be restored');
  return restored.block as unknown as EditorBlock<T>;
}

describe('신규 블록의 추가·저장 데이터·공개 화면 연결', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
  });
  afterEach(() => useEditorStore.getState().reset());

  it('FAQ 답변을 저장하고 다시 열면 아코디언에서 읽을 수 있고 미작성 답변은 공개하지 않는다', () => {
    const block = persisted('faq', {
      items: [
        {
          question: '주차는 어디에 하나요?',
          answer: '지하 2층에 주차해 주세요.',
        },
        { question: '작성 중인 질문', answer: '' },
      ],
    });
    render(<FaqPreview blockInfo={block} isGuestPage />);
    const question = screen.getByText('주차는 어디에 하나요?');
    fireEvent.click(question);
    expect(question.closest('details')).toHaveAttribute('open');
    expect(screen.getByText('지하 2층에 주차해 주세요.')).toBeVisible();
    expect(screen.queryByText('작성 중인 질문')).not.toBeInTheDocument();
    expect(screen.queryByText('답변을 작성해 주세요.')).not.toBeInTheDocument();
  });

  it('피로연의 별도 일정과 장소를 복원하고 검증된 지도 링크로 연결한다', () => {
    const block = persisted('afterParty', {
      venue: '인비아 라운지',
      dateTime: '2026-12-20T18:00',
      mapUrl: 'https://map.naver.com/p/entry/place/123',
    });
    const view = render(<AfterPartyPreview blockInfo={block} isGuestPage />);
    expect(screen.getByText('인비아 라운지')).toBeVisible();
    expect(screen.getByText('2026-12-20 18:00')).toBeVisible();
    expect(screen.getByRole('link', { name: '위치 확인하기' })).toHaveAttribute(
      'href',
      'https://map.naver.com/p/entry/place/123'
    );
    view.rerender(
      <AfterPartyPreview
        blockInfo={{
          ...block,
          props: { ...block.props, mapUrl: 'javascript:alert(1)' },
        }}
        isGuestPage
      />
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('방명록은 등록된 Google Forms 응답 링크를 복원하며 편집·악성 링크는 공개하지 않는다', () => {
    const block = persisted('guestbook', {
      formUrl: 'https://docs.google.com/forms/d/e/test-form/viewform',
    });
    const view = render(<GuestbookPreview blockInfo={block} isGuestPage />);
    expect(
      screen.getByRole('link', { name: '축하 메시지 작성하기' })
    ).toHaveAttribute('href', block.props.formUrl);
    view.rerender(
      <GuestbookPreview
        blockInfo={{
          ...block,
          props: {
            ...block.props,
            formUrl: 'https://docs.google.com/forms/d/test-form/edit',
          },
        }}
        isGuestPage
      />
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
    view.rerender(
      <GuestbookPreview
        blockInfo={{
          ...block,
          props: { ...block.props, formUrl: 'javascript:alert(1)' },
        }}
        isGuestPage
      />
    );
    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });

  it('기본 배경 효과는 초대장을 가리지 않고 사용자가 선택한 경우에만 오프닝을 표시한다', () => {
    const block = persisted('visualEffects', {});
    const view = render(
      <InvitationVisualEffects
        effects={resolveInvitationEffects(undefined, [block])}
      />
    );
    expect(
      screen.queryByRole('dialog', { name: '초대장 열기' })
    ).not.toBeInTheDocument();
    view.rerender(
      <InvitationVisualEffects
        effects={resolveInvitationEffects(undefined, [
          {
            ...block,
            props: { ...block.props, showEnvelopeIntro: true },
          },
        ])}
      />
    );
    const dialog = screen.getByRole('dialog', { name: '초대장 열기' });
    fireEvent.click(screen.getByRole('button', { name: '초대장 열기' }));
    fireEvent.animationEnd(dialog);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('화면에 삽입한 미리보기에서는 초대장 영역 내부에서만 봉투를 연다', () => {
    const contentRef = createRef<HTMLDivElement>();
    render(
      <section aria-label="휴대폰 화면">
        <div ref={contentRef}>초대장 내용</div>
        <InvitationVisualEffects
          effects={resolveInvitationEffects(
            { opening: 'envelope', confetti: true },
            []
          )}
          scope="frame"
          contentRef={contentRef}
        />
      </section>
    );

    const frame = screen.getByRole('region', { name: '휴대폰 화면' });
    const cover = within(frame).getByRole('dialog', { name: '초대장 열기' });
    expect(contentRef.current).toHaveAttribute('inert');
    fireEvent.click(within(frame).getByRole('button', { name: '초대장 열기' }));
    fireEvent.animationEnd(cover);

    expect(contentRef.current).not.toHaveAttribute('inert');
    expect(frame.querySelector('.invia-effect-burst')).toBeInTheDocument();
  });

  it('저장한 배경 속도와 부드러움을 공개 효과와 오프닝에 함께 적용한다', () => {
    const block = persisted('visualEffects', {
      effect: 'petals',
      effectSpeed: 0.5,
      motionEasing: 'soft',
      showEnvelopeIntro: true,
    });
    const view = render(
      <InvitationVisualEffects
        effects={resolveInvitationEffects(undefined, [block])}
      />
    );
    const layer = document.querySelector('.invia-effect-layer') as HTMLElement;
    const particle = document.querySelector(
      '.invia-effect-particle'
    ) as HTMLElement;
    const slowDuration = parseFloat(
      particle.style.getPropertyValue('--duration')
    );
    expect(layer.style.getPropertyValue('--motion-easing')).toBe('ease-in-out');
    expect(particle.textContent).toBe('');
    expect(screen.getByRole('dialog', { name: '초대장 열기' })).toHaveStyle({
      '--intro-duration': '2.4s',
    });
    view.rerender(
      <InvitationVisualEffects
        effects={resolveInvitationEffects(undefined, [
          {
            ...block,
            props: { ...block.props, effectSpeed: 2 },
          },
        ])}
      />
    );
    expect(
      parseFloat(particle.style.getPropertyValue('--duration'))
    ).toBeCloseTo(slowDuration / 4);
    expect(screen.getByRole('dialog', { name: '초대장 열기' })).toHaveStyle({
      '--intro-duration': '0.6s',
    });
  });
});
