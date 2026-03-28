import InvitationActionButton from './InvitationActionButton';

type PublishInvitationButtonProps = {
  disabled: boolean;
  isPublishing: boolean;
  onClick: () => void;
};

function PublishInvitationButton({
  disabled,
  isPublishing,
  onClick,
}: PublishInvitationButtonProps) {
  return (
    <InvitationActionButton disabled={disabled} onClick={onClick} tone="accent">
      {isPublishing ? '초대장 생성중...' : 'URL 링크 확인하기'}
    </InvitationActionButton>
  );
}

export default PublishInvitationButton;
