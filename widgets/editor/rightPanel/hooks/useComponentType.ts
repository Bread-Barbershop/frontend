import { useMemo } from 'react';

import { blockRegistry } from '@/shared/data/registry/registry';
import { EditorBlock } from '@/shared/types/block';

export const useComponentType = ({
  block,
  selectedId,
}: {
  block: EditorBlock[];
  selectedId: string | null;
}) => {
  const selectedBlock = useMemo(
    () => block.find(b => b.id === selectedId),
    [block, selectedId]
  );
  if (!selectedBlock) return { typeArray: [] };
  const registryEntry = blockRegistry[selectedBlock.component];
  const typeArray = registryEntry?.type;

  return { typeArray };
};
