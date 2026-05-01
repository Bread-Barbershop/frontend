import { Fragment } from 'react';

import { Divider } from '@/components/atoms/divider';
import { ActionField } from '@/components/molecules/action-field';

import { MAX_CONTACTS_PER_GROUP } from '../utils/phone.constants';
import { PhoneGroup } from '../utils/phone.types';

import { PhoneContactField } from './PhoneContactField';

interface PhoneGroupSectionProps {
  group: PhoneGroup;
  groupIndex: number;
  openContactMenuId: string | null;
  onAddContact: (groupIndex: number) => void;
  onContactDelete: (groupIndex: number, contactId: string) => void;
  onContactLabelChange: (
    groupIndex: number,
    contactIndex: number,
    label: string
  ) => void;
  onContactMenuToggle: (contactId: string) => void;
  onContactMenuClose: () => void;
  onContactNumberChange: (
    groupIndex: number,
    contactIndex: number,
    number: string
  ) => void;
  onGroupNameChange: (groupIndex: number, name: string) => void;
}

export function PhoneGroupSection({
  group,
  groupIndex,
  openContactMenuId,
  onAddContact,
  onContactDelete,
  onContactLabelChange,
  onContactMenuToggle,
  onContactMenuClose,
  onContactNumberChange,
  onGroupNameChange,
}: PhoneGroupSectionProps) {
  return (
    <Fragment>
      {groupIndex > 0 && (
        <div className="w-full flex py-1.5">
          <Divider
            className="w-14.25 -translate-x-2 items-center"
            padding="none"
          />
        </div>
      )}

      <ActionField
        label="그룹명"
        inputProps={{
          placeholder: '그룹명(선택사항)',
          value: group.name,
          onChange: e => onGroupNameChange(groupIndex, e.target.value),
        }}
        buttonProps={{
          size: 'sm',
          children: '연락처 추가',
          disabled: group.contacts.length >= MAX_CONTACTS_PER_GROUP,
          onClick: () => onAddContact(groupIndex),
          className: 'w-[76px] h-8',
        }}
        className="w-full py-1.5"
      />

      {group.contacts.map((contact, contactIndex) => (
        <PhoneContactField
          key={`phone-group-${group.id}-contact-field-${contact.id}`}
          contact={contact}
          isMenuOpen={openContactMenuId === contact.id}
          canDelete={group.contacts.length > 1}
          onMenuToggle={() => onContactMenuToggle(contact.id)}
          onMenuClose={onContactMenuClose}
          onDelete={() => onContactDelete(groupIndex, contact.id)}
          onLabelChange={label =>
            onContactLabelChange(groupIndex, contactIndex, label)
          }
          onNumberChange={number =>
            onContactNumberChange(groupIndex, contactIndex, number)
          }
        />
      ))}
    </Fragment>
  );
}
