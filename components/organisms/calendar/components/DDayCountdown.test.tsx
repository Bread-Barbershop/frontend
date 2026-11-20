import { act, render, screen } from '@testing-library/react';

import { DDayCountdown } from './DDayCountdown';

function advance(milliseconds = 0) {
  act(() => {
    jest.advanceTimersByTime(milliseconds);
  });
}

describe('일정 카운트다운', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('이미 종료된 일정은 카운트다운과 남은 일수 대신 종료 문구만 표시한다', () => {
    jest.setSystemTime(new Date(2028, 2, 1));
    render(
      <DDayCountdown
        date="2028-02-29"
        time="오후 01:00"
        messageHtml="<p>(D-Day)일이 남았습니다.</p>"
      />
    );
    advance();

    expect(screen.getByText('종료된 일정이에요')).toBeInTheDocument();
    expect(screen.queryByText('DAYS')).not.toBeInTheDocument();
    expect(screen.queryByText(/남았습니다/)).not.toBeInTheDocument();
  });

  it.each<[string | undefined, number]>([
    ['12:00', 12],
    ['오전 12:00', 0],
    ['오후 01:00', 13],
    ['1:00 PM', 13],
    [undefined, 12],
    ['25:61', 12],
  ])('%s 시간이 되는 순간 열린 화면에서도 종료 문구로 바뀐다', (time, hour) => {
    const target = new Date(2028, 1, 29, hour);
    jest.setSystemTime(target.getTime() - 500);
    render(
      <DDayCountdown
        date="2028-02-29"
        time={time}
        messageHtml="<p>(D-Day)일 남았습니다.</p>"
      />
    );
    advance();

    expect(screen.getByText('DAYS')).toBeInTheDocument();
    expect(
      screen.getByText(`${hour === 0 ? 1 : 0}일 남았습니다.`)
    ).toBeInTheDocument();

    advance(500);

    expect(screen.getByText('종료된 일정이에요')).toBeInTheDocument();
    expect(screen.queryByText('DAYS')).not.toBeInTheDocument();
    expect(screen.queryByText(/남았습니다/)).not.toBeInTheDocument();
  });

  it('열린 화면에서 자정이 지나면 디데이 문구의 남은 날짜를 갱신한다', () => {
    jest.setSystemTime(new Date(2028, 1, 28, 23, 59, 59));
    render(
      <DDayCountdown
        date="2028-02-29"
        time="09:00"
        messageHtml="<p>(D-Day)일이 남았습니다.</p>"
      />
    );
    advance();
    expect(screen.getByText('1일이 남았습니다.')).toBeInTheDocument();

    advance(1000);

    expect(screen.getByText('0일이 남았습니다.')).toBeInTheDocument();
    expect(screen.getByText('DAYS')).toBeInTheDocument();
  });
});
