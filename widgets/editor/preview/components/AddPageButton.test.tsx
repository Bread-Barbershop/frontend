import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';

import { useEditorCalloutStore } from '@/shared/store/useEditorCalloutStore';

import AddPageButton from './AddPageButton';

jest.mock('@/components/molecules/editor-callout', () => ({
  EditorCallout: () => null,
}));

jest.mock('./ContentsArea', () => ({
  __esModule: true,
  default: () => null,
}));

jest.mock('@/widgets/editor/preview/hooks/useInvitationTemplate', () => ({
  useInvitationTemplate: () => ({
    applyTemplate: jest.fn(),
    isApplying: false,
  }),
}));

describe('페이지 추가 단축키', () => {
  const originalInnerWidth = window.innerWidth;

  beforeEach(() => {
    window.innerWidth = 1440;
    useEditorCalloutStore.getState().resetCallouts();
  });

  afterEach(() => {
    jest.restoreAllMocks();
    window.innerWidth = originalInnerWidth;
  });

  it('버튼 바로 아래에 열고 화면 크기가 변하면 버튼 위치를 다시 따른다', () => {
    render(<AddPageButton />);
    const button = screen.getByRole('button', { name: '+페이지 추가' });
    const bounds = jest.spyOn(button, 'getBoundingClientRect');
    bounds.mockReturnValue(new DOMRect(900, 160, 112, 44));
    jest
      .spyOn(HTMLElement.prototype, 'offsetWidth', 'get')
      .mockReturnValue(656);
    fireEvent.click(button);
    const dialog = screen.getByRole('dialog', { name: '블록 추가' });
    expect(dialog).toHaveStyle({ top: '212px', left: '356px' });

    bounds.mockReturnValue(new DOMRect(450, 220, 112, 44));
    fireEvent(window, new Event('resize'));
    expect(dialog).toHaveStyle({ top: '272px', left: '12px' });
  });

  it('/ 키를 누르면 블록 검색창을 열고 포커스한다', () => {
    render(<AddPageButton />);

    fireEvent.keyDown(window, { key: '/' });

    expect(
      screen.getByRole('dialog', { name: '블록 추가' })
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText('블록 검색')).toHaveFocus();
  });

  it('입력 중이거나 대화상자가 열려 있거나 작은 화면이면 / 키로 열지 않는다', () => {
    render(<AddPageButton />);

    const input = document.createElement('input');
    document.body.append(input);
    fireEvent.keyDown(input, { key: '/' });
    expect(
      screen.queryByRole('dialog', { name: '블록 추가' })
    ).not.toBeInTheDocument();
    input.remove();

    const activeDialog = document.createElement('div');
    activeDialog.setAttribute('role', 'dialog');
    document.body.append(activeDialog);
    fireEvent.keyDown(window, { key: '/' });
    expect(
      screen.queryByRole('dialog', { name: '블록 추가' })
    ).not.toBeInTheDocument();
    activeDialog.remove();

    window.innerWidth = 1280;
    fireEvent.keyDown(window, { key: '/' });
    expect(
      screen.queryByRole('dialog', { name: '블록 추가' })
    ).not.toBeInTheDocument();
  });
});
