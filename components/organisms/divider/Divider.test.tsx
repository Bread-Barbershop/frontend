import { render } from '@testing-library/react';

import { DividerBlockPreview } from './DividerBlockPreview';
import { normalizeDividerSettings } from './dividerSettings';

import type { EditorBlock } from '@/shared/types/block';

const sample: EditorBlock<'divider'> = {
  id: 'divider-1',
  type: 'wedding',
  component: 'divider',
  props: {
    height: 64,
    thickness: 1,
    color: '#E2E8F0',
    topSpacing: 12,
    bottomSpacing: 12,
  },
};

describe('세로 구분선 블록', () => {
  it('높이·굵기·여백의 범위 및 잘못된 색상 입력을 보정한다', () => {
    expect(normalizeDividerSettings({
      height: -5, thickness: 9, color: 'red', topSpacing: -10, bottomSpacing: 300,
    })).toEqual({
      height: 32, thickness: 2, color: '#E2E8F0', topSpacing: 0, bottomSpacing: 64,
    });
  });

  it('에디터 미리보기에는 점선 선택 가이드가 존재한다', () => {
    const { container } = render(<DividerBlockPreview blockInfo={sample} />);
    expect(container.querySelector('.border-dashed')).toBeInTheDocument();
  });

  it('게스트 화면은 가이드 없이 선과 여백만 렌더링한다', () => {
    const { container } = render(<DividerBlockPreview blockInfo={sample} isGuestPage />);
    expect(container.querySelector('.border-dashed')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveStyle({ paddingTop: '12px', paddingBottom: '12px' });
    const line = container.firstElementChild?.firstElementChild;
    expect(line).toHaveStyle({ height: '64px', width: '1px' });
  });
});
