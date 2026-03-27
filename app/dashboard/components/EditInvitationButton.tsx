import InvitationActionButton from './InvitationActionButton';

type EditInvitationButtonProps = {
  disabled: boolean;
  onClick: () => void;
};

function EditInvitationButton({
  disabled,
  onClick,
}: EditInvitationButtonProps) {
  return (
    <InvitationActionButton disabled={disabled} onClick={onClick}>
      재편집하기
    </InvitationActionButton>
  );
}

export default EditInvitationButton;
