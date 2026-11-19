import { act, fireEvent, render, screen, within } from '@testing-library/react';
import type { ReactNode } from 'react';

import GuestRenderer from '@/app/guest/[id]/components/GuestRenderer';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { Interview } from './Interview';
import {
  createInterviewQuestion,
  type InterviewQuestion,
} from './interviewList';

jest.mock('next/navigation', () => ({ usePathname: () => '/i/test' }));
jest.mock('embla-carousel-react', () => () => [null, undefined]);
jest.mock('@/components/atoms/image', () => ({
  Image: ({ alt }: { alt: string }) => <span role="img" aria-label={alt} />,
}));
jest.mock('@/components/molecules/scroll-fade-in/ScrollFadeIn', () => ({
  ScrollFadeIn: ({ children }: { children: ReactNode }) => children,
}));
jest.mock('@/shared/assets/icons/alignCenter.svg', () => () => null);
jest.mock('@/shared/fonts/fontLoader', () => ({
  hasCustomFontFace: () => true,
  loadCustomFont: jest.fn().mockResolvedValue(undefined),
  loadFontPreview: jest.fn().mockResolvedValue(undefined),
}));

function EditorAndGuest() {
  const block = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'interview'>;
  const { backgroundColor, titleData, bodyData, isZoom, scrollAnimation } =
    useEditorStore.getState();
  return (
    <>
      <Interview blockInfo={block} id={block.id} />
      <section aria-label="하객 화면">
        <GuestRenderer
          blocks={[block]}
          bulkData={{
            backgroundColor,
            titleData,
            bodyData,
            isZoom,
            scrollAnimation,
            sectionStyle: 'rounded',
          }}
        />
      </section>
    </>
  );
}

function showInterview(questions?: InterviewQuestion[]) {
  useEditorStore
    .getState()
    .addBlock('wedding', 'interview', 'block', questions ? { questions } : {});
  render(<EditorAndGuest />);
  return within(screen.getByRole('region', { name: '하객 화면' }));
}

function legacyAnswer() {
  const messageJson = {
    type: 'doc',
    content: [
      '신랑',
      '"내용을 입력해 주세요"',
      '',
      '신부',
      '"내용을 입력해 주세요"',
    ].map(text =>
      text
        ? { type: 'paragraph', content: [{ type: 'text', text }] }
        : { type: 'paragraph' }
    ),
  };
  return { messageJson, messageHtml: tiptapJsonToHtmlUniversal(messageJson) };
}

beforeAll(() => {
  HTMLElement.prototype.scrollTo = jest.fn();
  window.ResizeObserver = jest
    .fn()
    .mockImplementation(() => ({ observe: jest.fn(), disconnect: jest.fn() }));
});
beforeEach(() => useEditorStore.getState().reset());

it('빈 항목을 추가하면 안내는 편집기에만 보이고, 직접 쓴 답변을 하객이 펼칠 수 있다', async () => {
  const guest = showInterview();
  fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
  fireEvent.click(screen.getByDisplayValue('빈 항목 추가'));
  const block = useEditorStore.getState().block[0] as EditorBlock<'interview'>;
  expect(block.props.questions).toHaveLength(2);
  expect(block.props.questions?.[1].answer).toEqual({
    messageJson: null,
    messageHtml: null,
  });

  const fields = screen.getAllByRole('textbox', { name: '인터뷰' });
  const editor = document.querySelectorAll<HTMLElement>(
    '[contenteditable="true"]'
  )[1];
  const paragraph = editor.querySelector('p')!;
  expect(paragraph).toHaveAttribute('data-placeholder', '답변을 입력해 주세요');
  expect(guest.queryByText('인터뷰')).not.toBeInTheDocument();
  expect(document.querySelector('[data-section-style="rounded"]')).toBeNull();

  fireEvent.change(fields[1], {
    target: { value: '서로의 첫인상은 어땠나요?' },
  });
  expect(guest.getByText('서로의 첫인상은 어땠나요?')).toBeInTheDocument();
  expect(guest.queryByRole('button')).not.toBeInTheDocument();

  await act(async () => {
    paragraph.textContent = '처음부터 대화가 잘 통했어요.';
  });
  const button = await guest.findByRole('button', {
    name: '인터뷰 더 읽어보기',
  });
  fireEvent.click(button);
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(guest.getByText('처음부터 대화가 잘 통했어요.')).toBeInTheDocument();
});

it('신랑·신부 답변 예시를 직접 선택하면 예문을 편집할 수 있다', async () => {
  const guest = showInterview();
  fireEvent.click(screen.getByRole('button', { name: '예시보기' }));
  fireEvent.click(screen.getByDisplayValue('신랑·신부 답변 예시'));
  const editor = document.querySelectorAll<HTMLElement>(
    '[contenteditable="true"]'
  )[1];
  const reply = '처음 만났는데도 오랜 친구처럼 대화가 편했어요.';
  const paragraph = within(editor).getByText(reply);
  await act(async () => {
    paragraph.textContent = '함께 걷던 길이 기억나요.';
  });
  fireEvent.click(guest.getByRole('button', { name: '인터뷰 더 읽어보기' }));
  expect(guest.getByText('함께 걷던 길이 기억나요.')).toBeInTheDocument();
  expect(guest.queryByText(reply)).not.toBeInTheDocument();
});

it('이전 버전의 제목과 기본 답변만 담긴 항목은 빈 편집칸으로 연다', () => {
  const question = {
    ...createInterviewQuestion(),
    question: '제목을 입력해주세요',
    answer: legacyAnswer(),
  };
  const guest = showInterview([question]);
  expect(screen.getByRole('textbox', { name: '인터뷰' })).toHaveValue('');
  expect(document.querySelector('[contenteditable="true"]')).toHaveTextContent(
    /^$/
  );
  expect(guest.queryByText('인터뷰')).not.toBeInTheDocument();
});

it('이전 기본 답변을 고친 경우 작성자의 문구를 보존한다', () => {
  const answer = legacyAnswer();
  answer.messageJson.content[1] = {
    type: 'paragraph',
    content: [{ type: 'text', text: '평생 함께하고 싶었어요.' }],
  };
  const guest = showInterview([{ ...createInterviewQuestion(), answer }]);
  fireEvent.click(guest.getByRole('button', { name: '인터뷰 더 읽어보기' }));
  expect(guest.getByText('평생 함께하고 싶었어요.')).toBeInTheDocument();
});

it('기존 HTML만 있는 답변도 편집기와 하객 화면에 표시한다', () => {
  const question = {
    ...createInterviewQuestion(),
    answer: {
      messageJson: null,
      messageHtml: '<p><strong>함께한 봄날</strong></p>',
    },
  };
  const guest = showInterview([question]);
  expect(
    document.querySelector('[contenteditable="true"] strong')
  ).toHaveTextContent('함께한 봄날');
  fireEvent.click(guest.getByRole('button', { name: '인터뷰 더 읽어보기' }));
  expect(guest.getByText('함께한 봄날').tagName).toBe('STRONG');
});

it('배너만 올린 항목은 사진을 표시하고 빈 답변 버튼을 숨긴다', () => {
  const guest = showInterview([
    {
      ...createInterviewQuestion(),
      image: ['/images/banner.png'],
      answer: { messageJson: null, messageHtml: '<p>&nbsp;<br></p>' },
    },
  ]);
  expect(guest.getByRole('img', { name: '인터뷰 이미지' })).toBeInTheDocument();
  expect(guest.queryByRole('button')).not.toBeInTheDocument();
});
