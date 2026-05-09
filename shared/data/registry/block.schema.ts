import { accountSchema } from '@/components/organisms/account/Account.schema';
import { bgmSchema } from '@/components/organisms/bgm/Bgm.schema';
import { calendarSchema } from '@/components/organisms/calendar/Calendar.schema';
import { coupleIntroductionSchema } from '@/components/organisms/couple-introduction/CoupleIntroduction.schema';
import { gallerySchema } from '@/components/organisms/gallery/Gallery.schema';
import { greetingSchema } from '@/components/organisms/greeting/Greeting.schema';
import { interviewSchema } from '@/components/organisms/interview/Interview.schema';
import { myChildSchema } from '@/components/organisms/myChild/MyChild.schema';
import { myFamilySchema } from '@/components/organisms/myFamily/MyFamily.schema';
import { myFamilyWeddingSchema } from '@/components/organisms/myFamilyWedding/MyFamilyWedding.schema';
import { noticeSchema } from '@/components/organisms/notice/Notice.schema';
import { organizerInformationSchema } from '@/components/organisms/organizerInfo/OrganizerInformation.schema';
import { phoneSchema } from '@/components/organisms/phone/Phone.schema';
import { pictureSchema } from '@/components/organisms/picture/Picture.schema';
import { placeSchema } from '@/components/organisms/place/Place.schema';
import { speakerInformationSchema } from '@/components/organisms/speakerInformation/SpeakerInformation.schema';
import { sponsorshipInfomationSchema } from '@/components/organisms/sponsorshipInfomation/SposorshipInfomation.schema';
import { videoSchema } from '@/components/organisms/video/Video.schema';

export const blockSchema = {
  gallery: gallerySchema,
  bgm: bgmSchema,
  greeting: greetingSchema,
  phone: phoneSchema,
  place: placeSchema,
  account: accountSchema,
  coupleIntroduction: coupleIntroductionSchema,
  video: videoSchema,
  notice: noticeSchema,
  calendar: calendarSchema,
  interview: interviewSchema,
  organizerInformation: organizerInformationSchema,
  speakerInformation: speakerInformationSchema,
  myChild: myChildSchema,
  myFamily: myFamilySchema,
  myFamilyWedding: myFamilyWeddingSchema,
  sponsorshipInfomation: sponsorshipInfomationSchema,
  picture: pictureSchema,
} as const;
