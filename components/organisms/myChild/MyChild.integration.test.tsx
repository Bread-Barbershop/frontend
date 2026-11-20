import { fireEvent, render, screen } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { useToastStore } from '@/shared/store/useToastStore';
import type { EditorBlock } from '@/shared/types/block';

import { MyChild } from './MyChild';

jest.mock('@/shared/assets/icons/add.svg', () => () => null);
jest.mock('@/components/molecules/text-editor', () => ({
  TextEditor: () => null,
}));

function ChildEditor() {
  const block = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'myChild'>;
  return <MyChild id={block.id} blockInfo={block} />;
}

function savedBirthday() {
  const block = useEditorStore.getState().block[0] as EditorBlock<'myChild'>;
  return block.props.birthday;
}

describe('아기 소개의 태어난 날', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    useEditorStore.getState().addBlock('firstBirthday', 'myChild', 'baby', {
      birthday: '2024.02.29',
    });
    useToastStore.setState(useToastStore.getInitialState(), true);
  });

  it('존재하지 않는 날짜는 입력칸에 안내하고 올바르게 고치면 즉시 반영한다', () => {
    render(<ChildEditor />);
    const input = screen.getByRole('textbox', { name: '태어난 날' });
    fireEvent.change(input, { target: { value: '2026.02.30' } });
    expect(input).toBeInvalid();
    expect(input).toHaveAccessibleDescription('존재하지 않는 날짜예요.');
    expect(useToastStore.getState().isVisible).toBe(false);

    fireEvent.blur(input);
    expect(input).toHaveValue('2026.02.30');
    expect(savedBirthday()).toBe('2024.02.29');

    fireEvent.change(input, { target: { value: '2026.02.28' } });
    expect(input).toBeValid();
    expect(input).not.toHaveAttribute('aria-describedby');
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(savedBirthday()).toBe('2026.02.28');
  });

  it('미완성 날짜는 입력칸을 떠날 때 안내하고 선택 항목을 비우면 안내가 사라진다', () => {
    render(<ChildEditor />);
    const input = screen.getByRole('textbox', { name: '태어난 날' });
    fireEvent.change(input, { target: { value: '2026.02' } });
    expect(input).toBeValid();
    fireEvent.blur(input);
    expect(input).toHaveAccessibleDescription('날짜를 모두 입력해 주세요.');
    expect(savedBirthday()).toBe('2024.02.29');

    fireEvent.change(input, { target: { value: '' } });
    expect(input).toBeValid();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(savedBirthday()).toBe('');
  });
});
