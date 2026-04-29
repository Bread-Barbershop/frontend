import { StaticImageData } from 'next/image';

import { InviteListItem } from '@/app/dashboard/types';

export type CarouselCardItem = {
  id: string;
  image: string | StaticImageData;
  alt: string;
  invite?: InviteListItem;
};
