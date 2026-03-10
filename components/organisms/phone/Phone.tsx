import { ChangeEvent, useState } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { MultiField } from '@/components/molecules/multi-field';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { LeftEditorWrapper } from '@/components/molecules/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

type PhoneContact = {
  label: string;
  number: string;
};

const MAX_MULTI_FIELDS = 10;
const EMPTY_CONTACT: PhoneContact = { label: '', number: '' };

interface Props {
  blockInfo: EditorBlock<'phone'>;
  id: string;
}

// 연락처가 하나도 없을 때도 입력할 수 있도록 최소 1행은 화면에 노출한다.
function createInitialRows(contacts: PhoneContact[]) {
  return contacts.length > 0 ? contacts : [EMPTY_CONTACT];
}

// 저장 제외 기준: 명칭/번호가 모두 비어 있으면 빈 행으로 본다.
function isEmptyContact(contact: PhoneContact) {
  return (
    contact.label.trim().length === 0 && contact.number.trim().length === 0
  );
}

// 스토어에는 유효한 연락처만 저장하고, 빈 행은 로컬 UI 상태로만 유지한다.
function sanitizeContacts(contacts: PhoneContact[]) {
  return contacts.filter(contact => !isEmptyContact(contact));
}

// 연락처 번호는 숫자만 저장되도록 정규화한다.
function normalizeContactValue(key: 'label' | 'number', value: string): string {
  if (key === 'number') {
    return value.replace(/\D/g, '');
  }

  return value;
}

function Phone({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const storedContacts = blockInfo.props.contacts ?? [];
  const [rowsById, setRowsById] = useState<Record<string, PhoneContact[]>>({});
  const rows = rowsById[id] ?? createInitialRows(storedContacts);
  const lastRow = rows[rows.length - 1] ?? EMPTY_CONTACT;
  const isAddDisabled =
    rows.length >= MAX_MULTI_FIELDS || isEmptyContact(lastRow);

  // 현재 블록(id)에 해당하는 로컬 입력 행 상태를 갱신한다.
  const setRowsForCurrentBlock = (nextRows: PhoneContact[]) => {
    setRowsById(prev => ({
      ...prev,
      [id]: nextRows,
    }));
  };

  // 로컬 입력 상태에서 빈 행을 제거한 뒤 editor store에 반영한다.
  const persistContacts = (nextRows: PhoneContact[]) => {
    updateBlock(id, { contacts: sanitizeContacts(nextRows) });
  };

  // 각 입력 필드(label/number) 변경을 처리한다.
  const handleContactChange =
    (index: number, key: 'label' | 'number') =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const normalizedValue = normalizeContactValue(key, e.target.value);
      const nextRows = rows.map((contact, contactIndex) =>
        contactIndex === index
          ? { ...contact, [key]: normalizedValue }
          : contact
      );

      setRowsForCurrentBlock(nextRows);
      persistContacts(nextRows);
    };

  // 마지막 행이 비어있지 않을 때만 새 빈 행을 추가한다.
  const handleAddUtility = () => {
    if (isAddDisabled) {
      return;
    }

    setRowsForCurrentBlock([...rows, { ...EMPTY_CONTACT }]);
  };

  return (
    <LeftEditorWrapper ariaLabel="연락처">
      <NavigationBar>연락처</NavigationBar>
      {rows.map((contact, index) => (
        <MultiField
          key={`phone-multi-field-${index}`}
          label="명칭 & 번호"
          subInputProps={{
            size: 'fixed',
            className: 'w-[85px]',
            placeholder: '명칭',
            value: contact.label,
            maxLength: 15,
            onChange: handleContactChange(index, 'label'),
          }}
          mainInputProps={{
            size: 'full',
            type: 'tel',
            inputMode: 'numeric',
            pattern: '[0-9]*',
            placeholder: '010-1234-5678',
            value: contact.number,
            onChange: handleContactChange(index, 'number'),
          }}
          className="py-1.5"
        />
      ))}
      <div className="w-full h-8 flex justify-center">
        <UtilityButton onClick={handleAddUtility} disabled={isAddDisabled}>
          추가 +
        </UtilityButton>
      </div>
    </LeftEditorWrapper>
  );
}

export default Phone;
