import { act, renderHook } from '@testing-library/react';
import { Canvas } from 'fabric';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useKeyboardEvents } from './useKeyboardEvents';

const mockHandleDeleteShape = jest.fn();
const mockNoop = jest.fn();

jest.mock('@/widgets/mainPoster/context/FabricContext', () => ({
  useFabricContext: () => ({
    copy: mockNoop,
    paste: mockNoop,
    lock: mockNoop,
    unLock: mockNoop,
    moveUp: mockNoop,
    moveDown: mockNoop,
    moveTop: mockNoop,
    moveBottom: mockNoop,
    undo: mockNoop,
    redo: mockNoop,
    handleDeleteShape: mockHandleDeleteShape,
    toggleDrawingMode: mockNoop,
  }),
}));

describe('캔버스 키보드 단축키', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.innerWidth = 1440;
    mockHandleDeleteShape.mockClear();
    act(() => useEditorStore.getState().reset());
    act(() => {
      const state = useEditorStore.getState();
      state.addBlock('wedding', 'greeting', 'test-greeting');
      state.selectedBlock('test-greeting');
    });
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    act(() => useEditorStore.getState().reset());
  });

  it('블록이 선택된 상태에서 Delete 키를 눌러도 캔버스 객체 삭제를 호출하지 않는다', () => {
    const activeObject = {};
    const canvas = {
      getActiveObjects: () => [activeObject],
      getActiveObject: () => activeObject,
      discardActiveObject: jest.fn(),
      renderAll: jest.fn(),
      isDrawingMode: false,
    } as unknown as Canvas;
    const mouseInCanvasRef = { current: true };

    renderHook(() => useKeyboardEvents(canvas, mouseInCanvasRef));
    document.body.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })
    );

    expect(mockHandleDeleteShape).not.toHaveBeenCalled();
  });

  it('포스터를 선택한 상태에서 Delete 키를 누르면 선택된 캔버스 객체를 삭제한다', () => {
    act(() => useEditorStore.getState().selectedBlock('mainPoster'));
    const activeObject = {};
    const canvas = {
      getActiveObjects: () => [activeObject],
      getActiveObject: () => activeObject,
      discardActiveObject: jest.fn(),
      renderAll: jest.fn(),
      isDrawingMode: false,
    } as unknown as Canvas;
    const mouseInCanvasRef = { current: true };

    renderHook(() => useKeyboardEvents(canvas, mouseInCanvasRef));
    window.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Delete', bubbles: true })
    );

    expect(mockHandleDeleteShape).toHaveBeenCalledWith(
      canvas,
      expect.objectContaining({ key: 'Delete' })
    );
  });
});
