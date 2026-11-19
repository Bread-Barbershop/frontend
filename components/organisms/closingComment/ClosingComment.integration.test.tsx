import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import ClosingComment from './ClosingComment';
import ClosingCommentPreview from './ClosingCommentPreview';

// Next/Jest resolves SVG imports to the same static image module.
jest.mock('@/shared/assets/icons/alignCenter.svg', () => () => null);
jest.mock('@/shared/fonts/fontLoader', () => ({
  hasCustomFontFace: () => true,
  loadCustomFont: jest.fn().mockResolvedValue(undefined),
  loadFontPreview: jest.fn().mockResolvedValue(undefined),
}));

function ClosingEditorAndPreview() {
  const block = useEditorStore(state =>
    state.block.find(
      (item): item is EditorBlock<'closingComment'> =>
        item.component === 'closingComment'
    )
  )!;
  return (
    <>
      <ClosingComment blockInfo={block} id={block.id} />
      <section aria-label="초대장 미리보기">
        <ClosingCommentPreview blockInfo={block} className="" />
      </section>
    </>
  );
}

describe('돌잔치 마무리 문구 편집', () => {
  beforeAll(() => {
    Range.prototype.getClientRects = jest.fn().mockReturnValue([]);
    Range.prototype.getBoundingClientRect = () =>
      document.body.getBoundingClientRect();
    window.ResizeObserver = jest.fn().mockImplementation(() => ({
      observe: jest.fn(),
      disconnect: jest.fn(),
    }));
  });

  beforeEach(() => {
    const store = useEditorStore.getState();
    store.reset();
    store.addBlock('firstBirthday', 'myChild', 'child', { name: '하은' });
    store.addBlock('firstBirthday', 'closingComment', 'closing');
  });

  it('돌잔치 예시를 선택한 후 직접 고친 문구는 아이 이름이 바뀌어도 유지한다', async () => {
    const { container } = render(<ClosingEditorAndPreview />);
    const preview = within(
      screen.getByRole('region', { name: '초대장 미리보기' })
    );
    const sentence = '하은이가 맞이한 첫 생일을 함께 기뻐해 주세요.';
    fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
    fireEvent.click(screen.getByRole('radio', { name: sentence }));
    expect(await preview.findByText(sentence)).toBeInTheDocument();

    const custom = '하은의 첫돌에 초대해요!';
    const paragraph = container.querySelector('[contenteditable="true"] p')!;
    await act(async () => {
      paragraph.textContent = custom;
    });
    await waitFor(() => expect(preview.getByText(custom)).toBeInTheDocument());

    act(() =>
      useEditorStore
        .getState()
        .updateBlock<'myChild'>('child', { name: '서아' })
    );
    fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
    expect(
      screen.getByRole('radio', {
        name: '서아가 맞이한 첫 생일을 함께 기뻐해 주세요.',
      })
    ).toBeInTheDocument();
    expect(preview.getByText(custom)).toBeInTheDocument();
  });

  it('아기 소개가 여러 개이면 특정 아이 이름을 고르지 않는다', () => {
    useEditorStore
      .getState()
      .addBlock('firstBirthday', 'myChild', 'second', { name: '서아' });
    render(<ClosingEditorAndPreview />);
    fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
    expect(
      screen.getByRole('radio', { name: '첫 생일을 함께 기뻐해 주세요.' })
    ).toBeInTheDocument();
  });

  it('꺾쇠가 있는 이름도 미리보기에서 입력한 글자로 표시한다', async () => {
    useEditorStore
      .getState()
      .updateBlock<'myChild'>('child', { name: '별<Bom>' });
    render(<ClosingEditorAndPreview />);
    const sentence = '별<Bom>의 첫 번째 생일을 함께 축하해 주세요.';
    fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
    fireEvent.click(screen.getByRole('radio', { name: sentence }));
    const preview = within(
      screen.getByRole('region', { name: '초대장 미리보기' })
    );
    expect(await preview.findByText(sentence)).toBeInTheDocument();
  });
});
