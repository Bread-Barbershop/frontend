import type { BlockType } from '@/shared/types/editor';

// Keep saved guestbook data compatible while its write model is unavailable.
export function isBlockEnabled(component: BlockType): boolean {
  return component !== 'guestbook';
}
