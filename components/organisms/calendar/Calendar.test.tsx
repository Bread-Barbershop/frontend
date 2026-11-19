import { fireEvent, render, screen } from '@testing-library/react';

import { Calendar } from './Calendar';

import type { EditorBlock } from '@/shared/types/block';

const mockUpdateBlock = jest.fn();
const mockWarning = jest.fn();

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

jest.mock('@/components/molecules/text-editor', () => ({
  TextEditor: () => null,
}));

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

  it('유효한 날짜를 저장한다', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-07T00:00:00Z'));
    render(<Calendar blockInfo={block} id={block.id} />);

    fireEvent.change(screen.getByLabelText('예식일'), {
      target: { value: '2027-01-02' },
    });
    expect(mockUpdateBlock).toHaveBeenCalledWith(block.id, {
      date: '2027-01-02',
    });
  });
});
