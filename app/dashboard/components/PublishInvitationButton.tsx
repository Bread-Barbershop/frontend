import InvitationActionButton from './InvitationActionButton';

type PublishInvitationButtonProps = {
  disabled: boolean;
  isPublishing: boolean;
  onClick: () => void;
  label?: string;
};

function PublishInvitationButton({
  disabled,
  isPublishing,
  onClick,
  label = 'URL 링크 확인하기',
}: PublishInvitationButtonProps) {
  return (
    <InvitationActionButton disabled={disabled} onClick={onClick} tone="accent">
      {isPublishing ? '초대장 생성중..' : label}
    </InvitationActionButton>
  );
}

export default PublishInvitationButton;
