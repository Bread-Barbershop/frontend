import { fireEvent, render, screen } from '@testing-library/react';

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
  it('아기 이름이 바뀌면 편집기와 하객 화면의 기본 제목을 갱신하고 직접 입력한 제목을 우선한다', () => {
    useEditorStore.getState().reset();
    useEditorStore.getState().addBlock('firstBirthday', 'myChild', 'baby');
    render(<ChildEditorAndPreview />);
    const name = screen.getByRole('textbox', { name: '이름' });
    const title = screen.getByRole('textbox', { name: '제목' });
    expect(title).toHaveAttribute('placeholder', '우리 아이의 첫 생일');
    expect(screen.getByText('우리 아이의 첫 생일')).toBeInTheDocument();

    fireEvent.change(name, { target: { value: '하은' } });
    expect(title).toHaveAttribute('placeholder', '하은이의 첫 생일');
    expect(screen.getByText('하은이의 첫 생일')).toBeInTheDocument();

    fireEvent.change(title, { target: { value: '우리 집 작은 별' } });
    fireEvent.change(name, { target: { value: '서아' } });
    expect(screen.getByText('우리 집 작은 별')).toBeInTheDocument();
    fireEvent.change(title, { target: { value: '  ' } });
    expect(screen.getByText('서아의 첫 생일')).toBeInTheDocument();
  });
});
