import { act, fireEvent, render } from '@testing-library/react';
import React from 'react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import OrderPanel from './OrderPanel';

jest.mock('@/components/molecules/editor-callout', () => ({
  EditorCallout: () => null,
}));

jest.mock('@/widgets/editor/preview/components/ChipCarousel', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}));

jest.mock('./SortableItems', () => ({
  __esModule: true,
  default: ({ id }: { id: string }) => <div>{id}</div>,
}));

describe('블록 Delete 단축키', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.innerWidth = 1440;
    act(() => useEditorStore.getState().reset());
    act(() => {
      const state = useEditorStore.getState();
      state.addBlock('wedding', 'greeting', 'test-greeting');
      state.selectedBlock('test-greeting');
      state.setIsEdit(true);
    });
  });

  afterEach(() => {
    window.innerWidth = originalInnerWidth;
    act(() => useEditorStore.getState().reset());
    document.querySelector('[role="dialog"]')?.remove();
  });

  it('선택한 항목을 삭제하고 포스터를 선택한다', () => {
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'Delete' });

    const state = useEditorStore.getState();
    expect(state.block).toHaveLength(0);
    expect(state.selectedId).toBe('mainPoster');
    expect(state.isEdit).toBe(false);
  });

  it('포스터를 선택했을 때 Delete 키로 항목을 삭제하지 않는다', () => {
    act(() => useEditorStore.getState().selectedBlock('mainPoster'));
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'Delete' });

    const state = useEditorStore.getState();
    expect(state.block).toHaveLength(1);
    expect(state.selectedId).toBe('mainPoster');
  });

  it('Backspace 또는 대화상자가 열린 상태에서는 항목을 삭제하지 않는다', () => {
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'Backspace' });
    expect(useEditorStore.getState().block).toHaveLength(1);

    const dialog = document.createElement('div');
    dialog.setAttribute('role', 'dialog');
    document.body.append(dialog);
    fireEvent.keyDown(window, { key: 'Delete' });

    expect(useEditorStore.getState().block).toHaveLength(1);
  });
});
