import { act, fireEvent, render, screen } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import BodyEdit from './BodyEdit';
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
  afterEach(() => useEditorStore.getState().reset());

  it('본문 크기 화살표 변경을 본문 설정과 리치 텍스트 블록에 즉시 반영한다', () => {
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

    fireEvent.click(screen.getByRole('button', { name: '글자 크기 증가' }));

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
