import { ChevronRight, ChevronLeft } from 'lucide-react';
import { ButtonHTMLAttributes } from 'react';

type ControlButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'type'> & {
  type: 'left' | 'right';
};

function ControlButton({ type, ...props }: ControlButtonProps) {
  const Icon = type === 'left' ? ChevronLeft : ChevronRight;

  return (
    <button
      type="button"
      {...props}
      className="flex justify-center items-center size-11 rounded-full bg-[#EEEEF2] cursor-pointer transition-colors hover:bg-[#E5E7EB]"
    >
      <Icon
        strokeWidth={3}
        className={`text-[#6B7280] ${
          type === 'left' ? '-translate-x-px' : 'translate-x-px'
        }`}
      />
    </button>
  );
}
export default ControlButton;
