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
    window.innerWidth = originalInnerWidth;
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
