import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import type { Editor } from '@tiptap/core';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { Calendar } from './Calendar';
import { CalendarPreview } from './CalendarPreview';

jest.mock('@/shared/assets/icons/color.svg', () => () => null);

jest.mock('@/shared/fonts/fontLoader', () => ({
  hasCustomFontFace: () => false,
}));

jest.mock('@/components/molecules/text-editor/utils/tiptapJsonToHtml', () => {
  const actual = jest.requireActual<
    typeof import('@/components/molecules/text-editor/utils/tiptapJsonToHtml')
  >('@/components/molecules/text-editor/utils/tiptapJsonToHtml');
  return {
    ...actual,
    tiptapJsonToHtmlInBrowser: actual.tiptapJsonToHtmlUniversal,
  };
});

function savedBlock() {
  return useEditorStore.getState().block[0] as EditorBlock<'calendar'>;
}

function CalendarEditor() {
  const block = useEditorStore(
    state => state.block[0]
  ) as EditorBlock<'calendar'>;
  return <Calendar blockInfo={block} id={block.id} />;
}

async function openEditor() {
  const view = render(<CalendarEditor />);
  const editor = await waitFor(() => {
    const element = view.container.querySelector<
      HTMLElement & { editor: Editor }
    >('[contenteditable="true"]');
    if (!element?.editor) throw new Error('편집기 로딩 중');
    return element.editor;
  });
  return { editor, ...view };
}

function openGuestPreview() {
  return render(
    <CalendarPreview
      blockInfo={savedBlock()}
      className=""
      language="ko"
      isGuestPage
      onClick={() => {}}
    />
  );
}

describe('행사 일시 D-Day 문구', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    jest.spyOn(Date, 'now').mockReturnValue(new Date(2028, 0, 1).getTime());
    useEditorStore.getState().addBlock('wedding', 'calendar', 'test-calendar', {
      date: '2028-01-31',
      showDday: true,
      showCalendar: false,
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('예문에서 이름만 바꾸면 줄바꿈과 D-Day를 저장하고 하객에게 남은 날짜를 표시한다', async () => {
    const { editor, unmount } = await openEditor();
    expect(editor.getText()).toContain('신랑과 신부의 특별한 약속');
    expect(savedBlock().props.messageJson).toBeNull();
    act(() => {
      editor.commands.insertContentAt(
        { from: 1, to: 1 + '신랑과 신부'.length },
        '민서와 지훈'
      );
    });
    const { messageHtml, messageJson } = savedBlock().props;
    expect(messageHtml).toContain('(D-Day)일이 남았습니다.');
    expect(messageJson).toEqual(editor.getJSON());
    unmount();
    openGuestPreview();
    const message = await screen.findByText(/민서와 지훈의 특별한 약속/);
    expect(message).toHaveTextContent('30일이 남았습니다.');
    expect(message.querySelector('br')).toBeInTheDocument();
  });

  it('일반 행사는 편집 전에도 행사 문구와 달력 기준 남은 일수를 보여준다', async () => {
    useEditorStore.getState().setBlock([{ ...savedBlock(), type: 'seminar' }]);
    jest
      .spyOn(Date, 'now')
      .mockReturnValue(new Date(2028, 0, 30, 23, 59).getTime());
    const { editor, unmount } = await openEditor();
    expect(editor.getText()).toBe('(D-Day)일 남았습니다.');
    unmount();
    openGuestPreview();
    expect(await screen.findByText('1일 남았습니다.')).toBeInTheDocument();
  });

  it('HTML만 저장된 문구를 서식과 함께 열고 디데이 버튼으로 토큰을 추가한다', async () => {
    useEditorStore.getState().updateBlock<'calendar'>('test-calendar', {
      messageHtml: '<p><strong>다시 만날 날</strong> (D-Day) / </p>',
    });
    const { editor, unmount } = await openEditor();
    expect(editor.getHTML()).toContain('<strong>다시 만날 날</strong>');
    act(() => {
      editor.commands.setTextSelection(editor.state.doc.content.size - 1);
    });
    fireEvent.click(screen.getByRole('button', { name: '디데이' }));
    expect(savedBlock().props.messageHtml?.match(/\(D-Day\)/g)).toHaveLength(2);
    unmount();
    // 이전 저장 형식 중 JSON만 있는 초대장도 하객 화면에서 복원한다.
    useEditorStore
      .getState()
      .updateBlock<'calendar'>('test-calendar', { messageHtml: null });
    openGuestPreview();
    const title = await screen.findByText('다시 만날 날');
    expect(title.tagName).toBe('STRONG');
    expect(title.parentElement).toHaveTextContent(/30\s*\/\s*30/);
  });

  it('문구를 전부 지우고 다시 열어도 편집기와 하객 화면에서 빈 상태를 유지한다', async () => {
    const view = await openEditor();
    act(() => {
      view.editor.commands.clearContent();
    });
    view.unmount();
    const reopened = await openEditor();
    expect(reopened.editor.isEmpty).toBe(true);
    reopened.unmount();
    openGuestPreview();
    expect(await screen.findByText('DAYS')).toBeInTheDocument();
    expect(screen.queryByText(/남았습니다/)).not.toBeInTheDocument();
  });
});
