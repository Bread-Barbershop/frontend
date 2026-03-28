import { showcaseItems } from '@/app/(home)/components/showcaseItems';

function getStableIndexFromKey(key: string, itemCount: number) {
  let hash = 0;

  for (let index = 0; index < key.length; index += 1) {
    hash = (hash * 31 + key.charCodeAt(index)) >>> 0;
  }

  return hash % itemCount;
}

export function getInvitationShowcaseItem(folderId: string) {
  const stableIndex = getStableIndexFromKey(folderId, showcaseItems.length);
  return showcaseItems[stableIndex];
}
