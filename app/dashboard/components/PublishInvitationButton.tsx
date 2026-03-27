import { DASHBOARD_COPY } from '@/app/dashboard/dashboardConfig';

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
      {isPublishing
        ? DASHBOARD_COPY.publishingLabel
        : DASHBOARD_COPY.publishInvitationLabel}
    </InvitationActionButton>
  );
}

export default PublishInvitationButton;
