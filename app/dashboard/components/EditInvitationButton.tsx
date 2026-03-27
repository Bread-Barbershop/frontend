import { DASHBOARD_COPY } from '@/app/dashboard/dashboardConfig';

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
      {DASHBOARD_COPY.editInvitationLabel}
    </InvitationActionButton>
  );
}

export default EditInvitationButton;
