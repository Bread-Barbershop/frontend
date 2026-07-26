import { render, screen, fireEvent } from '@testing-library/react';
import RightPanel from './RightPanel';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useComponentType } from './hooks/useComponentType';

// Mock the dependencies
jest.mock('@/shared/store/editorStore/useEditorStore');
jest.mock('./hooks/useComponentType');
jest.mock('./components/TypePanel', () => ({
  __esModule: true,
  default: () => <div data-testid="type-panel">TypePanel</div>,
}));
jest.mock('./components/PosterPanel', () => ({
  __esModule: true,
  PosterPanel: () => <div data-testid="poster-panel">PosterPanel</div>,
}));

const STABLE_TYPE_ARRAY = ['type1'];
const STABLE_EMPTY_ARRAY: string[] = [];

describe('RightPanel 컴포넌트 테스트', () => {
  const mockUseEditorStore = useEditorStore as jest.MockedFunction<
    typeof useEditorStore
  >;
  const mockUseComponentType = useComponentType as jest.MockedFunction<
    typeof useComponentType
  >;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('typeArray가 있을 경우 기본적으로 "타입" 탭이 선택된다', () => {
    // Arrange
    mockUseEditorStore.mockReturnValue({
      block: [],
      selectedId: 'component-1',
    });
    mockUseComponentType.mockReturnValue({
      typeArray: STABLE_TYPE_ARRAY,
    });

    // Act
    render(<RightPanel />);

    // Assert
    const typeButton = screen.getByRole('button', { name: /타입/i });
    expect(typeButton).toHaveClass('border-b text-text-primary');
  });

  it('typeArray가 없을 경우 기본적으로 "포스터" 탭이 선택된다', () => {
    // Arrange
    mockUseEditorStore.mockReturnValue({
      block: [],
      selectedId: 'mainPoster',
    });
    mockUseComponentType.mockReturnValue({
      typeArray: STABLE_EMPTY_ARRAY,
    });

    // Act
    render(<RightPanel />);

    // Assert
    const posterButton = screen.getByRole('button', { name: /포스터/i });
    const typeButton = screen.getByRole('button', { name: /타입/i });
    expect(posterButton).toHaveClass('border-b text-text-primary');
    expect(typeButton).toBeDisabled();
    expect(typeButton).toHaveClass('cursor-not-allowed');
  });

  it('유저가 수동으로 탭을 변경할 수 있다', () => {
    // Arrange
    mockUseEditorStore.mockReturnValue({
      block: [],
      selectedId: 'component-1',
    });
    mockUseComponentType.mockReturnValue({
      typeArray: STABLE_TYPE_ARRAY,
    });

    render(<RightPanel />);
    const posterButton = screen.getByRole('button', { name: /포스터/i });

    // Act
    fireEvent.pointerDown(posterButton);

    // Assert
    expect(posterButton).toHaveClass('border-b text-text-primary');
  });

  it.each(['gallery', 'calendar'])(
    '%s 컴포넌트 선택 시 포스터 탭을 클릭할 수 없다',
    component => {
      mockUseEditorStore.mockReturnValue({
        block: [{ id: 'component-1', component }],
        selectedId: 'component-1',
      } as any);
      mockUseComponentType.mockReturnValue({
        typeArray: STABLE_TYPE_ARRAY,
      });

      render(<RightPanel />);
      const posterButton = screen.getByRole('button', { name: /포스터/i });

      fireEvent.pointerDown(posterButton);

      expect(posterButton).toBeDisabled();
      expect(screen.getByTestId('type-panel')).toBeInTheDocument();
      expect(screen.queryByTestId('poster-panel')).not.toBeInTheDocument();
    }
  );

  it('selectedId가 변경되어 typeArray가 달라지면 탭이 자동으로 재설정된다', () => {
    // Stage 1: comp-1 with types
    mockUseEditorStore.mockReturnValue({ selectedId: 'comp-1', block: [] });
    mockUseComponentType.mockReturnValue({ typeArray: STABLE_TYPE_ARRAY });

    const { rerender } = render(<RightPanel />);
    expect(screen.getByRole('button', { name: /타입/i })).toHaveClass(
      'border-b text-text-primary'
    );

    // Stage 2: mainPoster with no types
    mockUseEditorStore.mockReturnValue({ selectedId: 'mainPoster', block: [] });
    mockUseComponentType.mockReturnValue({ typeArray: STABLE_EMPTY_ARRAY });

    // Act
    rerender(<RightPanel />);

    // Assert
    expect(screen.getByRole('button', { name: /포스터/i })).toHaveClass(
      'border-b text-text-primary'
    );
  });
});
