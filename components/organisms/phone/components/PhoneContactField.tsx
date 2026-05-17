import { CircleMinus } from 'lucide-react';

import { ActionMenuButton } from '@/components/atoms/action-menu-button';
import { MultiField } from '@/components/molecules/multi-field';
import { formatPhoneNumber } from '@/shared/utils/phoneNumber';

import { PhoneContact } from '../utils/phone.types';

interface PhoneContactFieldProps {
  contact: PhoneContact;
  isMenuOpen: boolean;
  canDelete: boolean;
  onLabelChange: (label: string) => void;
  onNumberChange: (number: string) => void;
  onDelete: () => void;
  onMenuToggle: () => void;
  onMenuClose: () => void;
}

export function PhoneContactField({
  contact,
  isMenuOpen,
  canDelete,
  onLabelChange,
  onNumberChange,
  onDelete,
  onMenuToggle,
  onMenuClose,
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
          placeholder: '051-000-0000',
          value: formatPhoneNumber(contact.number),
          onChange: e => onNumberChange(e.target.value),
        }}
        className="min-w-0 flex-1"
      />
      <ActionMenuButton
        aria-label="연락처 메뉴"
        isOpen={isMenuOpen}
        onToggle={onMenuToggle}
        onClose={onMenuClose}
        menuClassName="rounded-lg border border-border-neutral bg-white shadow-edit"
        menu={
          <button
            type="button"
            disabled={!canDelete}
            className="flex w-21.5 h-8 items-center gap-4 whitespace-nowrap px-2 text-sm enabled:hover:bg-btn-hover disabled:cursor-not-allowed disabled:text-btn-disabled"
            onClick={onDelete}
          >
            <CircleMinus className="h-4 w-4" />
            삭제
          </button>
        }
      />
    </div>
  );
}
