import { PhoneContact, PhoneGroup } from './phone.types';

/** 빈 연락처 입력 행을 생성한다. */
export const createPhoneContact = (): PhoneContact => ({
  id: crypto.randomUUID(),
  label: '',
  number: '',
});

/** 연락처 1개를 가진 빈 그룹을 생성한다. */
export const createPhoneGroup = (): PhoneGroup => ({
  id: crypto.randomUUID(),
  name: '',
  contacts: [createPhoneContact()],
});

/** 저장된 그룹이 없으면 기본 그룹 1개를 반환한다. */
export const getInitialPhoneGroups = (groups?: PhoneGroup[]) => {
  return groups && groups.length > 0 ? groups : [createPhoneGroup()];
};
