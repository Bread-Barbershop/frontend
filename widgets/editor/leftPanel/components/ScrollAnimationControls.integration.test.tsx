import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { parseGuestPayload } from '@/app/guest/[id]/validation/parseGuestPayload';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { ScrollAnimationControls } from './ScrollAnimationControls';
import { SectionStyleControls } from './SectionStyleControls';

jest.mock('@/shared/assets/icons/sectionArrow.svg', () => () => null);

describe('일괄 스크롤 애니메이션 편집', () => {
  beforeEach(() => useEditorStore.getState().reset());
  afterEach(() => act(() => useEditorStore.getState().reset()));

  it('선택한 블록과 무관하게 공통 설정을 바꾸고 이후 추가한 블록에도 적용한다', () => {
    act(() => {
      useEditorStore
        .getState()
        .addBlock('wedding', 'afterParty', 'first-block', {
          animationType: 'zoom-in',
          animationDurationMs: 2000,
        } as never);
      useEditorStore.getState().addBlock('wedding', 'gallery', 'second-block', {
        animationType: 'fade',
      } as never);
      useEditorStore.getState().selectedBlock('second-block');
    });

    render(<ScrollAnimationControls />);
    fireEvent.click(screen.getByRole('button', { name: '스크롤 애니메이션' }));
    const effect = screen.getByRole('combobox', { name: '효과' });
    expect(effect).toHaveValue('none');
    fireEvent.change(effect, { target: { value: 'from-left' } });
    const trigger = screen.getByRole('combobox', { name: /스크롤 재생 조건/ });
    expect(
      within(trigger)
        .getAllByRole('option')
        .map(option => option.textContent)
    ).toEqual(['처음 내릴 때만', '내릴 때마다', '올리거나 내릴 때마다']);
    expect(trigger).toHaveValue('down-only');
    fireEvent.change(trigger, { target: { value: 'down-repeat' } });
    fireEvent.change(screen.getByRole('slider', { name: '등장 시간' }), {
      target: { value: '1400' },
    });
    fireEvent.change(screen.getByLabelText('부드러움'), {
      target: { value: 'soft' },
    });

    act(() => {
      useEditorStore.getState().addBlock('wedding', 'greeting', 'new-block');
    });

    const state = useEditorStore.getState();
    expect(state.scrollAnimation).toMatchObject({
      animationType: 'from-left',
      triggerMode: 'down-repeat',
      animationDurationMs: 1400,
      animationEasing: 'soft',
    });
    expect(state.block.map(block => block.props)).toEqual([
      expect.objectContaining({
        animationType: 'zoom-in',
        animationDurationMs: 2000,
      }),
      expect.objectContaining({ animationType: 'fade' }),
      expect.not.objectContaining({ animationType: 'fade' }),
    ]);
  });

  it('저장 JSON을 다시 읽으면 공통 설정을 복원하고 구형 개별 값은 사용하지 않는다', () => {
    act(() =>
      useEditorStore.getState().updateScrollAnimation({
        animationType: 'zoom-in',
        triggerMode: 'down-repeat',
        animationDurationMs: 1400,
        animationEasing: 'soft',
      })
    );
    const serialized = JSON.stringify({
      blocks: [
        {
          id: 'legacy-block',
          type: 'wedding',
          component: 'afterParty',
          props: {
            entranceEffect: 'from-right',
            animationType: 'zoom-in',
            animationDurationMs: 1900,
          },
        },
      ],
      bulkData: {
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
        scrollAnimation: useEditorStore.getState().scrollAnimation,
      },
      mainPoster: { version: '1', objects: [] },
      bgm: {
        selectedBgmId: null,
        isLoop: false,
        volume: 0.2,
        userBgmTitle: null,
        userBgmDuration: null,
        userBgmFileId: null,
      },
    });
    const parsed = parseGuestPayload(JSON.parse(serialized));

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    expect(parsed.payload.bulkData.scrollAnimation).toMatchObject({
      animationType: 'zoom-in',
      triggerMode: 'down-repeat',
      animationDurationMs: 1400,
      animationEasing: 'soft',
    });
    expect(parsed.payload.blocks[0].props).toMatchObject({
      entranceEffect: 'from-right',
      animationType: 'zoom-in',
      animationDurationMs: 1900,
    });
  });

  it('공통 설정이 없는 이전 저장 데이터에 기본값을 적용한다', () => {
    const parsed = parseGuestPayload({
      blocks: [],
      bulkData: {
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
      },
      mainPoster: { version: '1', objects: [] },
      bgm: {
        selectedBgmId: null,
        isLoop: false,
        volume: 0.2,
        userBgmTitle: null,
        userBgmDuration: null,
        userBgmFileId: null,
      },
    });

    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.payload.bulkData.scrollAnimation).toEqual({
      animationType: 'none',
      triggerMode: 'down-only',
      animationDurationMs: 700,
      animationEasing: 'natural',
    });
  });
  it('두 갤러리 중 선택한 카드만 양옆에서 모이기를 적용하고 전체 설정으로 되돌린다', () => {
    const { addBlock } = useEditorStore.getState();
    addBlock('birthday', 'gallery', 'photos');
    addBlock('birthday', 'gallery', 'party');
    render(<SectionStyleControls selectedId="photos" />);
    fireEvent.click(screen.getByRole('button', { name: '카드 디자인 · 등장 효과' }));
    const effect = screen.getByLabelText('이 블록의 등장 효과');
    expect(effect).toHaveValue('');
    fireEvent.change(effect, { target: { value: 'paired' } });
    expect(useEditorStore.getState().block.map(b => b.props.entranceEffect)).toEqual(['paired', undefined]);
    expect(useEditorStore.getState().scrollAnimation.animationType).toBe('none');
    fireEvent.change(effect, { target: { value: '' } });
    expect(useEditorStore.getState().block[0].props.entranceEffect).toBeUndefined();
  });
});
