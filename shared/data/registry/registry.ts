import { bgmDefinition } from '@/components/organisms/bgm/Bgm.definition';
import { calendarDefinition } from '@/components/organisms/calendar/Calendar.definition';
import { coupleIntroductionDefinition } from '@/components/organisms/couple-introduction/CoupleIntroduction.definition';
import { galleryDefinition } from '@/components/organisms/gallery/Gallery.definition';
import { greetingDefinition } from '@/components/organisms/greeting/Greeting.definition';
import { phoneDefinition } from '@/components/organisms/phone/Phone.definition';
import { placeDefinition } from '@/components/organisms/place/Place.definition';
import { shareUrlDefinition } from '@/components/organisms/share-url/ShareUrl.definition';
import { videoDefinition } from '@/components/organisms/video/Video.definition';

import { blockSchema } from './block.schema';

export const blockRegistry = {
  gallery: { ...blockSchema.gallery, ...galleryDefinition },
  bgm: { ...blockSchema.bgm, ...bgmDefinition },
  greeting: { ...blockSchema.greeting, ...greetingDefinition },
  phone: { ...blockSchema.phone, ...phoneDefinition },
  place: { ...blockSchema.place, ...placeDefinition },
  coupleIntroduction: {
    ...blockSchema.coupleIntroduction,
    ...coupleIntroductionDefinition,
  },
  video: { ...blockSchema.video, ...videoDefinition },
  calendar: { ...blockSchema.calendar, ...calendarDefinition },
  shareUrl: { ...blockSchema.shareUrl, ...shareUrlDefinition },
} as const;
