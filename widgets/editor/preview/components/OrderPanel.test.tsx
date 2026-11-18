import { act, fireEvent, render, screen } from '@testing-library/react';
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
    document
      .querySelectorAll('[role="dialog"], [data-shortcut-guard-test]')
      .forEach(dialog => dialog.remove());
  });

  it('선택한 항목을 삭제하고 포스터를 선택한다', () => {
    render(<OrderPanel />);

    fireEvent.keyDown(window, { key: 'Delete' });

    const state = useEditorStore.getState();
    expect(state.block).toHaveLength(0);
    expect(state.selectedId).toBe('mainPoster');
    expect(state.isEdit).toBe(false);
  });

  it('저장된 방명록은 순서에서 숨기고 Delete 키로 삭제하지 않는다', () => {
    act(() => {
      const state = useEditorStore.getState();
      state.addBlock('wedding', 'guestbook', 'saved-guestbook');
      state.selectedBlock('saved-guestbook');
    });
    render(<OrderPanel />);
    expect(screen.queryByText('saved-guestbook')).not.toBeInTheDocument();
    expect(screen.getByText('test-greeting')).toBeInTheDocument();
    fireEvent.keyDown(window, { key: 'Delete' });
    expect(useEditorStore.getState().block).toHaveLength(2);
    expect(
      useEditorStore
        .getState()
        .block.some(block => block.id === 'saved-guestbook')
    ).toBe(true);
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

  it('열린 네이티브 대화상자 안에서 Delete를 눌러도 배경 블록을 지우지 않는다', () => {
    render(<OrderPanel />);

    const dialog = document.createElement('dialog');
    dialog.open = true;
    dialog.dataset.shortcutGuardTest = 'true';
    const cancelButton = document.createElement('button');
    cancelButton.textContent = '취소';
    dialog.append(cancelButton);
    document.body.append(dialog);
    cancelButton.focus();

    fireEvent.keyDown(cancelButton, { key: 'Delete' });

    expect(useEditorStore.getState().block).toHaveLength(1);
  });

  it('네이티브 대화상자를 닫으면 Delete 단축키가 다시 동작한다', () => {
    render(<OrderPanel />);

    const dialog = document.createElement('dialog');
    dialog.open = true;
    dialog.dataset.shortcutGuardTest = 'true';
    document.body.append(dialog);
    dialog.open = false;

    fireEvent.keyDown(window, { key: 'Delete' });

    expect(useEditorStore.getState().block).toHaveLength(0);
  });
});
