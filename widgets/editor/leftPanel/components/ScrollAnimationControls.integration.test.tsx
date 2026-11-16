import { act, fireEvent, render, screen } from '@testing-library/react';

import { normalizeGuestBlock } from '@/app/guest/[id]/validation/normalizeGuestBlock';
import { resolveScrollAnimation } from '@/components/molecules/scroll-fade-in/animationConfig';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import { ScrollAnimationControls } from './ScrollAnimationControls';

describe('스크롤 애니메이션 편집과 저장', () => {
  beforeEach(() => useEditorStore.getState().reset());
  afterEach(() => useEditorStore.getState().reset());

  it('시간과 부드러움을 편집한 뒤 JSON에서 같은 설정을 복원한다', () => {
    act(() =>
      useEditorStore
        .getState()
        .addBlock('wedding', 'afterParty', 'animation-block')
    );
    render(<ScrollAnimationControls selectedId="animation-block" />);
    fireEvent.click(screen.getByRole('button', { name: '스크롤 애니메이션' }));
    fireEvent.change(screen.getByRole('slider', { name: '등장 시간' }), {
      target: { value: '1400' },
    });
    fireEvent.change(screen.getByLabelText('부드러움'), {
      target: { value: 'soft' },
    });
    const saved = normalizeGuestBlock(
      JSON.parse(JSON.stringify(useEditorStore.getState().block[0])),
      0
    );
    expect(saved.ok).toBe(true);
    if (!saved.ok) throw new Error('Could not restore block');
    expect(resolveScrollAnimation(saved.block.props)).toMatchObject({
      animationDurationMs: 1400,
      animationEasing: 'soft',
    });
    expect(screen.getByText('1.4초')).toBeInTheDocument();
  });
});
