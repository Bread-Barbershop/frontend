import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { Calendar } from './Calendar';

import type { EditorBlock } from '@/shared/types/block';

const mockUpdateBlock = jest.fn();
const mockWarning = jest.fn();
const mockInsertText = jest.fn();

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: CallableFunction) =>
    selector({ updateBlock: mockUpdateBlock }),
}));

jest.mock('@/shared/hooks/useToast', () => ({
  useToast: () => ({ warning: mockWarning }),
}));

jest.mock('@/components/molecules/time-selector', () => ({
  TimeSelector: () => null,
}));

jest.mock('@/components/molecules/text-editor', () => {
  const mockReact = jest.requireActual('react') as typeof React;

  return {
    TextEditor: mockReact.forwardRef<
      {
        insertText: jest.Mock;
        setText: jest.Mock;
        getEditor: () => null;
      },
      { defaultText?: string }
    >(({ defaultText }, ref) => {
      mockReact.useImperativeHandle(ref, () => ({
        insertText: mockInsertText,
        setText: jest.fn(),
        getEditor: () => null,
      }));

      return (
        <div data-testid="text-editor" style={{ whiteSpace: 'pre-wrap' }}>
          {defaultText}
        </div>
      );
    }),
  };
});

const block: EditorBlock<'calendar'> = {
  id: 'calendar-1',
  component: 'calendar',
  type: 'wedding',
  props: {
    title: '예식 일시',
    subTitle: 'THE WEDDING DATE',
    date: '2026-11-08',
    time: '오후 01:00',
    showStringDate: true,
    template: 'calendarType1',
    showCalendar: true,
    showDday: true,
    messageJson: null,
    messageHtml: null,
    isSubTitle: true,
  },
};

describe('Calendar 날짜 입력', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('잘못된 붙여넣기는 마지막 날짜를 유지하고 경고 토스트를 표시한다', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Calendar blockInfo={block} id={block.id} />);
    const input = screen.getByLabelText('예식일');

    fireEvent.change(input, { target: { value: '2026-11-00' } });
    expect(input).toHaveValue('2026-11-00');
    expect(mockUpdateBlock).not.toHaveBeenCalled();
    expect(mockWarning).toHaveBeenCalledWith('올바른 날짜를 입력해 주세요.');

    fireEvent.blur(input);
    expect(input).toHaveValue('2026-11-08');
    expect(mockWarning).toHaveBeenCalledTimes(1);
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('유효한 날짜는 저장하고 예식 기본 문구를 두 줄 오버레이로 유지한다', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-07T00:00:00Z'));
    render(<Calendar blockInfo={block} id={block.id} />);

    fireEvent.change(screen.getByLabelText('예식일'), {
      target: { value: '2027-01-02' },
    });
    expect(mockUpdateBlock).toHaveBeenCalledWith(block.id, {
      date: '2027-01-02',
    });

    const editorOverlay = screen.getByTestId('text-editor');
    expect(editorOverlay.textContent).toBe(
      '신랑과 신부의 특별한 약속이 이루어지기까지\n(D-Day)일이 남았습니다.'
    );
    expect(editorOverlay).toHaveStyle({ whiteSpace: 'pre-wrap' });

    fireEvent.click(screen.getByRole('button', { name: '디데이' }));
    expect(mockInsertText).toHaveBeenCalledWith('(D-Day)');
  });
});
