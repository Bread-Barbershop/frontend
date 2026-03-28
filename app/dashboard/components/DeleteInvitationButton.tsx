import { Trash2 } from 'lucide-react';

type DeleteInvitationButtonProps = {
  disabled?: boolean;
  onClick?: () => void;
};

function DeleteInvitationButton({
  disabled = false,
  onClick,
}: DeleteInvitationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-[#F32E2E] shadow-[0_6px_14px_rgba(0,0,0,0.16)] disabled:cursor-default disabled:opacity-60 cursor-pointer"
      aria-label="초대장 삭제"
    >
      <Trash2 size={16} strokeWidth={2.2} />
    </button>
  );
}

export default DeleteInvitationButton;
