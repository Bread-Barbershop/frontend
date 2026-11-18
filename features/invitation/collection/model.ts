import { parseSeoulDateTimeToTimestamp } from '@/shared/utils/dateValidation';

export type CollectionOptions = {
  eventDate: string;
  guestbook: boolean;
  photos: boolean;
};
export const emptyCollection: CollectionOptions = {
  eventDate: '',
  guestbook: false,
  photos: false,
};
export const PHOTO_LIMIT = 20 * 1024 * 1024;
export const photoExtensions: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/heic': 'heic',
  'image/heif': 'heif',
};
export function collectionClosesAt(date: string) {
  const start = parseSeoulDateTimeToTimestamp(date + 'T00:00');
  return start === null ? 0 : start + 4 * 86_400_000;
}
export function lastCollectionDay(date: string) {
  const end = collectionClosesAt(date);
  return end
    ? new Intl.DateTimeFormat('ko-KR', {
        timeZone: 'Asia/Seoul',
        dateStyle: 'long',
      }).format(end - 1)
    : '';
}
export type GuestCollectionView = {
  guestbook: boolean;
  photos: boolean;
  closesAt: number;
  entries: string[][];
  readFailed?: boolean;
  reconnect?: boolean;
};
