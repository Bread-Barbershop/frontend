import { act, fireEvent, render, screen } from '@testing-library/react';

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

describe('일괄 편집 즉시 반영', () => {
  beforeEach(() => useEditorStore.getState().reset());

  it('배경 편집 바로 아래에 스크롤 애니메이션 설정을 표시한다', () => {
    render(<BulkEdit />);

    const backgroundHeading = screen.getByText('배경 편집');
    const animationButton = screen.getByRole('button', {
      name: '스크롤 애니메이션',
    });

    expect(
      backgroundHeading.compareDocumentPosition(animationButton) &
        Node.DOCUMENT_POSITION_FOLLOWING
    ).toBeTruthy();
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
