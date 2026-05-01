import { useRef, useState } from 'react';

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
  const fallbackGroupsByIdRef = useRef<Record<string, PhoneGroup[]>>({});
  const storedGroups = blockInfo.props.groups;
  const groups =
    storedGroups && storedGroups.length > 0
      ? storedGroups
      : (fallbackGroupsByIdRef.current[id] ??= getInitialPhoneGroups());

  const updateGroups = (nextGroups: PhoneGroup[]) => {
    updateBlock(id, { groups: nextGroups });
  };

  const handleAddContact = (groupIndex: number) => {
    updateGroups(addPhoneContact(groups, groupIndex));
  };

  const handleAddGroup = () => {
    updateGroups(addPhoneGroup(groups));
  };

  const handleDeleteGroup = (groupId: string) => {
    updateGroups(deletePhoneGroup(groups, groupId));
  };

  const handleDeleteContact = (groupIndex: number, contactId: string) => {
    updateGroups(deletePhoneContact(groups, groupIndex, contactId));
    setOpenContactMenuId(null);
  };

  const handleGroupNameChange = (groupIndex: number, name: string) => {
    updateGroups(updatePhoneGroupName(groups, groupIndex, name));
  };

  const handleContactLabelChange = (
    groupIndex: number,
    contactIndex: number,
    label: string
  ) => {
    updateGroups(
      updatePhoneContactLabel(groups, groupIndex, contactIndex, label)
    );
  };

  const handleContactNumberChange = (
    groupIndex: number,
    contactIndex: number,
    number: string
  ) => {
    updateGroups(
      updatePhoneContactNumber(groups, groupIndex, contactIndex, number)
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
          onContactMenuClose={() => setOpenContactMenuId(null)}
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
