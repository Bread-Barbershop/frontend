import { Button } from '@/components/atoms/button';

import { PhoneGroup } from '../utils/phone.types';

interface PhoneGroupEditProps {
  groups: PhoneGroup[];
  onDeleteGroup: (groupId: string) => void;
}

export function PhoneGroupEdit({ groups, onDeleteGroup }: PhoneGroupEditProps) {
  return (
    <div className="flex flex-col gap-4 items-center w-full">
      {groups.map((group, index) => (
        <div
          key={`phone-group-edit-${group.id}`}
          className="flex flex-col gap-2 items-start w-full"
        >
          <div className="flex items-center justify-between w-full">
            <p className="text-text-primary text-sm font-semibold">
              {group.name || `${index + 1}번 그룹`}
            </p>
            {groups.length > 1 && (
              <Button
                size="sm"
                variant="borderless"
                onClick={() => onDeleteGroup(group.id)}
                type="button"
                className="text-btn-close flex items-center px-2 justify-end w-fit"
              >
                삭제
              </Button>
            )}
          </div>
          <div className="border-l border-text-secondary ml-2 pl-2 w-full">
            {group.contacts.map((contact, contactIndex) => (
              <div
                key={`phone-group-edit-${group.id}-contact-${contact.id}`}
                className="flex items-center justify-between h-8"
              >
                <p className="text-text-secondary font-semibold text-xs">
                  {contact.label || `연락처 ${contactIndex + 1}번`}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
