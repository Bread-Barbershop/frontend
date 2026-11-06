import { fireEvent, render, screen } from '@testing-library/react';

import { Spacer } from './Spacer';
import { SpacerPreview } from './SpacerPreview';
import { clampSpacerHeight } from './spacerHeight';

import type { EditorBlock } from '@/shared/types/block';

const mockUpdateBlock = jest.fn();

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: (state: { updateBlock: jest.Mock }) => unknown) =>
    selector({ updateBlock: (...args: unknown[]) => mockUpdateBlock(...args) }),
}));

const blockInfo: EditorBlock<'spacer'> = {
  id: 'spacer-1',
  type: 'wedding',
  component: 'spacer',
  props: { height: 48 },
};

describe('여백 블록', () => {
  beforeEach(() => jest.clearAllMocks());

  it('높이를 16~120px로 제한하고 잘못된 값을 기본값으로 바꾼다', () => {
    expect(clampSpacerHeight(-100)).toBe(16);
    expect(clampSpacerHeight(999)).toBe(120);
    expect(clampSpacerHeight(Number.NaN)).toBe(48);
    expect(clampSpacerHeight(25.8)).toBe(26);
  });

  it('에디터에서는 점선 가이드와 높이를 보여준다', () => {
    render(<SpacerPreview blockInfo={blockInfo} />);
    expect(screen.getByText('여백 · 48px')).toBeInTheDocument();
  });

  it('게스트 뷰어에서는 텍스트 없는 투명 여백만 남긴다', () => {
    const { container } = render(<SpacerPreview blockInfo={blockInfo} isGuestPage />);
    expect(screen.queryByText(/여백 ·/)).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveStyle({ height: '48px' });
  });

  it('S/M/L 프리셋이 블록 높이를 변경한다', () => {
    render(<Spacer blockInfo={blockInfo} id="spacer-1" />);
    fireEvent.click(screen.getByRole('button', { name: '여백 L (96px)' }));
    expect(mockUpdateBlock).toHaveBeenCalledWith('spacer-1', { height: 96 });
  });
});
