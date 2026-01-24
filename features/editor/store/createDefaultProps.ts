import { BlockType } from '../types/editor';
import { blockRegistry } from '../types/registry';

export function createDefaultProps(type: BlockType) {
  const fields = blockRegistry[type].fields;

  return Object.fromEntries(
    Object.entries(fields).map(([key, value]) => [key, value.default])
  ) as any;
}
