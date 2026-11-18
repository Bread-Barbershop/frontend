import { fireEvent, render, screen } from '@testing-library/react';

import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

import InvitationSettingsButton from './AdditionalFeaturesButton';

describe('초대장 설정', () => {
  beforeEach(() => {
    useEditorStore.getState().reset();
    HTMLDialogElement.prototype.showModal = function () {
      this.open = true;
    };
    HTMLDialogElement.prototype.close = function () {
      this.open = false;
    };
  });

  afterEach(() => jest.restoreAllMocks());

  it('가릴 정보 옵션을 접고 펼쳐도 기능과 항목 선택을 유지한다', () => {
    jest.spyOn(Date, 'now').mockReturnValue(Date.parse('2026-11-19T12:00:00Z'));
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
    fireEvent.click(screen.getByRole('button', { name: '일정이 끝나는 날' }));
    fireEvent.click(screen.getByRole('button', { name: '2026년 11월 21일' }));
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
      eventDate: '2026-11-21',
      fields: ['phone', 'account', 'media'],
    });
  });

  it('달력에서 키보드로 날짜를 이동하고 Escape로 달력만 닫는다', () => {
    useEditorStore.setState({
      invitationPrivacy: {
        enabled: true,
        eventDate: '2026-11-30',
        fields: ['birthday'],
      },
    });
    render(<InvitationSettingsButton />);
    fireEvent.click(screen.getByRole('button', { name: '초대장 설정' }));
    fireEvent.click(
      screen.getByRole('button', { name: '가릴 정보 옵션 펼치기' })
    );
    const trigger = screen.getByRole('button', { name: '일정이 끝나는 날' });
    fireEvent.click(trigger);

    const selected = screen.getByRole('button', { name: '2026년 11월 30일' });
    expect(selected).toHaveFocus();
    expect(screen.getByRole('gridcell', { selected: true })).toContainElement(
      selected
    );
    fireEvent.keyDown(selected, { key: 'ArrowRight' });
    expect(screen.getByRole('grid', { name: '2026년 12월' })).toBeInTheDocument();
    const nextDay = screen.getByRole('button', { name: '2026년 12월 1일' });
    expect(nextDay).toHaveFocus();
    fireEvent.keyDown(nextDay, { key: 'Escape' });

    expect(screen.queryByRole('grid')).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
    expect(trigger).toHaveAccessibleDescription('2026년 11월 30일');
    expect(screen.getByRole('dialog', { name: '초대장 설정' })).toBeInTheDocument();
  });

  it('날짜를 비우면 적용할 수 없으며 취소하면 기존 날짜를 유지한다', () => {
    useEditorStore.setState({
      invitationPrivacy: {
        enabled: true,
        eventDate: '2026-11-21',
        fields: ['birthday'],
      },
    });
    render(<InvitationSettingsButton />);
    fireEvent.click(screen.getByRole('button', { name: '초대장 설정' }));
    fireEvent.click(
      screen.getByRole('button', { name: '가릴 정보 옵션 펼치기' })
    );
    const trigger = screen.getByRole('button', { name: '일정이 끝나는 날' });
    fireEvent.click(trigger);
    fireEvent.click(screen.getByRole('button', { name: '날짜 지우기' }));

    expect(trigger).toHaveAccessibleDescription('날짜 선택');
    expect(screen.getByRole('button', { name: '적용' })).toBeDisabled();
    fireEvent.click(screen.getByRole('button', { name: '취소' }));
    expect(useEditorStore.getState().invitationPrivacy?.eventDate).toBe(
      '2026-11-21'
    );
  });
});
