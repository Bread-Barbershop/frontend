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

  it('가릴 정보 옵션을 접고 펼쳐도 기능과 항목 선택을 유지한다', () => {
    render(<InvitationSettingsButton />);
    fireEvent.click(screen.getByRole('button', { name: '초대장 설정' }));
    const enabled = screen.getByRole('checkbox', {
      name: /행사일이 지나면 개인정보 가리기/,
    });
    fireEvent.click(enabled);
    const media = screen.getByRole('checkbox', { name: /사진·영상/ });
    fireEvent.click(media);
    fireEvent.change(screen.getByLabelText('행사일'), {
      target: { value: '2026-11-21' },
    });
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
});
