import { useEffect, useState } from 'react';

import { Button, UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Popup } from '@/components/organisms/popup/Popup';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

import { PhoneGroupEdit } from './components/PhoneGroupEdit';
import { PhoneGroupSection } from './components/PhoneGroupSection';
import { getInitialPhoneGroups } from './utils/createPhoneGroup';
import { MAX_PHONE_GROUPS } from './utils/phone.constants';
import { PhoneGroup } from './utils/phone.types';
import {
  addPhoneContact,
  addPhoneGroup,
  deletePhoneContact,
  deletePhoneGroup,
  updatePhoneContactLabel,
  updatePhoneContactNumber,
  updatePhoneGroupName,
} from './utils/updatePhoneGroups';

interface Props {
  blockInfo: EditorBlock<'phone'>;
  id: string;
}

function Phone({ blockInfo, id }: Props) {
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [isGroupPopupOpen, setIsGroupPopupOpen] = useState(false);
  const [openContactMenuId, setOpenContactMenuId] = useState<string | null>(
    null
  );
  const [groups, setGroups] = useState<PhoneGroup[]>(() => [
    ...getInitialPhoneGroups(blockInfo.props.groups),
  ]);

  useEffect(() => {
    updateBlock(id, { groups });
  }, [groups, id, updateBlock]);

  useEffect(() => {
    if (!openContactMenuId) return;

    const handleClickOutside = () => {
      setOpenContactMenuId(null);
    };

    document.addEventListener('click', handleClickOutside);

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [openContactMenuId]);

  const handleDeleteContact = (groupIndex: number, contactId: string) => {
    setGroups(prevGroups =>
      deletePhoneContact(prevGroups, groupIndex, contactId)
    );
    setOpenContactMenuId(null);
  };

  const handleAddContact = (groupIndex: number) => {
    setGroups(prevGroups => addPhoneContact(prevGroups, groupIndex));
  };

  const handleAddGroup = () => {
    setGroups(addPhoneGroup);
  };

  const handleDeleteGroup = (groupId: string) => {
    setGroups(prevGroups => deletePhoneGroup(prevGroups, groupId));
  };

  const handleGroupNameChange = (groupIndex: number, name: string) => {
    setGroups(prevGroups =>
      updatePhoneGroupName(prevGroups, groupIndex, name)
    );
  };

  const handleContactLabelChange = (
    groupIndex: number,
    contactIndex: number,
    label: string
  ) => {
    setGroups(prevGroups =>
      updatePhoneContactLabel(prevGroups, groupIndex, contactIndex, label)
    );
  };

  const handleContactNumberChange = (
    groupIndex: number,
    contactIndex: number,
    number: string
  ) => {
    setGroups(prevGroups =>
      updatePhoneContactNumber(prevGroups, groupIndex, contactIndex, number)
    );
  };

  const handleContactMenuToggle = (contactId: string) => {
    setOpenContactMenuId(currentId =>
      currentId === contactId ? null : contactId
    );
  };

  return (
    <LeftEditorWrapper ariaLabel="연락처">
      <NavigationBar
        action={
          <UtilityButton
            size="md"
            variant="primary"
            onClick={() => setIsGroupPopupOpen(true)}
          >
            그룹편집
          </UtilityButton>
        }
        direction="right"
      >
        연락처
      </NavigationBar>

      {groups.map((group, groupIndex) => (
        <PhoneGroupSection
          key={`phone-group-${group.id}`}
          group={group}
          groupIndex={groupIndex}
          openContactMenuId={openContactMenuId}
          onAddContact={handleAddContact}
          onContactDelete={handleDeleteContact}
          onContactLabelChange={handleContactLabelChange}
          onContactMenuToggle={handleContactMenuToggle}
          onContactNumberChange={handleContactNumberChange}
          onGroupNameChange={handleGroupNameChange}
        />
      ))}

      <Button
        size="md"
        variant="borderless"
        onClick={handleAddGroup}
        disabled={groups.length >= MAX_PHONE_GROUPS}
        className="text-primary"
      >
        + 그룹 추가
      </Button>

      {isGroupPopupOpen && (
        <Popup
          popupTitle="그룹 편집"
          onClose={() => setIsGroupPopupOpen(false)}
          wrapperClassName="w-[200px] pt-1 pb-4"
        >
          <PhoneGroupEdit
            groups={groups}
            onDeleteGroup={handleDeleteGroup}
          />
        </Popup>
      )}
    </LeftEditorWrapper>
  );
}

export default Phone;
