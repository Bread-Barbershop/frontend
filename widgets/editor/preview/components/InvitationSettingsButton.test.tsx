import { fireEvent, render, screen } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import InvitationSettingsButton from './AdditionalFeaturesButton';

describe('초대장 설정', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    // 한국 시간은 윤일이고, UTC에서는 아직 2월 28일이다.
    jest.setSystemTime(new Date('2028-02-28T15:30:00Z'));
    useEditorStore.getState().reset();
    HTMLDialogElement.prototype.showModal = function () {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function () {
      this.open = false;
    };
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('가릴 정보 옵션을 접고 펼쳐도 기능과 항목 선택을 유지한다', () => {
    render(<InvitationSettingsButton />);
    fireEvent.click(screen.getByRole('button', { name: '초대장 설정' }));
    const enabled = screen.getByRole('checkbox', {
      name: /일정이 끝나면 개인정보 가리기/,
    });
    expect(
      screen.getByText('일정 다음 날 00:00부터 · 한국 시간 기준')
    ).toBeInTheDocument();
    fireEvent.click(enabled);
    const media = screen.getByRole('checkbox', { name: /사진·영상/ });
    fireEvent.click(media);
    fireEvent.click(screen.getByRole('button', { name: /일정이 끝나는 날/ }));
    fireEvent.click(screen.getByRole('button', { name: '2028년 2월 21일' }));
    fireEvent.click(
      screen.getByRole('button', { name: '가릴 정보 옵션 접기' })
    );
    expect(enabled).toBeChecked();
    expect(
      screen.queryByRole('checkbox', { name: /사진·영상/ })
    ).not.toBeInTheDocument();
    fireEvent.click(
      screen.getByRole('button', { name: '가릴 정보 옵션 펼치기' })
    );
    expect(media).toBeChecked();
    fireEvent.click(screen.getByRole('button', { name: '적용' }));
    expect(useEditorStore.getState().invitationPrivacy).toEqual({
      enabled: true,
      eventDate: '2028-02-21',
      fields: ['phone', 'account', 'media'],
    });
  });

  it('방향키로 월을 넘겨 날짜를 고르고 적용한 값은 YYYY-MM-DD로 저장한다', () => {
    render(<InvitationSettingsButton />);
    fireEvent.click(screen.getByRole('button', { name: '초대장 설정' }));
    fireEvent.click(
      screen.getByRole('checkbox', { name: /일정이 끝나면 개인정보 가리기/ })
    );
    const dateTrigger = screen.getByRole('button', {
      name: /일정이 끝나는 날/,
    });
    fireEvent.click(dateTrigger);
    const leapDay = screen.getByRole('button', { name: '2028년 2월 29일' });
    expect(leapDay).toHaveFocus();

    fireEvent.keyDown(leapDay, { key: 'ArrowRight' });
    const nextDay = screen.getByRole('button', { name: '2028년 3월 1일' });
    expect(nextDay).toHaveFocus();
    fireEvent.click(nextDay);

    expect(
      screen.getByRole('textbox', { name: '일정이 끝나는 날' })
    ).toHaveValue('2028-03-01');
    expect(dateTrigger).toHaveFocus();
    expect(useEditorStore.getState().invitationPrivacy).toBeUndefined();
    fireEvent.click(screen.getByRole('button', { name: '적용' }));
    expect(useEditorStore.getState().invitationPrivacy?.eventDate).toBe(
      '2028-03-01'
    );
  });

  it('달력에서 Escape를 누르면 설정을 유지하고 날짜 필드로 돌아온다', () => {
    render(<InvitationSettingsButton />);
    fireEvent.click(screen.getByRole('button', { name: '초대장 설정' }));
    fireEvent.click(
      screen.getByRole('checkbox', { name: /일정이 끝나면 개인정보 가리기/ })
    );
    const dateTrigger = screen.getByRole('button', {
      name: /일정이 끝나는 날/,
    });
    fireEvent.click(dateTrigger);
    const activeDay = screen.getByRole('button', { name: '2028년 2월 29일' });

    expect(fireEvent.keyDown(activeDay, { key: 'Escape' })).toBe(false);

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(dateTrigger).toHaveFocus();
  });

  it('날짜를 지우면 적용을 막고 오늘을 선택하면 한국 날짜를 다시 채운다', () => {
    useEditorStore.setState({
      invitationPrivacy: {
        enabled: true,
        eventDate: '2028-02-01',
        fields: ['phone'],
      },
    });
    render(<InvitationSettingsButton />);
    fireEvent.click(screen.getByRole('button', { name: '초대장 설정' }));
    fireEvent.click(
      screen.getByRole('button', { name: '가릴 정보 옵션 펼치기' })
    );
    const dateTrigger = screen.getByRole('button', {
      name: /일정이 끝나는 날/,
    });
    const apply = screen.getByRole('button', { name: '적용' });

    fireEvent.click(dateTrigger);
    fireEvent.click(screen.getByRole('button', { name: '날짜 지우기' }));
    expect(apply).toBeDisabled();
    const dateInput = screen.getByRole('textbox', { name: '일정이 끝나는 날' });
    expect(dateInput).toHaveAccessibleDescription(
      '일정이 끝나는 날을 입력해 주세요.'
    );

    fireEvent.click(dateTrigger);
    fireEvent.click(screen.getByRole('button', { name: '오늘' }));
    expect(dateInput).toHaveValue('2028-02-29');
    expect(apply).toBeEnabled();

    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(useEditorStore.getState().invitationPrivacy?.eventDate).toBe(
      '2028-02-01'
    );
  });

  it('먼 미래의 날짜도 숫자로 입력할 수 있고 유효한 윤일만 적용한다', () => {
    render(<InvitationSettingsButton />);
    fireEvent.click(screen.getByRole('button', { name: '초대장 설정' }));
    fireEvent.click(
      screen.getByRole('checkbox', { name: /일정이 끝나면 개인정보 가리기/ })
    );
    const dateInput = screen.getByRole('textbox', { name: '일정이 끝나는 날' });
    const apply = screen.getByRole('button', { name: '적용' });
    fireEvent.change(dateInput, { target: { value: '2100-02-29' } });
    expect(apply).toBeDisabled();

    fireEvent.change(dateInput, { target: { value: '24000229' } });
    expect(dateInput).toHaveValue('2400-02-29');
    fireEvent.click(apply);

    expect(useEditorStore.getState().invitationPrivacy?.eventDate).toBe(
      '2400-02-29'
    );
  });
});
