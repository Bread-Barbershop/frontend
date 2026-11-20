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

beforeAll(() => {
  Range.prototype.getClientRects = jest.fn().mockReturnValue([]);
  Range.prototype.getBoundingClientRect = () =>
    document.body.getBoundingClientRect();
  window.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    disconnect: jest.fn(),
  }));
});

beforeEach(() => useEditorStore.getState().reset());

describe('돌잔치 마무리 문구 편집', () => {
  beforeEach(() => {
    const store = useEditorStore.getState();
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

describe('다른 행사의 마무리 문구 편집', () => {
  it('신랑신부 소개의 이름 순서를 따르고 한 명만 있으면 두 사람으로 안내한다', () => {
    const store = useEditorStore.getState();
    store.addBlock('wedding', 'coupleIntroduction', 'couple', {
      groom: '지훈',
      bride: '민서',
      brideFirst: true,
    });
    store.addBlock('wedding', 'closingComment', 'closing');
    render(<ClosingEditorAndPreview />);
    fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
    expect(
      screen.getByRole('radio', {
        name: '귀한 시간 내어 민서 · 지훈과 함께해 주세요.',
      })
    ).toBeInTheDocument();
    act(() => store.updateBlock<'coupleIntroduction'>('couple', { bride: '' }));
    expect(
      screen.getByRole('radio', {
        name: '귀한 시간 내어 두 사람과 함께해 주세요.',
      })
    ).toBeInTheDocument();
  });

  it('행사명을 다시 열어 수정해도 이전에 선택한 본문은 새로 선택할 때까지 유지한다', async () => {
    useEditorStore.getState().addBlock('seminar', 'closingComment', 'closing');
    render(<ClosingEditorAndPreview />);
    const preview = within(
      screen.getByRole('region', { name: '초대장 미리보기' })
    );
    fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
    fireEvent.change(screen.getByRole('textbox', { name: '행사명' }), {
      target: { value: '봄 포럼' },
    });
    const sentence = '봄 포럼을 통해 새로운 연결을 만들어가요.';
    fireEvent.click(screen.getByRole('radio', { name: sentence }));
    expect(await preview.findByText(sentence)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
    const field = screen.getByRole('textbox', { name: '행사명' });
    expect(field).toHaveValue('봄 포럼');
    fireEvent.change(field, { target: { value: '봄 세미나' } });
    expect(
      screen.getByRole('radio', {
        name: '봄 세미나를 통해 새로운 연결을 만들어가요.',
      })
    ).toBeInTheDocument();
    expect(preview.getByText(sentence)).toBeInTheDocument();
  });

  it('생일 주인공 이름으로 예시를 넣고 다른 행사 탭에서 주최 정보를 반영한다', async () => {
    const store = useEditorStore.getState();
    store.addBlock('birthday', 'closingComment', 'closing');
    render(<ClosingEditorAndPreview />);
    fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
    fireEvent.change(screen.getByRole('textbox', { name: '생일 주인공' }), {
      target: { value: '민서' },
    });
    const sentence = '민서의 생일을 함께 축하해 주세요.';
    fireEvent.click(screen.getByRole('radio', { name: sentence }));
    expect(
      await within(
        screen.getByRole('region', { name: '초대장 미리보기' })
      ).findByText(sentence)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
    fireEvent.click(screen.getByRole('button', { name: 'etc.' }));
    fireEvent.change(screen.getByRole('textbox', { name: '주최자명' }), {
      target: { value: '문화재단' },
    });
    expect(
      screen.getByRole('radio', { name: /문화재단이 준비한/ })
    ).toBeInTheDocument();
    act(() =>
      store.addBlock('seminar', 'organizerInformation', 'host', {
        organizer: '연구소',
      })
    );
    expect(
      screen.getByRole('radio', { name: /연구소가 준비한/ })
    ).toBeInTheDocument();
  });
});
