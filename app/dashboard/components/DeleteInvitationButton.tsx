import { Trash2 } from 'lucide-react';

type DeleteInvitationButtonProps = {
  onClick?: () => void;
};

function DeleteInvitationButton({ onClick }: DeleteInvitationButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg bg-white text-[#F32E2E] shadow-[0_6px_14px_rgba(0,0,0,0.16)]"
      aria-label="초대장 삭제"
    >
      <Trash2 size={16} strokeWidth={2.2} />
    </button>
  );
}

export default DeleteInvitationButton;
