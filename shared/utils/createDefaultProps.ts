import { blockRegistry } from '@/shared/data/registry/registry';
import { BlockType } from '@/shared/types/editor';

export function createDefaultProps(type: BlockType) {
  const fields = blockRegistry[type].fields;

  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, value.default])
  ) as any;
}
