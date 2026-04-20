import { useMemo } from 'react';

import { blockRegistry } from '@/shared/data/registry/registry';
import { EditorBlock } from '@/shared/types/block';

const EMPTY_ARRAY: string[] = [];

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

  const typeArray = useMemo(() => {
    if (!selectedBlock) return EMPTY_ARRAY;
    const registryEntry = blockRegistry[selectedBlock.component];
    return registryEntry?.type || EMPTY_ARRAY;
  }, [selectedBlock]);

  return { typeArray };
};
