import { accountDefinition } from '@/components/organisms/account/Account.definition';
import { bgmDefinition } from '@/components/organisms/bgm/Bgm.definition';
import { calendarDefinition } from '@/components/organisms/calendar/Calendar.definition';
import { coupleIntroductionDefinition } from '@/components/organisms/couple-introduction/CoupleIntroduction.definition';
import { galleryDefinition } from '@/components/organisms/gallery/Gallery.definition';
import { greetingDefinition } from '@/components/organisms/greeting/Greeting.definition';
import { interviewDefinition } from '@/components/organisms/interview/Interview.definition';
import { myChildDefinition } from '@/components/organisms/myChild/MyChild.definition';
import { myFamilyDefinition } from '@/components/organisms/myFamily/MyFamily.definition';
import { myFamilyWeddingDefinition } from '@/components/organisms/myFamilyWedding/MyFamilyWedding.definition';
import { noticeDefinition } from '@/components/organisms/notice/Notice.definition';
import { organizerInformationDefinition } from '@/components/organisms/organizerInfo/OrganizerInformation.definition';
import { phoneDefinition } from '@/components/organisms/phone/Phone.definition';
import { pictureDefinition } from '@/components/organisms/picture/Picture.definition';
import { placeDefinition } from '@/components/organisms/place/Place.definition';
import { shareUrlDefinition } from '@/components/organisms/share-url/ShareUrl.definition';
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
  shareUrl: { ...blockSchema.shareUrl, ...shareUrlDefinition },
  interview: { ...blockSchema.interview, ...interviewDefinition },
  organizerInformation: {
    ...blockSchema.organizerInformation,
    ...organizerInformationDefinition,
  },
  speakerInformation: {
    ...blockSchema.speakerInformation,
    ...speakerInformationDefinition,
  },
  myChild: { ...blockSchema.myChild, ...myChildDefinition },
  myFamily: { ...blockSchema.myFamily, ...myFamilyDefinition },
  myFamilyWedding: {
    ...blockSchema.myFamilyWedding,
    ...myFamilyWeddingDefinition,
  },
  sponsorshipInfomation: {
    ...blockSchema.sponsorshipInfomation,
    ...sponsorshipInfomationDefinition,
  },
  picture: { ...blockSchema.picture, ...pictureDefinition },
} as const;
