import { fireEvent, render, screen } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import TypePanel from './TypePanel';

jest.mock('@/shared/store/editorStore/useEditorStore');
jest.mock('@/components/atoms/image', () => ({
  Image: ({ alt }: { alt: string }) => <span aria-label={alt} role="img" />,
}));

describe('TypePanel', () => {
  const mockUseEditorStore = useEditorStore as jest.MockedFunction<
    typeof useEditorStore
  >;
  const updateBlock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseEditorStore.mockImplementation(selector =>
      selector({
        block: [
          {
            id: 'selected-block',
            component: 'gallery',
            props: {
              template: 'galleryType2',
            },
          },
        ],
        updateBlock,
      } as any)
    );
  });

  it('선택된 타입 버튼에 강조 보더를 표시한다', () => {
    render(
      <TypePanel
        typeArray={['galleryType1', 'galleryType2']}
        selectedId="selected-block"
      />
    );

    const selectedButton = screen.getByRole('button', {
      name: /galleryType2/i,
    });
    const unselectedButton = screen.getByRole('button', {
      name: /galleryType1/i,
    });

    expect(selectedButton).toHaveAttribute('aria-pressed', 'true');
    expect(selectedButton).toHaveClass('border-primary bg-white');
    expect(selectedButton.className).toContain('shadow-[');
    expect(unselectedButton).toHaveAttribute('aria-pressed', 'false');
    expect(unselectedButton).toHaveClass('border-text-primary/5');
  });

  it('타입을 클릭하면 선택된 블록의 template 값을 갱신한다', () => {
    render(
      <TypePanel
        typeArray={['galleryType1', 'galleryType2']}
        selectedId="selected-block"
      />
    );

    fireEvent.click(screen.getByRole('button', { name: /galleryType1/i }));

    expect(updateBlock).toHaveBeenCalledWith('selected-block', {
      template: 'galleryType1',
    });
  });
});
