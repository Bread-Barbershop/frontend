import { act, fireEvent, render, screen, within } from '@testing-library/react';

import { BODY_BULK_DATA, TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import { createPreviewSnapshot } from '@/features/invitation/preview/previewSnapshot';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import BodyEdit from './BodyEdit';
import BulkEdit from './BulkEdit';
import TitleEdit from './TitleEdit';

jest.mock('@/shared/assets/icons/color.svg', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/shared/fonts/fontLoader', () => ({
  hasCustomFontFace: () => false,
  loadCustomFont: jest.fn().mockResolvedValue(undefined),
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

function expectFontPreviewBackground(backgroundColor: string) {
  for (const sample of ['제목입니다', '본문입니다']) {
    expect(screen.getByText(sample).closest('figure')).toHaveStyle({
      backgroundColor,
    });
  }
}

describe('일괄 편집 즉시 반영', () => {
  beforeEach(() => useEditorStore.getState().reset());

  it('배경 편집 아래 초대장 연출에 오프닝과 축하 효과, 스크롤 설정을 표시한다', () => {
    render(<BulkEdit />);

    const backgroundHeading = screen.getByText('배경 편집');
    const effectsHeading = screen.getByText('초대장 연출');
    const opening = screen.getByRole('combobox', { name: '오프닝' });
    const celebration = screen.getByRole('switch', {
      name: '축하 효과 컨페티',
    });
    const scroll = screen.getByRole('combobox', { name: '스크롤 애니메이션' });

    expect(
      backgroundHeading.compareDocumentPosition(effectsHeading) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
    expect(effectsHeading.closest('details')).toContainElement(opening);
    expect(effectsHeading.closest('details')).toContainElement(celebration);
    expect(effectsHeading.closest('details')).toContainElement(scroll);
    expect(opening).toHaveValue('direct');
    expect(celebration).not.toBeChecked();
  });

  it('별도 블록을 추가하지 않고 오프닝과 축하 효과를 하객 미리보기에 전달한다', () => {
    render(<BulkEdit />);
    fireEvent.change(screen.getByRole('combobox', { name: '오프닝' }), {
      target: { value: 'envelope' },
    });
    fireEvent.click(screen.getByRole('switch', { name: '축하 효과 컨페티' }));

    const preview = createPreviewSnapshot('data:image/png;base64,test');
    expect(preview.snapshot.payload.bulkData.invitationEffects).toEqual({
      opening: 'envelope',
      confetti: true,
    });
    expect(preview.snapshot.payload.blocks).toHaveLength(0);
    preview.dispose();
  });

  it('배경 효과와 범위를 미리보기에 저장하고 오프닝 컨페티를 독립적으로 끈다', () => {
    render(<BulkEdit />);
    const effect = screen.getByRole('combobox', { name: '배경 효과' });
    expect(effect).toHaveValue('none');
    expect(screen.queryByRole('combobox', { name: '표시 범위' })).toBeNull();

    fireEvent.change(effect, { target: { value: 'confetti' } });
    const scope = screen.getByRole('combobox', { name: '표시 범위' });
    expect(scope).toHaveValue('poster');
    fireEvent.change(scope, { target: { value: 'screen' } });
    const openingConfetti = screen.getByRole('switch', {
      name: '축하 효과 컨페티',
    });
    fireEvent.click(openingConfetti);
    fireEvent.click(openingConfetti);

    const preview = createPreviewSnapshot('data:image/png;base64,test');
    expect(preview.snapshot.payload.bulkData.invitationEffects).toEqual({
      ambientEffect: 'confetti',
      ambientScope: 'screen',
      confetti: false,
    });
    preview.dispose();
  });

  it('예전 컨페티 조합에서도 오프닝 스위치로 배경 효과가 사라지지 않는다', () => {
    const store = useEditorStore.getState();
    store.addBlock('wedding', 'visualEffects', 'old-confetti');
    store.updateBlock('old-confetti', { effect: 'confetti' });
    store.addBlock('wedding', 'visualEffects', 'old-petals');
    store.updateBlock('old-petals', { effect: 'petals' });
    render(<BulkEdit />);
    fireEvent.click(screen.getByRole('switch', { name: '축하 효과 컨페티' }));
    expect(screen.getByRole('combobox', { name: '배경 효과' })).toHaveValue(
      'blocks'
    );
    expect(screen.getByRole('combobox', { name: '표시 범위' })).toHaveValue(
      'screen'
    );
  });

  it('배경색을 지정된 순서대로 표시하고 선택한 색상을 반영한다', () => {
    render(<BulkEdit />);

    const white = screen.getByRole('button', { name: '화이트' });
    const palette = within(white.parentElement!);
    const buttons = palette.getAllByRole('button');
    expect(buttons.map(button => button.textContent)).toEqual([
      '화이트',
      '아이보리',
      '로즈',
      '세이지',
      '라일락',
      '베이지',
      '피치',
      '버터',
      '블루',
      '네이비',
      '블랙',
      '직접 선택',
    ]);
    expect(white).toHaveAttribute('aria-pressed', 'true');

    const blue = palette.getByRole('button', { name: '블루' });
    fireEvent.click(blue);

    expect(blue).toHaveAttribute('aria-pressed', 'true');
    expect(white).toHaveAttribute('aria-pressed', 'false');
    expect(useEditorStore.getState().backgroundColor).toBe('#D7E3F4');

    for (const preset of buttons.slice(0, -1)) {
      fireEvent.click(preset);
      const swatch = preset.querySelector('span')!;
      expectFontPreviewBackground(swatch.style.backgroundColor);
    }
  });

  it('어두운 배경의 기본 글자색을 밝게 바꾸고 밝은 배경에서 원래 색을 복원한다', () => {
    render(<BulkEdit />);

    fireEvent.click(screen.getByRole('button', { name: '네이비' }));
    expect(useEditorStore.getState()).toMatchObject({
      backgroundColor: '#536780',
      titleData: { color: '#FFFAF2' },
      bodyData: { color: '#E2E6ED' },
    });
    fireEvent.keyDown(screen.getByRole('button', { name: '14' }), {
      key: 'ArrowUp',
    });
    fireEvent.click(screen.getByRole('button', { name: '블랙' }));
    expect(useEditorStore.getState()).toMatchObject({
      backgroundColor: '#54565C',
      titleData: { color: '#FFFAF2' },
      bodyData: { color: '#E2E6ED', fontSize: '15px' },
    });

    fireEvent.click(screen.getByRole('button', { name: '버터' }));
    expect(useEditorStore.getState()).toMatchObject({
      backgroundColor: '#FFF1B8',
      titleData: { color: TITLE_BULK_DATA.color },
      bodyData: { color: BODY_BULK_DATA.color, fontSize: '15px' },
    });
    expectFontPreviewBackground('rgb(255, 241, 184)');
  });

  it('제목과 본문 편집에서 직접 선택한 글자색을 어두운 배경에서도 유지한다', () => {
    render(<BulkEdit />);
    const [titleColor, bodyColor] = screen.getAllByRole('button', {
      name: 'Font color',
    });

    fireEvent.click(titleColor);
    fireEvent.change(screen.getByRole('textbox', { name: 'Hex color value' }), {
      target: { value: '#070849' },
    });
    fireEvent.change(screen.getByRole('textbox', { name: 'Hex color value' }), {
      target: { value: TITLE_BULK_DATA.color },
    });
    fireEvent.click(bodyColor);
    fireEvent.change(screen.getByRole('textbox', { name: 'Hex color value' }), {
      target: { value: '#660020' },
    });
    fireEvent.click(screen.getByRole('button', { name: '네이비' }));

    expect(useEditorStore.getState()).toMatchObject({
      titleData: {
        color: TITLE_BULK_DATA.color.toLowerCase(),
        colorMode: 'custom',
      },
      bodyData: { color: '#660020', colorMode: 'custom' },
    });
  });

  it('직접 선택에서 저장한 배경색과 투명도를 편집하고 Esc로 닫는다', () => {
    act(() =>
      useEditorStore.getState().setBackgroundColor('rgba(16, 32, 48, 0.5)')
    );
    render(<BulkEdit />);
    const trigger = screen.getByRole('button', { name: '직접 선택' });

    fireEvent.click(trigger);
    const dialog = screen.getByRole('dialog', { name: '배경색 직접 선택' });
    const input = within(dialog).getByRole('textbox', {
      name: 'Hex color value',
    });
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
    expect(input).toHaveFocus();
    expect(input).toHaveValue('#102030');
    expect(within(dialog).getByText('투명도 50%')).toBeInTheDocument();

    fireEvent.change(input, { target: { value: '#223344' } });
    expect(useEditorStore.getState().backgroundColor).toBe(
      'rgba(34, 51, 68, 0.5)'
    );
    expectFontPreviewBackground('rgba(34, 51, 68, 0.5)');
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(trigger).toHaveFocus();
  });

  it('본문 크기 선택기의 ArrowUp 변경을 본문 설정과 리치 텍스트 블록에 즉시 반영한다', () => {
    const block = {
      id: 'bulk-body-block',
      type: 'wedding',
      component: 'afterParty',
      props: {
        messageJson: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [{ type: 'text', text: 'Sample message' }],
            },
          ],
        },
        messageHtml: '<p>Sample message</p>',
      },
    } as unknown as EditorBlock;

    act(() => useEditorStore.setState({ block: [block] }));
    render(
      <BodyEdit
        activeColorPickerId={null}
        onActiveColorPickerChange={() => {}}
      />
    );

    fireEvent.keyDown(screen.getByRole('button', { name: '14' }), {
      key: 'ArrowUp',
    });

    const state = useEditorStore.getState();
    expect(state.bodyData.fontSize).toBe('15px');
    const props = state.block[0].props as {
      messageJson: {
        content: { content: { marks: { attrs: { fontSize: string } }[] }[] }[];
      };
      messageHtml: string;
    };
    expect(
      props.messageJson.content[0].content[0].marks[0].attrs.fontSize
    ).toBe('15px');
    expect(props.messageHtml).toContain('15px');
  });

  it('현재 본문 크기를 다시 선택하면 블록의 기존 서식을 본문 설정으로 덮어쓴다', () => {
    const block = {
      id: 'bulk-body-reselect-block',
      type: 'wedding',
      component: 'afterParty',
      props: {
        messageJson: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'Sample message',
                  marks: [
                    {
                      type: 'textStyle',
                      attrs: {
                        fontSize: '24px',
                        fontFamily: 'LINESeedKR',
                        fontWeight: '400',
                        color: '#000000',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        messageHtml:
          '<p><span style="font-size: 24px; font-family: LINESeedKR; font-weight: 400; color: #000000">Sample message</span></p>',
      },
    } as unknown as EditorBlock;

    act(() => useEditorStore.setState({ block: [block] }));
    render(
      <BodyEdit
        activeColorPickerId={null}
        onActiveColorPickerChange={() => {}}
      />
    );

    const sizeOption = screen.getByRole('option', { name: '14' });
    const popover = sizeOption.closest('ul');
    if (!popover) throw new Error('Size selector popover was not found');
    Object.defineProperty(popover, 'hidePopover', {
      configurable: true,
      value: jest.fn(),
    });
    fireEvent.click(sizeOption);

    const updatedProps = useEditorStore.getState().block[0].props as {
      messageJson: {
        content: { content: { marks: { attrs: { fontSize: string } }[] }[] }[];
      };
      messageHtml: string;
    };
    expect(
      updatedProps.messageJson.content[0].content[0].marks[0].attrs.fontSize
    ).toBe('14px');
    expect(updatedProps.messageHtml).toContain('font-size: 14px');
  });

  it('제목 크기 선택기가 포커스된 상태에서 ArrowUp을 즉시 저장한다', () => {
    render(
      <TitleEdit
        activeColorPickerId={null}
        onActiveColorPickerChange={() => {}}
      />
    );

    fireEvent.keyDown(screen.getByRole('button', { name: '20' }), {
      key: 'ArrowUp',
    });

    expect(useEditorStore.getState().titleData.fontSize).toBe('21px');
  });
});
