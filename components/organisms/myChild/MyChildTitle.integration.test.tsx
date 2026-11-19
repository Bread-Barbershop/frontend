import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { MyChild } from './MyChild';
import { MyChildPreview } from './MyChildPreview';

jest.mock('@/shared/assets/icons/add.svg', () => () => null);
jest.mock('@/components/molecules/text-editor', () => ({
  TextEditor: () => null,
}));

function ChildEditorAndPreview() {
  const block = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'myChild'>;
  return (
    <>
      <MyChild blockInfo={block} id={block.id} />
      <MyChildPreview blockInfo={block} className="" isGuestPage />
    </>
  );
}

describe('아기 소개 제목', () => {
  it('자동 제목 중 한 글자만 지워 저장하고 제목을 비우면 다시 아이 이름을 따른다', async () => {
    const user = userEvent.setup();
    useEditorStore.getState().reset();
    useEditorStore.getState().addBlock('firstBirthday', 'myChild', 'baby');
    render(<ChildEditorAndPreview />);
    const name = screen.getByRole('textbox', { name: '이름' });
    const title = screen.getByRole<HTMLInputElement>('textbox', {
      name: '제목',
    });
    expect(title).toHaveValue('우리 아이의 첫 생일');
    expect(screen.getByText('우리 아이의 첫 생일')).toBeInTheDocument();

    fireEvent.change(name, { target: { value: '하은' } });
    expect(title).toHaveValue('하은이의 첫 생일');
    expect(screen.getByText('하은이의 첫 생일')).toBeInTheDocument();

    await user.click(title);
    title.setSelectionRange(3, 3);
    await user.keyboard('{Backspace}');
    expect(title).toHaveValue('하은의 첫 생일');
    expect(screen.getByText('하은의 첫 생일')).toBeInTheDocument();
    await user.tab();
    fireEvent.change(name, { target: { value: '서아' } });
    expect(title).toHaveValue('하은의 첫 생일');
    await user.clear(title);
    expect(title).toHaveValue('');
    await user.tab();
    expect(title).toHaveValue('서아의 첫 생일');
    expect(screen.getByText('서아의 첫 생일')).toBeInTheDocument();
  });
});
