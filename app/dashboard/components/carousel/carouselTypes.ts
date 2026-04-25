import { StaticImageData } from 'next/image';

import { InviteListItem } from '@/app/dashboard/types';

export type CarouselCardItem = {
  id: string;
  image: StaticImageData;
  alt: string;
  invite?: InviteListItem;
};
