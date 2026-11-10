import { fireEvent, render, screen } from '@testing-library/react';

import { getInvitationTemplates } from '@/shared/data/invitationTemplates';

import InvitationTemplatePicker from './InvitationTemplatePicker';

describe('InvitationTemplatePicker', () => {
  const templates = getInvitationTemplates('wedding');

  it('포스터와 설명을 보여주고 카드 선택 상태를 접근성 속성으로 표시한다', () => {
    const onSelect = jest.fn();

    render(
      <InvitationTemplatePicker
        type="wedding"
        selectedId={templates[0].id}
        isApplying={false}
        onSelect={onSelect}
        onTypeChange={jest.fn()}
        onBack={jest.fn()}
        onClose={jest.fn()}
        onApply={jest.fn()}
      />
    );

    const selectedCard = screen.getByRole('button', {
      name: `${templates[0].name} 템플릿 선택`,
    });
    expect(selectedCard).toHaveAttribute('data-template-id', templates[0].id);
    expect(selectedCard).toHaveAttribute('aria-pressed', 'true');
    expect(
      screen.getByRole('img', {
        name: `${templates[0].name} 포스터 미리보기`,
      })
    ).toBeInTheDocument();
    expect(screen.getByText('포함 페이지')).toBeInTheDocument();
    expect(screen.getByText('색상 팔레트')).toBeInTheDocument();
    expect(screen.getByText('포스터 글꼴')).toBeInTheDocument();

    fireEvent.click(
      screen.getByRole('button', {
        name: `${templates[1].name} 템플릿 선택`,
      })
    );

    expect(onSelect).toHaveBeenCalledWith(templates[1].id);
  });

  it('분류 이동과 돌아가기, 적용 동작을 별도 버튼으로 제공한다', () => {
    const onTypeChange = jest.fn();
    const onBack = jest.fn();
    const onClose = jest.fn();
    const onApply = jest.fn();

    render(
      <InvitationTemplatePicker
        type="wedding"
        selectedId={templates[0].id}
        isApplying={false}
        onSelect={jest.fn()}
        onTypeChange={onTypeChange}
        onBack={onBack}
        onClose={onClose}
        onApply={onApply}
      />
    );

    fireEvent.click(screen.getByRole('button', { name: '돌잔치' }));
    fireEvent.click(
      screen.getByRole('button', { name: '블록 추가로 돌아가기' })
    );
    fireEvent.click(screen.getByRole('button', { name: '템플릿 선택 닫기' }));
    fireEvent.click(screen.getByRole('button', { name: '선택한 템플릿 적용' }));

    expect(onTypeChange).toHaveBeenCalledWith('firstBirthday');
    expect(onBack).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
    expect(onApply).toHaveBeenCalledTimes(1);
  });
});
