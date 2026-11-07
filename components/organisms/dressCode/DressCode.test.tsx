import { render, screen } from '@testing-library/react';

import { DressCodeBlockPreview } from './DressCodeBlockPreview';
import { normalizeDressCodeColors, normalizeDressCodeGuidelines } from './dressCodeUtils';

import type { EditorBlock } from '@/shared/types/block';

const sample: EditorBlock<'dressCode'> = {
  id: 'dress-1',
  component: 'dressCode',
  type: 'wedding',
  props: { title: '드레스 코드', colors: ['#F1DED9', '#E5E7EB'], guidelines: ['화환은 정중히 사양합니다.'] },
};

describe('드레스코드 및 매너 블록', () => {
  it('잘못된 색상은 제거하고 추천 색상은 8개까지만 보존한다', () => {
    expect(normalizeDressCodeColors(['red', '#AABBCC', '#123456'])).toEqual(['#AABBCC', '#123456']);
    expect(normalizeDressCodeColors(Array(10).fill('#AABBCC'))).toHaveLength(8);
  });
  it('안내 텍스트를 최대 140자와 8개까지 제한한다', () => {
    expect(normalizeDressCodeGuidelines(['x'.repeat(200)])[0]).toHaveLength(140);
  });
  it('추천 컬러칩과 매너 카드가 렌더링된다', () => {
    render(<DressCodeBlockPreview blockInfo={sample} />);
    expect(screen.getByLabelText('추천 드레스 컬러').children).toHaveLength(2);
    expect(screen.getByText('화환은 정중히 사양합니다.')).toBeInTheDocument();
  });
  it('게스트 화면에 빈 안내 상태 문구를 노출하지 않는다', () => {
    render(<DressCodeBlockPreview blockInfo={{ ...sample, props: { ...sample.props, guidelines: [] } }} isGuestPage />);
    expect(screen.queryByText('매너 안내 문구를 추가해 주세요.')).not.toBeInTheDocument();
  });
});
