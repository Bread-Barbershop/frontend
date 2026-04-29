/** 연락처 입력 행 데이터 */
export type PhoneContact = {
  id: string;
  label: string;
  number: string;
};

/** 연락처 그룹 데이터 */
export type PhoneGroup = {
  id: string;
  name: string;
  contacts: PhoneContact[];
};
