import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import GuestRenderer from './GuestRenderer';

import type { NormalizedGuestPayload } from '../validation/parseGuestPayload';

const mockCalendarView = jest.fn((props: Record<string, unknown>) =>
  React.createElement(
    'div',
    { 'data-testid': 'calendar-view' },
    props.className
  )
);
const mockPictureView = jest.fn((props: Record<string, unknown>) =>
  React.createElement('div', { 'data-testid': 'picture-view' }, props.className)
);
const mockGuestbookView = jest.fn(() =>
  React.createElement('div', null, '축하 메시지 작성하기')
);
const mockSetTitleData = jest.fn();
const mockSetBodyData = jest.fn();
const mockResolveGuestFontFamiliesToPreload = jest.fn(() => [] as string[]);

jest.mock('next/navigation', () => ({
  usePathname: () => '/guest/data-json-file-id',
}));

jest.mock('@/shared/data/registry/registry', () => ({
  blockRegistry: {
    organizerInformation: { viewComponent: () => <p>주최사</p> },
    speakerInformation: { viewComponent: () => <p>연사정보</p> },
    myChild: { viewComponent: () => <p>아기소개</p> },
    interview: { viewComponent: () => <p>인터뷰</p> },
    calendar: {
      viewComponent: (props: Record<string, unknown>) =>
        mockCalendarView(props),
    },
    picture: {
      viewComponent: (props: Record<string, unknown>) => mockPictureView(props),
    },
    guestbook: { viewComponent: () => mockGuestbookView() },
    visualEffects: { viewComponent: () => <div data-testid="effect-block" /> },
  },
}));

jest.mock('@/components/molecules/scroll-fade-in/ScrollFadeIn', () => ({
  ScrollFadeIn: (props: {
    children: React.ReactNode;
    animationType: string;
    triggerMode: string;
    animationDurationMs: number;
    animationEasing: string;
  }) =>
    React.createElement(
      'div',
      {
        className: 'scroll-fade-in-item',
        'data-testid': 'scroll-animation',
        'data-animation-type': props.animationType,
        'data-trigger-mode': props.triggerMode,
        'data-duration-ms': props.animationDurationMs,
        'data-easing': props.animationEasing,
      },
      props.children
    ),
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: unknown) =>
    (selector as CallableFunction)({
      setTitleData: mockSetTitleData,
      setBodyData: mockSetBodyData,
    }),
}));

jest.mock('./guestFontPreload', () => ({
  resolveGuestFontFamiliesToPreload: () =>
    mockResolveGuestFontFamiliesToPreload(),
}));

const bulkData: NormalizedGuestPayload['bulkData'] = {
  backgroundColor: '#ffffff',
  titleData: {
    font: 'font-lineseed',
    fontSize: '20px',
    fontWeight: '700',
    color: '#111111',
    isDefault: false,
  },
  bodyData: {
    font: 'font-pretendard',
    fontSize: '16px',
    fontWeight: '400',
    color: '#222222',
    isDefault: false,
  },
  isZoom: false,
  scrollAnimation: {
    animationType: 'fade-up',
    triggerMode: 'down-only',
    animationDurationMs: 700,
    animationEasing: 'natural',
  },
};

describe('GuestRenderer', () => {
  it('빈 소개와 인터뷰는 발행 화면의 제목과 여백까지 숨기고 편집 화면에는 남긴다', () => {
    const blocks: NormalizedGuestPayload['blocks'] = [
      {
        id: 'o',
        type: 'seminar',
        component: 'organizerInformation',
        props: { title: '주최사', messageHtml: '<p>&nbsp;<br></p>' },
      },
      {
        id: 's',
        type: 'seminar',
        component: 'speakerInformation',
        props: { speakers: [{ id: 'blank', name: ' ', image: [] }] },
      },
      {
        id: 'c',
        type: 'firstBirthday',
        component: 'myChild',
        props: { title: '아기소개' },
      },
      {
        id: 'i',
        type: 'wedding',
        component: 'interview',
        props: { questions: [] },
      },
    ];
    const { rerender } = render(
      <GuestRenderer blocks={blocks} bulkData={bulkData} />
    );
    expect(screen.queryAllByTestId('scroll-animation')).toHaveLength(0);
    rerender(
      <GuestRenderer blocks={blocks} bulkData={bulkData} isGuestPage={false} />
    );
    expect(screen.getAllByTestId('scroll-animation')).toHaveLength(4);
  });

  it('사진, 본문, 생일 중 하나만 있어도 표시하고 개인정보 안내도 유지한다', () => {
    const blocks: NormalizedGuestPayload['blocks'] = [
      {
        id: 'o',
        type: 'seminar',
        component: 'organizerInformation',
        props: {
          messageJson: {
            type: 'doc',
            content: [
              {
                type: 'paragraph',
                content: [{ type: 'text', text: '운영팀' }],
              },
            ],
          },
        },
      },
      {
        id: 's',
        type: 'seminar',
        component: 'speakerInformation',
        props: { speakers: [{ image: ['/speaker.jpg'] }] },
      },
      {
        id: 'c',
        type: 'firstBirthday',
        component: 'myChild',
        props: { birthday: '2026.05.22' },
      },
      {
        id: 'hidden',
        type: 'firstBirthday',
        component: 'myChild',
        props: {},
        privacyMediaHidden: true,
      },
    ];
    render(<GuestRenderer blocks={blocks} bulkData={bulkData} />);
    expect(screen.getAllByTestId('scroll-animation')).toHaveLength(4);
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockResolveGuestFontFamiliesToPreload.mockReturnValue([]);
  });

  it('저장된 방명록 데이터는 삭제하지 않고 공개 화면에서 비활성화한다', () => {
    const blocks = [
      {
        id: 'saved-guestbook',
        type: 'wedding',
        component: 'guestbook',
        props: { formUrl: 'https://forms.gle/saved-form' },
      },
      { id: 'picture', type: 'wedding', component: 'picture', props: {} },
    ] as NormalizedGuestPayload['blocks'];
    const before = JSON.stringify(blocks);
    render(<GuestRenderer blocks={blocks} bulkData={bulkData} />);
    expect(mockGuestbookView).not.toHaveBeenCalled();
    expect(screen.queryByText('축하 메시지 작성하기')).not.toBeInTheDocument();
    expect(screen.getByTestId('picture-view')).toBeInTheDocument();
    expect(JSON.stringify(blocks)).toBe(before);
  });

  it('오래된 효과 블록이 중복되어도 한 봉투를 열고 컨페티를 한 번 재생한다', () => {
    HTMLDialogElement.prototype.showModal = function () {
      this.setAttribute('open', '');
    };
    HTMLDialogElement.prototype.close = function () {
      this.removeAttribute('open');
    };
    const blocks: NormalizedGuestPayload['blocks'] = [
      {
        id: 'old-effect-1',
        type: 'wedding',
        component: 'visualEffects',
        props: { effect: 'confetti', showEnvelopeIntro: true },
      },
      {
        id: 'old-effect-2',
        type: 'wedding',
        component: 'visualEffects',
        props: { effect: 'confetti', showEnvelopeIntro: true },
      },
      { id: 'picture', type: 'wedding', component: 'picture', props: {} },
    ];
    render(
      <GuestRenderer
        bulkData={{ ...bulkData, invitationEffects: { confetti: true } }}
        blocks={blocks}
      />
    );

    const cover = screen.getByRole('dialog', { name: '초대장 열기' });
    expect(screen.getAllByTestId('scroll-animation')).toHaveLength(1);
    expect(document.querySelector('.invia-effect-layer')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: '초대장 열기' }));
    fireEvent.animationEnd(cover);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    const bursts = document.querySelectorAll('.invia-effect-burst');
    expect(bursts).toHaveLength(1);
    fireEvent.animationEnd(bursts[0]);
    expect(document.querySelector('.invia-effect-layer')).toBeNull();
  });

  it('바로 시작하고 축하 효과를 켜면 첫 화면에서 컨페티를 재생한다', () => {
    render(
      <GuestRenderer
        bulkData={{
          ...bulkData,
          invitationEffects: { opening: 'direct', confetti: true },
        }}
        blocks={[]}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.querySelectorAll('.invia-effect-burst')).toHaveLength(1);
  });

  it('전체 스타일에서 기존 봉투와 컨페티를 끄면 저장된 눈 내림은 유지한다', () => {
    const blocks: NormalizedGuestPayload['blocks'] = [
      {
        id: 'old-effect',
        type: 'wedding',
        component: 'visualEffects',
        props: { effect: 'confetti', showEnvelopeIntro: true },
      },
      {
        id: 'old-snow',
        type: 'wedding',
        component: 'visualEffects',
        props: { effect: 'snow', effectSpeed: 2, motionEasing: 'linear' },
      },
    ];
    render(
      <GuestRenderer
        bulkData={{
          ...bulkData,
          invitationEffects: { opening: 'direct', confetti: false },
        }}
        blocks={blocks}
      />
    );

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(document.querySelector('.invia-effect-confetti')).toBeNull();
    expect(document.querySelector('.invia-effect-snow')).toBeInTheDocument();
    expect(document.querySelector('.invia-effect-layer')).toHaveStyle({
      '--motion-easing': 'linear',
    });
  });

  it('passes isGuestPage only to guest-aware preview components', async () => {
    const calendarBlock = {
      id: 'calendar-block',
      type: 'wedding',
      component: 'calendar',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];
    const pictureBlock = {
      id: 'picture-block',
      type: 'wedding',
      component: 'picture',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];

    render(
      <GuestRenderer
        blocks={[calendarBlock, pictureBlock]}
        bulkData={bulkData}
      />
    );

    await waitFor(() => {
      expect(mockCalendarView).toHaveBeenCalled();
      expect(mockPictureView).toHaveBeenCalled();
    });

    expect(mockCalendarView.mock.calls[0][0]).toHaveProperty(
      'isGuestPage',
      true
    );
    expect(mockPictureView.mock.calls[0][0]).toHaveProperty(
      'isGuestPage',
      true
    );
  });

  it('본문을 바로 표시하고 선택한 글꼴의 굵기는 브라우저가 필요할 때 불러온다', () => {
    mockResolveGuestFontFamiliesToPreload.mockReturnValue(['고운 바탕']);

    const pictureBlock = {
      id: 'picture-block',
      type: 'wedding',
      component: 'picture',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];
    const { container } = render(
      <GuestRenderer blocks={[pictureBlock]} bulkData={bulkData} />
    );

    expect(screen.getByTestId('picture-view')).toBeInTheDocument();
    const rules = container.querySelector('style')?.textContent;
    expect(rules).toContain('GowunBatang-Regular.ttf');
    expect(rules).toContain('GowunBatang-Bold.ttf');
    expect(rules).not.toContain('NotoSansKR');
    expect(container.firstElementChild).not.toHaveStyle({ opacity: '0' });
  });

  it('블록별 legacy 설정을 무시하고 모든 블록에 공통 설정을 적용한다', () => {
    const sharedAnimation = {
      animationType: 'fade-down',
      triggerMode: 'down-repeat',
      animationDurationMs: 1300,
      animationEasing: 'soft',
    } as const;
    const block = {
      id: 'styled-picture',
      type: 'wedding',
      component: 'picture',
      props: {
        collectionStyle: 'showcase-11',
        animationType: 'none',
        triggerMode: 'both',
        animationDurationMs: 200,
      },
    } as NormalizedGuestPayload['blocks'][number];
    const newBlock = {
      id: 'new-picture',
      type: 'wedding',
      component: 'picture',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];
    render(
      <GuestRenderer
        blocks={[block, newBlock]}
        bulkData={{ ...bulkData, scrollAnimation: sharedAnimation }}
      />
    );
    const chapter = screen.getAllByTestId('picture-view')[0].closest('section');
    expect(chapter).toHaveAttribute('data-design', 'showcase-11');
    expect(screen.getAllByTestId('picture-view')).toHaveLength(2);
    const wrappers = screen.getAllByTestId('scroll-animation');
    expect(wrappers).toHaveLength(2);
    wrappers.forEach(wrapper => {
      expect(wrapper).toHaveAttribute('data-animation-type', 'fade-down');
      expect(wrapper).toHaveAttribute('data-trigger-mode', 'down-repeat');
      expect(wrapper).toHaveAttribute('data-duration-ms', '1300');
      expect(wrapper).toHaveAttribute('data-easing', 'soft');
    });
  });

  it('등록되지 않은 폰트가 저장된 경우에도 초대장 본문을 표시한다', async () => {
    mockResolveGuestFontFamiliesToPreload.mockReturnValue(['unknown-font']);

    const pictureBlock = {
      id: 'picture-block',
      type: 'wedding',
      component: 'picture',
      props: {},
    } as NormalizedGuestPayload['blocks'][number];
    const { container } = render(
      <GuestRenderer blocks={[pictureBlock]} bulkData={bulkData} />
    );

    expect(await screen.findByTestId('picture-view')).toBeInTheDocument();
    expect(container.firstElementChild).not.toHaveStyle({ opacity: '0' });
  });
});
