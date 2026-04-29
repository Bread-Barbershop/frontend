import { CircleMinus, EllipsisVertical } from 'lucide-react';

import { MultiField } from '@/components/molecules/multi-field';

import { formatPhoneNumber } from '../utils/formatPhoneNumber';
import { PhoneContact } from '../utils/phone.types';

interface PhoneContactFieldProps {
  contact: PhoneContact;
  isMenuOpen: boolean;
  canDelete: boolean;
  onLabelChange: (label: string) => void;
  onNumberChange: (number: string) => void;
  onDelete: () => void;
  onMenuToggle: () => void;
}

export function PhoneContactField({
  contact,
  isMenuOpen,
  canDelete,
  onLabelChange,
  onNumberChange,
  onDelete,
  onMenuToggle,
}: PhoneContactFieldProps) {
  return (
    <div className="relative flex w-full items-center gap-1.5 py-1.5">
      <MultiField
        label="연락처"
        subInputProps={{
          size: 'fixed',
          className: 'w-[65px] h-8',
          placeholder: '명칭',
          value: contact.label,
          onChange: e => onLabelChange(e.target.value),
        }}
        mainInputProps={{
          size: 'full',
          type: 'tel',
          inputMode: 'numeric',
          className: 'flex-1',
          placeholder: '번호를 기입해 주세요.',
          value: formatPhoneNumber(contact.number),
          onChange: e => onNumberChange(e.target.value),
        }}
        className="min-w-0 flex-1"
      />
      <button
        type="button"
        aria-label="연락처 메뉴"
        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg hover:bg-btn-hover active:bg-btn-pressed"
        onClick={event => {
          event.stopPropagation();
          onMenuToggle();
        }}
      >
        <EllipsisVertical className="size-6 text-black" />
      </button>
      {isMenuOpen && (
        <div
          className="absolute right-0 top-10 z-10 rounded-lg border border-border-neutral bg-white shadow-edit"
          onClick={event => event.stopPropagation()}
        >
          <button
            type="button"
            disabled={!canDelete}
            className="flex w-21.5 h-8 items-center gap-4 whitespace-nowrap px-2 text-sm enabled:hover:bg-btn-hover disabled:cursor-not-allowed disabled:text-btn-disabled"
            onClick={onDelete}
          >
            <CircleMinus className="h-4 w-4" />
            삭제
          </button>
        </div>
      )}
    </div>
  );
}
