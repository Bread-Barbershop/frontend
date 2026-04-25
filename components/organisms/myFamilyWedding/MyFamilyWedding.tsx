import { ChangeEvent, useEffect, useState } from 'react';

import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { Group } from './Group';

interface Props {
  blockInfo: EditorBlock<'myFamilyWedding'>;
  id: string;
}

export const MyFamilyWedding = ({ blockInfo, id }: Props) => {
  const { brideFamily, groomFamily } = blockInfo.props;
  const updateBlock = useEditorStore(state => state.updateBlock);
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);

  const handleMenuToggle = (type: 'bride' | 'groom', index: number) => {
    const key = `${type}-${index}`;
    setOpenMenuKey(prev => (prev === key ? null : key));
  };

  const handleRelationChange = (
    type: 'bride' | 'groom',
    index: number,
    value: string
  ) => {
    const field = type === 'bride' ? 'brideFamily' : 'groomFamily';
    updateBlock(id, {
      [field]: (type === 'bride' ? brideFamily : groomFamily)?.map(
        (member, i) => (i === index ? { ...member, relation: value } : member)
      ),
    });
  };

  const handleNameChange = (
    type: 'bride' | 'groom',
    index: number,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const field = type === 'bride' ? 'brideFamily' : 'groomFamily';
    updateBlock(id, {
      [field]: (type === 'bride' ? brideFamily : groomFamily)?.map(
        (member, i) =>
          i === index ? { ...member, name: e.target.value } : member
      ),
    });
  };

  const handleFlowerChange = (
    type: 'bride' | 'groom',
    index: number,
    value: boolean
  ) => {
    const field = type === 'bride' ? 'brideFamily' : 'groomFamily';
    updateBlock(id, {
      [field]: (type === 'bride' ? brideFamily : groomFamily)?.map(
        (member, i) => (i === index ? { ...member, flower: value } : member)
      ),
    });
  };

  const handleAddFamily = (type: 'bride' | 'groom') => {
    const field = type === 'bride' ? 'brideFamily' : 'groomFamily';
    const newFamily = [
      ...((type === 'bride' ? brideFamily : groomFamily) || []),
      { id: '', relation: '', name: '', flower: false },
    ];
    updateBlock(id, { [field]: newFamily });
  };

  const handleDeleteFamily = (type: 'bride' | 'groom', index: number) => {
    const field = type === 'bride' ? 'brideFamily' : 'groomFamily';
    updateBlock(id, {
      [field]: (type === 'bride' ? brideFamily : groomFamily)?.filter(
        (_, i) => i !== index
      ),
    });
  };

  useEffect(() => {
    if (
      brideFamily &&
      brideFamily.length > 0 &&
      groomFamily &&
      groomFamily.length > 0
    )
      return;
    const newFamily = [
      { id: '', relation: '', name: '', flower: false },
      { id: '', relation: '', name: '', flower: false },
    ];
    if (!brideFamily || brideFamily.length === 0) {
      updateBlock(id, { brideFamily: newFamily });
    }
    if (!groomFamily || groomFamily.length === 0) {
      updateBlock(id, { groomFamily: newFamily });
    }
  }, [id, brideFamily, groomFamily, updateBlock]);

  return (
    <LeftEditorWrapper ariaLabel="가족 소개" className="gap-3">
      <NavigationBar>가족 소개</NavigationBar>
      <Group
        family={groomFamily || []}
        type="groom"
        onRelationChange={handleRelationChange}
        onNameChange={handleNameChange}
        onDelete={handleDeleteFamily}
        onFlowerChange={handleFlowerChange}
        handleAddFamily={handleAddFamily}
        openMenuKey={openMenuKey}
        onMenuToggle={handleMenuToggle}
      />
      <Group
        family={brideFamily || []}
        type="bride"
        onRelationChange={handleRelationChange}
        onNameChange={handleNameChange}
        onDelete={handleDeleteFamily}
        onFlowerChange={handleFlowerChange}
        handleAddFamily={handleAddFamily}
        openMenuKey={openMenuKey}
        onMenuToggle={handleMenuToggle}
      />
    </LeftEditorWrapper>
  );
};
