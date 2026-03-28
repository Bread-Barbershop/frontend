import { accountDefinition } from '@/components/organisms/account/Account.definition';
import { bgmDefinition } from '@/components/organisms/bgm/Bgm.definition';
import { calendarDefinition } from '@/components/organisms/calendar/Calendar.definition';
import { coupleIntroductionDefinition } from '@/components/organisms/couple-introduction/CoupleIntroduction.definition';
import { galleryDefinition } from '@/components/organisms/gallery/Gallery.definition';
import { greetingDefinition } from '@/components/organisms/greeting/Greeting.definition';
import { myChildDefinition } from '@/components/organisms/myChild/MyChild.definition';
import { noticeDefinition } from '@/components/organisms/notice/Notice.definition';
import { organizerInformationDefinition } from '@/components/organisms/organizerInfo/OrganizerInformation.definition';
import { phoneDefinition } from '@/components/organisms/phone/Phone.definition';
import { placeDefinition } from '@/components/organisms/place/Place.definition';
import { speakerInformationDefinition } from '@/components/organisms/speakerInformation/SpeakerInformation.definition';
import { sponsorshipInfomationDefinition } from '@/components/organisms/sponsorshipInfomation/SposorshipInfomation.definition';
import { videoDefinition } from '@/components/organisms/video/Video.definition';

import { blockSchema } from './block.schema';

export const blockRegistry = {
  gallery: { ...blockSchema.gallery, ...galleryDefinition },
  bgm: { ...blockSchema.bgm, ...bgmDefinition },
  greeting: { ...blockSchema.greeting, ...greetingDefinition },
  phone: { ...blockSchema.phone, ...phoneDefinition },
  place: { ...blockSchema.place, ...placeDefinition },
  account: { ...blockSchema.account, ...accountDefinition },
  coupleIntroduction: {
    ...blockSchema.coupleIntroduction,
    ...coupleIntroductionDefinition,
  },
  video: { ...blockSchema.video, ...videoDefinition },
  notice: { ...blockSchema.notice, ...noticeDefinition },
  calendar: { ...blockSchema.calendar, ...calendarDefinition },
  organizerInformation: {
    ...blockSchema.organizerInformation,
    ...organizerInformationDefinition,
  },
  speakerInformation: {
    ...blockSchema.speakerInformation,
    ...speakerInformationDefinition,
  },
  myChild: { ...blockSchema.myChild, ...myChildDefinition },
  sponsorshipInfomation: {
    ...blockSchema.sponsorshipInfomation,
    ...sponsorshipInfomationDefinition,
  },
} as const;
