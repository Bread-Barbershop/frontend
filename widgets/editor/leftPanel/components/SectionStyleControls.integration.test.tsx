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
import InvitationChapter from '@/components/organisms/invitation-chapter/InvitationChapter';
import {
  createPreviewSnapshot,
  parsePreviewSnapshot,
} from '@/features/invitation/preview/previewSnapshot';
import { createInvitationTemplate } from '@/shared/data/invitationTemplates';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import BulkEdit from './BulkEdit';
import { SectionStyleControls } from './SectionStyleControls';

jest.mock('@/shared/data/invitationTemplates/originalPosterLoader', () => ({
  loadOriginalPosterJson: async () => ({ version: '7.2.0', objects: [] }),
}));
jest.mock('next/navigation', () => ({ usePathname: () => '/guest/test' }));
jest.mock('@/shared/fonts/fontLoader', () => ({
  preloadFontFamilyWeights: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('./TitleEdit', () => ({ __esModule: true, default: () => null }));
jest.mock('./BodyEdit', () => ({ __esModule: true, default: () => null }));
jest.mock('./BackGroundColorEdit', () => ({
  __esModule: true,
  default: () => null,
}));

describe('템플릿과 추가 블록의 공통 카드 디자인', () => {
  beforeEach(() => useEditorStore.getState().reset());
  afterEach(() => act(() => useEditorStore.getState().reset()));

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
    expect(screen.getByLabelText('초대장 기본 카드 스타일')).toHaveValue(
      'paper'
    );
    expect(screen.getByLabelText('이 블록의 카드 스타일')).toHaveValue('');

    fireEvent.change(screen.getByLabelText('초대장 기본 카드 스타일'), {
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
