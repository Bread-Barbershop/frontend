import { normalizePhoneNumber } from '@/shared/utils/phoneNumber';

import { createPhoneContact, createPhoneGroup } from './createPhoneGroup';
import { MAX_CONTACTS_PER_GROUP, MAX_PHONE_GROUPS } from './phone.constants';
import { PhoneGroup } from './phone.types';

/** 최대 개수를 넘지 않으면 새 그룹을 추가한다. */
export function addPhoneGroup(groups: PhoneGroup[]) {
  if (groups.length >= MAX_PHONE_GROUPS) return groups;

  return [...groups, createPhoneGroup()];
}

/** 최소 1개 그룹을 남기고 선택한 그룹을 삭제한다. */
export function deletePhoneGroup(groups: PhoneGroup[], groupId: string) {
  if (groups.length <= 1) return groups;

  return groups.filter(group => group.id !== groupId);
}

/** 선택한 그룹에 연락처를 추가한다. */
export function addPhoneContact(groups: PhoneGroup[], groupIndex: number) {
  return groups.map((group, index) =>
    index === groupIndex && group.contacts.length < MAX_CONTACTS_PER_GROUP
      ? { ...group, contacts: [...group.contacts, createPhoneContact()] }
      : group
  );
}

/** 최소 1개 연락처를 남기고 선택한 연락처를 삭제한다. */
export function deletePhoneContact(
  groups: PhoneGroup[],
  groupIndex: number,
  contactId: string
) {
  return groups.map((group, index) =>
    index === groupIndex && group.contacts.length > 1
      ? {
          ...group,
          contacts: group.contacts.filter(contact => contact.id !== contactId),
        }
      : group
  );
}

/** 선택한 그룹의 그룹명을 변경한다. */
export function updatePhoneGroupName(
  groups: PhoneGroup[],
  groupIndex: number,
  name: string
) {
  return groups.map((group, index) =>
    index === groupIndex ? { ...group, name } : group
  );
}

/** 선택한 연락처의 명칭을 변경한다. */
export function updatePhoneContactLabel(
  groups: PhoneGroup[],
  groupIndex: number,
  contactIndex: number,
  label: string
) {
  return groups.map((group, index) =>
    index === groupIndex
      ? {
          ...group,
          contacts: group.contacts.map((contact, innerIndex) =>
            innerIndex === contactIndex ? { ...contact, label } : contact
          ),
        }
      : group
  );
}

/** 선택한 연락처의 번호를 숫자만 남겨 저장한다. */
export function updatePhoneContactNumber(
  groups: PhoneGroup[],
  groupIndex: number,
  contactIndex: number,
  number: string
) {
  const normalizedNumber = normalizePhoneNumber(number);

  return groups.map((group, index) =>
    index === groupIndex
      ? {
          ...group,
          contacts: group.contacts.map((contact, innerIndex) =>
            innerIndex === contactIndex
              ? { ...contact, number: normalizedNumber }
              : contact
          ),
        }
      : group
  );
}
