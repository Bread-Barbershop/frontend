import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { useValidatedDateDraft } from './useValidatedDateDraft';

afterEach(() => {
  jest.useRealTimers();
});

interface HarnessProps {
  value?: string;
  separator?: '-' | '.';
  allowPast?: boolean;
  onCommit: jest.Mock;
  warning: jest.Mock;
}

function DateDraftHarness({
  value,
  separator,
  allowPast,
  onCommit,
  warning,
}: HarnessProps) {
  const { draft, handleChange, handleBlur } = useValidatedDateDraft({
    value,
    separator,
    allowPast,
    onCommit,
    warning,
  });

  return (
    <input
      aria-label="날짜"
      value={draft}
      onChange={handleChange}
      onBlur={handleBlur}
    />
  );
}

describe('useValidatedDateDraft', () => {
  it('입력 중인 앞자리 0과 불완전한 날짜는 저장하지 않고 완성 날짜를 정규화한다', () => {
    const onCommit = jest.fn();
    const warning = jest.fn();
    render(<DateDraftHarness onCommit={onCommit} warning={warning} />);
    const input = screen.getByLabelText('날짜');

    fireEvent.change(input, { target: { value: '0' } });
    expect(input).toHaveValue('0');
    expect(onCommit).not.toHaveBeenCalled();

    fireEvent.change(input, { target: { value: '20000229' } });
    expect(input).toHaveValue('2000-02-29');
    expect(onCommit).toHaveBeenLastCalledWith('2000-02-29');
    expect(warning).not.toHaveBeenCalled();
  });

  it('빈 필드에 날짜를 한 글자씩 입력하면 정상적인 날짜로 완성한다', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn();
    const warning = jest.fn();
    render(<DateDraftHarness onCommit={onCommit} warning={warning} />);
    const input = screen.getByLabelText('날짜');

    await user.type(input, '20300125');

    expect(input).toHaveValue('2030-01-25');
    expect(onCommit).toHaveBeenLastCalledWith('2030-01-25');
    expect(warning).not.toHaveBeenCalled();
  });

  it('마지막 날짜를 지운 뒤 다시 입력해도 구분자를 복구한다', async () => {
    const user = userEvent.setup();
    const onCommit = jest.fn();
    const warning = jest.fn();
    render(<DateDraftHarness onCommit={onCommit} warning={warning} />);
    const input = screen.getByLabelText('날짜');

    await user.type(input, '20300125');
    await user.keyboard('{Backspace}{Backspace}');
    await user.type(input, '25');

    expect(input).toHaveValue('2030-01-25');
    expect(onCommit).toHaveBeenLastCalledWith('2030-01-25');
    expect(warning).not.toHaveBeenCalled();
  });

  it('붙여 넣은 잘못된 날짜는 저장하지 않고 blur에서 경고를 중복하지 않는다', () => {
    const onCommit = jest.fn();
    const warning = jest.fn();
    render(
      <DateDraftHarness
        value="2024-02-29"
        onCommit={onCommit}
        warning={warning}
      />
    );
    const input = screen.getByLabelText('날짜');

    fireEvent.change(input, { target: { value: '19000229' } });
    expect(input).toHaveValue('1900-02-29');
    expect(onCommit).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledTimes(1);

    fireEvent.blur(input);
    expect(input).toHaveValue('2024-02-29');
    expect(warning).toHaveBeenCalledTimes(1);
  });

  it.each(['-2027-01-01', '2027---0101', '2027-0-101'])(
    '구분자가 잘못된 날짜 %s를 다른 날짜로 바꾸지 않고 거부한다', value => {
      const onCommit = jest.fn();
      const warning = jest.fn();
      render(
        <DateDraftHarness
          value="2024-02-29"
          onCommit={onCommit}
          warning={warning}
        />
      );
      const input = screen.getByLabelText('날짜');

      fireEvent.change(input, { target: { value } });

      expect(input).toHaveValue(value);
      expect(onCommit).not.toHaveBeenCalled();
      expect(warning).toHaveBeenCalledTimes(1);

      fireEvent.blur(input);
      expect(input).toHaveValue('2024-02-29');
      expect(warning).toHaveBeenCalledTimes(1);
    }
  );

  it('불완전한 날짜는 blur에서만 경고하고 마지막 저장값을 유지한다', () => {
    const onCommit = jest.fn();
    const warning = jest.fn();
    render(
      <DateDraftHarness
        value="2024-02-29"
        onCommit={onCommit}
        warning={warning}
      />
    );
    const input = screen.getByLabelText('날짜');

    fireEvent.change(input, { target: { value: '2026-0' } });
    expect(onCommit).not.toHaveBeenCalled();
    expect(warning).not.toHaveBeenCalled();

    fireEvent.blur(input);
    expect(input).toHaveValue('2024-02-29');
    expect(onCommit).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith('날짜를 모두 입력해 주세요.');
  });

  it('아이 생일은 점 형식으로 저장하고 과거 날짜를 허용한다', () => {
    const onCommit = jest.fn();
    const warning = jest.fn();
    render(
      <DateDraftHarness
        value="2024.12.12"
        separator="."
        allowPast
        onCommit={onCommit}
        warning={warning}
      />
    );

    fireEvent.change(screen.getByLabelText('날짜'), {
      target: { value: '19900102' },
    });

    expect(onCommit).toHaveBeenCalledWith('1990.01.02');
    expect(warning).not.toHaveBeenCalled();
  });

  it('달력 날짜는 KST 기준 오늘과 미래만 허용한다', () => {
    jest.useFakeTimers().setSystemTime(new Date('2026-11-07T15:30:00Z'));
    const onCommit = jest.fn();
    const warning = jest.fn();
    render(
      <DateDraftHarness
        separator="-"
        allowPast={false}
        onCommit={onCommit}
        warning={warning}
      />
    );
    const input = screen.getByLabelText('날짜');

    fireEvent.change(input, { target: { value: '2026-11-07' } });
    expect(onCommit).not.toHaveBeenCalled();
    expect(warning).toHaveBeenCalledWith('이전 날짜는 입력할 수 없습니다.');

    fireEvent.change(input, { target: { value: '2026-11-08' } });
    expect(onCommit).toHaveBeenLastCalledWith('2026-11-08');
  });

  it('빈 값은 유효한 삭제로 저장한다', () => {
    const onCommit = jest.fn();
    const warning = jest.fn();
    render(
      <DateDraftHarness
        value="2024-02-29"
        onCommit={onCommit}
        warning={warning}
      />
    );

    fireEvent.change(screen.getByLabelText('날짜'), { target: { value: '' } });

    expect(onCommit).toHaveBeenCalledWith('');
    expect(warning).not.toHaveBeenCalled();
  });
});
