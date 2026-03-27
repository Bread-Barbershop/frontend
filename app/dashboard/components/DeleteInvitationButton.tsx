import { Trash2 } from 'lucide-react';

import {
  DASHBOARD_COPY,
  DELETE_INVITATION_BUTTON_CLASS,
} from '@/app/dashboard/dashboardConfig';

type DeleteInvitationButtonProps = {
  onClick?: () => void;
};

function DeleteInvitationButton({ onClick }: DeleteInvitationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={DELETE_INVITATION_BUTTON_CLASS}
      aria-label={DASHBOARD_COPY.deleteInvitationAriaLabel}
    >
      <Trash2 size={16} strokeWidth={2.2} />
    </button>
  );
}

export default DeleteInvitationButton;
