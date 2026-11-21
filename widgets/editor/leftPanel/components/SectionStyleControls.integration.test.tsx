import { readFileSync } from 'node:fs';
import { join } from 'node:path';

import {
  act,
  fireEvent,
  render,
  renderHook,
  screen,
} from '@testing-library/react';

import { useInitData } from '@/app/editor/[id]/hooks/useInitData';
import type { SavedData } from '@/app/editor/[id]/types/savedata';
import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';
import calendarStyles from '@/components/organisms/calendar/calendarPreview.module.css';
import InvitationChapter from '@/components/organisms/invitation-chapter/InvitationChapter';
import {
  createPreviewSnapshot,
  parsePreviewSnapshot,
} from '@/features/invitation/preview/previewSnapshot';
import { createInvitationTemplate } from '@/shared/data/invitationTemplates';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import BulkEdit from './BulkEdit';
import { SectionStyleControls } from './SectionStyleControls';

jest.mock('@/shared/assets/icons/sectionArrow.svg', () => () => null);

jest.mock('@/shared/data/invitationTemplates/originalPosterLoader', () => ({
  loadOriginalPosterJson: async () => ({ version: '7.2.0', objects: [] }),
}));
jest.mock('next/navigation', () => ({ usePathname: () => '/guest/test' }));
jest.mock('@/shared/fonts/fontLoader', () => ({
  preloadFontFamilyWeights: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('@/components/molecules/text-editor/utils/tiptapJsonToHtml', () => {
  const actual = jest.requireActual<
    typeof import('@/components/molecules/text-editor/utils/tiptapJsonToHtml')
  >('@/components/molecules/text-editor/utils/tiptapJsonToHtml');

  return {
    ...actual,
    tiptapJsonToHtmlInBrowser: actual.tiptapJsonToHtmlUniversal,
  };
});
jest.mock('./TitleEdit', () => ({ __esModule: true, default: () => null }));
jest.mock('./BodyEdit', () => ({ __esModule: true, default: () => null }));
jest.mock('./BackGroundColorEdit', () => ({
  __esModule: true,
  default: () => null,
}));

describe('템플릿과 추가 블록의 공통 카드 디자인', () => {
  beforeEach(() => useEditorStore.getState().reset());
  afterEach(() => act(() => useEditorStore.getState().reset()));

  it('카드 설정을 접으면 입력을 막고 다시 열면 같은 설정을 사용할 수 있다', () => {
    useEditorStore.getState().addBlock('wedding', 'gallery', 'photos');
    render(<SectionStyleControls selectedId="photos" />);
    const toggle = screen.getByRole('button', { name: '카드 디자인 · 등장 효과' });
    const panel = document.getElementById(toggle.getAttribute('aria-controls')!);

    fireEvent.click(toggle);
    const effect = screen.getByRole('combobox', { name: '이 블록의 등장 효과' });
    fireEvent.click(toggle);
    expect(panel).toContainElement(effect);
    expect(panel).toHaveAttribute('inert');
    expect(screen.queryByRole('combobox', { name: '이 블록의 등장 효과' })).toBeNull();

    fireEvent.click(toggle);
    expect(panel).not.toHaveAttribute('inert');
    expect(screen.getByRole('combobox', { name: '이 블록의 등장 효과' })).toBe(effect);
  });

  it('새 블록에 초대장 스타일을 적용하고 개별 변경과 상속 복원을 저장 전 미리보기에 반영한다', async () => {
    const prepared = await createInvitationTemplate('showcase-21');
    act(() => {
      useEditorStore.setState({
        block: prepared.blocks.filter(block => block.component === 'greeting'),
        backgroundColor: prepared.backgroundColor,
        titleData: prepared.titleData,
        bodyData: prepared.bodyData,
        sectionStyle: prepared.sectionStyle,
      });
      useEditorStore.getState().addBlock('firstBirthday', 'faq', 'added-faq');
      useEditorStore.getState().updateBlock('added-faq', {
        title: '추가한 질문',
        items: [
          {
            question: '새 질문도 수정할 수 있나요?',
            answer: '네, 같은 편집기를 사용합니다.',
          },
        ],
      });
    });
    const controls = render(
      <>
        <BulkEdit />
        <SectionStyleControls selectedId="added-faq" />
      </>
    );
    expect(screen.getByLabelText('기본 카드 스타일')).toHaveValue('paper');
    fireEvent.click(
      screen.getByRole('button', { name: '카드 디자인 · 등장 효과', expanded: false })
    );
    expect(screen.getByLabelText('이 블록의 카드 스타일')).toHaveValue('');

    fireEvent.change(screen.getByLabelText('기본 카드 스타일'), {
      target: { value: 'rounded' },
    });
    const inherited = createPreviewSnapshot('data:image/png;base64,test');
    const guest = render(<GuestRenderer {...inherited.snapshot.payload} />);
    expect(
      screen.getByText('추가한 질문').closest('[data-section-style]')
    ).toHaveAttribute('data-section-style', 'rounded');
    expect(
      screen.getByText('네, 같은 편집기를 사용합니다.')
    ).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText('이 블록의 카드 스타일'), {
      target: { value: 'outlined' },
    });
    const custom = createPreviewSnapshot('data:image/png;base64,test');
    const restored = parsePreviewSnapshot(
      JSON.parse(JSON.stringify(custom.snapshot))
    );
    expect(restored).not.toBeNull();
    guest.rerender(<GuestRenderer {...restored!.payload} />);
    expect(
      screen.getByText('추가한 질문').closest('[data-section-style]')
    ).toHaveAttribute('data-section-style', 'outlined');
    expect(restored!.payload.bulkData.sectionStyle).toBe('rounded');

    fireEvent.change(screen.getByLabelText('이 블록의 카드 스타일'), {
      target: { value: '' },
    });
    const reset = createPreviewSnapshot('data:image/png;base64,test');
    guest.rerender(<GuestRenderer {...reset.snapshot.payload} />);
    expect(
      screen.getByText('추가한 질문').closest('[data-section-style]')
    ).toHaveAttribute('data-section-style', 'rounded');
    inherited.dispose();
    custom.dispose();
    reset.dispose();
    controls.unmount();
  });

  it('기본 스타일은 모든 블록을 지운 뒤 추가해도 유지하고 저장 데이터 로딩과 초기화에서 복원한다', async () => {
    const prepared = await createInvitationTemplate('showcase-21');
    const { result, rerender } = renderHook(
      ({ bulkData }) =>
        useInitData({
          savedData: { bulkData } as SavedData,
          uuid: '',
          invitationFolderId: '',
        }),
      {
        initialProps: {
          bulkData: {
            ...prepared,
            isZoom: false,
          },
        },
      }
    );
    act(() => result.current.initBulkData());
    expect(useEditorStore.getState().sectionStyle).toBe('paper');
    act(() => {
      useEditorStore.getState().setBlock([]);
      useEditorStore.getState().addBlock('wedding', 'place', 'after-delete');
    });
    const preview = createPreviewSnapshot('data:image/png;base64,test');
    expect(preview.snapshot.payload.bulkData.sectionStyle).toBe('paper');
    preview.dispose();
    rerender({
      bulkData: {
        ...prepared,
        sectionStyle: undefined,
        isZoom: false,
      },
    });
    act(() => result.current.initBulkData());
    expect(useEditorStore.getState().sectionStyle).toBeUndefined();
    act(() => {
      useEditorStore.getState().setSectionStyle('rounded');
      useEditorStore.getState().reset();
    });
    expect(useEditorStore.getState().sectionStyle).toBeUndefined();
  });

  it('저장된 어두운 배경과 자동 글자색을 공개 미리보기 카드에 반영한다', () => {
    const styledText = (text: string, color: string) => ({
      type: 'text',
      text,
      marks: [
        {
          type: 'textStyle',
          attrs: {
            fontFamily: 'LINESeedKR',
            fontSize: '14px',
            fontWeight: '400',
            color,
          },
        },
      ],
    });
    act(() => {
      const editor = useEditorStore.getState();
      editor.addBlock('wedding', 'greeting', 'dark-greeting');
      editor.updateBlock('dark-greeting', {
        title: '어두운 배경 인사말',
        messageJson: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                styledText('기존 기본 본문', '#000000'),
                styledText('지정한 로즈', '#BC7780'),
                styledText('지정한 검정', 'rgba(0, 0, 0, 1)'),
              ],
            },
          ],
        },
        messageHtml:
          '<p><span style="font-family: LINESeedKR; font-size: 14px; font-weight: 400; color: #000000">기존 기본 본문</span><span style="font-family: LINESeedKR; font-size: 14px; font-weight: 400; color: #BC7780">지정한 로즈</span><span style="font-family: LINESeedKR; font-size: 14px; font-weight: 400; color: rgba(0, 0, 0, 1)">지정한 검정</span></p>',
      });
      editor.setSectionStyle('outlined');
      editor.selectBackgroundColor('#536780');
    });

    const preview = createPreviewSnapshot('data:image/png;base64,test');
    const restored = parsePreviewSnapshot(
      JSON.parse(JSON.stringify(preview.snapshot))
    );
    preview.dispose();
    if (!restored) throw new Error('Preview snapshot was not restored');

    render(<GuestRenderer {...restored.payload} />);

    const title = screen.getByText('어두운 배경 인사말');
    expect(title).toHaveStyle({ color: '#FFFAF2' });
    expect(
      title.closest('[data-section-style="outlined"]')
    ).toBeInTheDocument();
    expect(title.closest('[data-invitation-dark]')).toBeInTheDocument();
    expect(restored.payload.bulkData).toMatchObject({
      backgroundColor: '#536780',
      bodyData: { color: '#E2E6ED', colorMode: 'automatic' },
    });
    const inherited = screen.getByText('기존 기본 본문');
    expect(getComputedStyle(inherited).color).toBe('rgb(226, 230, 237)');
    expect(inherited).toHaveStyle({ fontSize: '14px', fontWeight: '400' });
    expect(screen.getByText('지정한 로즈')).toHaveStyle({ color: '#BC7780' });
    expect(screen.getByText('지정한 검정')).toHaveStyle({ color: '#000000' });

    const darkBlock = useEditorStore.getState().block[0];
    act(() => useEditorStore.getState().selectBackgroundColor('#FFFFFF'));
    expect(useEditorStore.getState().block[0]).toBe(darkBlock);
    expect(useEditorStore.getState().bodyData.color).toBe('#000000');
    expect(inherited).toHaveAttribute(
      'style',
      expect.not.stringContaining('color:')
    );
    expect(screen.getByText('지정한 로즈')).toHaveStyle({ color: '#BC7780' });
  });

  it('HTML만 남아 있는 본문에서 기존 기본 색상만 제거한다', () => {
    act(() => {
      const editor = useEditorStore.getState();
      editor.addBlock('wedding', 'greeting', 'legacy-html');
      editor.updateBlock('legacy-html', {
        messageJson: null,
        messageHtml:
          '<p><span style="color: #000000; font-size: 14px; font-family: LINESeedKR; font-weight: 400; font-style: italic">기존 본문</span><strong><span style="color: #000000; font-size: 18px; font-family: LINESeedKR; font-weight: 400">직접 편집한 본문</span></strong></p>',
      });
      editor.selectBackgroundColor('#536780');
    });

    expect(useEditorStore.getState().block[0].props).toMatchObject({
      messageJson: null,
      messageHtml:
        '<p><span style=" font-size: 14px; font-family: LINESeedKR; font-weight: 400; font-style: italic">기존 본문</span><strong><span style="color: #000000; font-size: 18px; font-family: LINESeedKR; font-weight: 400">직접 편집한 본문</span></strong></p>',
    });
  });

  it('구형 흰색 카드의 인사말과 달력에 저장된 초대장 배경의 명암을 적용한다', () => {
    // Next Jest stubs CSS modules, so load the styles for the computed-style checks.
    const style = document.createElement('style');
    const readStylesheet = (file: string) =>
      readFileSync(join(process.cwd(), 'components/organisms', file), 'utf8');
    style.textContent = [
      readStylesheet('invitation-chapter/invitationChapter.module.css'),
      readStylesheet('calendar/calendarPreview.module.css').replace(
        ':global([data-invitation-dark])',
        '[data-invitation-dark]'
      ),
    ].join('\n');
    document.head.append(style);

    try {
      act(() => {
        const editor = useEditorStore.getState();
        editor.addBlock('wedding', 'greeting', 'legacy-greeting', {
          collectionStyle: 'showcase-18',
          title: '구형 인사말',
          messageHtml:
            '<p>기본 본문 <span style="color: #bc7780">지정한 색</span></p>',
        });
        editor.addBlock('wedding', 'calendar', 'legacy-calendar', {
          collectionStyle: 'showcase-18',
          title: '구형 달력',
          date: '2026-03-19',
          showDday: false,
        });
      });

      const savedPayload = () => {
        const preview = createPreviewSnapshot('data:image/png;base64,test');
        const restored = parsePreviewSnapshot(
          JSON.parse(JSON.stringify(preview.snapshot))
        );
        preview.dispose();
        if (!restored) throw new Error('Preview snapshot was not restored');
        return restored.payload;
      };
      const guest = render(<GuestRenderer {...savedPayload()} />);
      const title = screen.getByText('구형 인사말');
      const greeting = title.closest('[data-design="showcase-18"]');
      const calendar = screen
        .getByText('2026년 3월 19일')
        .closest(`.${calendarStyles.preview}`);
      const calendarChapter = calendar?.closest('[data-design="showcase-18"]');
      if (!calendar) throw new Error('Calendar preview was not rendered');
      const calendarTextColor = () =>
        getComputedStyle(calendar).getPropertyValue('--calendar-text').trim();

      expect(greeting).toHaveStyle({ backgroundColor: '#fff' });
      expect(calendarChapter).toHaveStyle({ backgroundColor: '#fff' });
      expect(calendarTextColor()).toBe('');

      act(() => useEditorStore.getState().selectBackgroundColor('#536780'));
      guest.rerender(<GuestRenderer {...savedPayload()} />);

      expect(greeting).toHaveStyle({ backgroundColor: 'rgba(0, 0, 0, 0.12)' });
      expect(calendarChapter).toHaveStyle({
        backgroundColor: 'rgba(0, 0, 0, 0.12)',
      });
      expect(title).toHaveStyle({ color: '#FFFAF2' });
      expect(screen.getByText(/기본 본문/).parentElement).toHaveStyle({
        color: '#E2E6ED',
      });
      expect(screen.getByText('지정한 색')).toHaveStyle({ color: '#bc7780' });
      expect(calendarTextColor()).toBe('#ffffff');

      act(() => useEditorStore.getState().selectBackgroundColor('#FFFFFF'));
      guest.rerender(<GuestRenderer {...savedPayload()} />);

      expect(greeting).toHaveStyle({ backgroundColor: '#fff' });
      expect(calendarChapter).toHaveStyle({ backgroundColor: '#fff' });
      expect(calendarTextColor()).toBe('');
    } finally {
      style.remove();
    }
  });

  it('기존 저장된 카드 모양을 읽고 명시적인 기본형 선택과 레이아웃 블록의 예외를 적용한다', () => {
    const { container, rerender } = render(
      <InvitationChapter component="place" collectionStyle="showcase-21">
        장소
      </InvitationChapter>
    );
    expect(
      container.querySelector('[data-design="showcase-21"]')
    ).not.toBeNull();
    rerender(
      <InvitationChapter
        component="place"
        collectionStyle="showcase-21"
        sectionStyle="plain"
        defaultStyle="rounded"
      >
        장소
      </InvitationChapter>
    );
    expect(container.querySelector('section')).toBeNull();
    rerender(
      <InvitationChapter
        component="place"
        collectionStyle="showcase-21"
        sectionStyle="invalid"
        defaultStyle="paper"
      >
        장소
      </InvitationChapter>
    );
    expect(
      container.querySelector('[data-section-style="paper"]')
    ).not.toBeNull();
    for (const component of ['spacer', 'divider', 'bgm', 'visualEffects']) {
      rerender(
        <InvitationChapter component={component} defaultStyle="paper">
          레이아웃
        </InvitationChapter>
      );
      expect(container.querySelector('section')).toBeNull();
    }
  });
});
