import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ToastContainer } from '@/components/molecules/toast/ToastContainer';
import { useToastStore } from '@/shared/store/useToastStore';

import { Calendar } from './Calendar';

import type { EditorBlock } from '@/shared/types/block';

const mockUpdateBlock = jest.fn();
jest.mock('@/components/molecules/toast/ToastBar', () => ({
  ToastBar: ({ message }: { message: string }) => <span>{message}</span>,
}));

jest.mock('@/shared/store/editorStore/useEditorStore', () => ({
  useEditorStore: (selector: CallableFunction) =>
    selector({ updateBlock: mockUpdateBlock }),
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
    useToastStore.setState({ message: null, isVisible: false });
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('잘못된 붙여넣기는 마지막 날짜를 유지하고 경고 토스트를 표시한다', () => {
    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(
      <>
        <Calendar blockInfo={block} id={block.id} />
        <ToastContainer />
      </>
    );
    const input = screen.getByLabelText('예식일');

    fireEvent.change(input, { target: { value: '2026-11-00' } });
    expect(input).toHaveValue('2026-11-00');
    expect(mockUpdateBlock).not.toHaveBeenCalled();
    expect(
      screen.getByText('올바른 날짜를 입력해 주세요.')
    ).toBeInTheDocument();

    fireEvent.blur(input);
    expect(input).toHaveValue('2026-11-08');
    expect(alertSpy).not.toHaveBeenCalled();
    alertSpy.mockRestore();
  });

  it('공백을 포함한 날짜를 한 글자씩 입력해도 연·월·일을 보존한다', async () => {
    const user = userEvent.setup();
    render(
      <Calendar
        blockInfo={{ ...block, props: { ...block.props, date: '' } }}
        id={block.id}
      />
    );
    const input = screen.getByLabelText('예식일');
    await user.type(input, '2097. 5. 22');
    expect(input).toHaveValue('2097-05-22');
    expect(mockUpdateBlock).toHaveBeenLastCalledWith(block.id, {
      date: '2097-05-22',
    });
  });

  it('날짜를 고치면 해당 오류를 즉시 닫고, 그대로 두어도 타임아웃 후 화면에서 제거한다', () => {
    jest.useFakeTimers();
    render(
      <>
        <Calendar blockInfo={block} id={block.id} />
        <ToastContainer />
      </>
    );
    const input = screen.getByLabelText('예식일');
    const change = (value: string) =>
      fireEvent.change(input, { target: { value } });
    change('2027-02-30');
    expect(useToastStore.getState().isVisible).toBe(true);
    change('2097. 5. 22');
    expect(input).toHaveValue('2097-05-22');
    expect(useToastStore.getState().isVisible).toBe(false);
    change('2027-02-31');
    act(() => jest.advanceTimersByTime(3500));
    expect(screen.queryByText('올바른 날짜를 입력해 주세요.')).toBeNull();
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

  it('날짜를 고쳐도 다른 작업에서 띄운 토스트는 자기 타임아웃까지 유지한다', () => {
    jest.useFakeTimers();
    render(
      <>
        <Calendar blockInfo={block} id={block.id} />
        <ToastContainer />
      </>
    );
    const input = screen.getByLabelText('예식일');
    fireEvent.change(input, { target: { value: '2027-02-30' } });
    act(() => jest.advanceTimersByTime(2000));
    act(() => useToastStore.getState().showToast('사진 저장 완료', 'success'));
    fireEvent.change(input, { target: { value: '2097-05-22' } });
    act(() => jest.advanceTimersByTime(1500));
    expect(useToastStore.getState().isVisible).toBe(true);
    expect(screen.getByText('사진 저장 완료')).toBeInTheDocument();
    act(() => jest.advanceTimersByTime(2000));
    expect(screen.queryByText('사진 저장 완료')).toBeNull();
  });
});
