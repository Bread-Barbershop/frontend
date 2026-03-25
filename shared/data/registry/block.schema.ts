import { bgmSchema } from '@/components/organisms/bgm/Bgm.schema';
import { calendarSchema } from '@/components/organisms/calendar/Calendar.schema';
import { coupleIntroductionSchema } from '@/components/organisms/couple-introduction/CoupleIntroduction.schema';
import { gallerySchema } from '@/components/organisms/gallery/Gallery.schema';
import { greetingSchema } from '@/components/organisms/greeting/Greeting.schema';
import { noticeSchema } from '@/components/organisms/notice/Notice.schema';
import { phoneSchema } from '@/components/organisms/phone/Phone.schema';
import { placeSchema } from '@/components/organisms/place/Place.schema';
import { speakerInformationSchema } from '@/components/organisms/speakerInformation/SpeakerInformation.schema';
import { videoSchema } from '@/components/organisms/video/Video.schema';

export const blockSchema = {
  gallery: gallerySchema,
  bgm: bgmSchema,
  greeting: greetingSchema,
  phone: phoneSchema,
  place: placeSchema,
  coupleIntroduction: coupleIntroductionSchema,
  video: videoSchema,
  notice: noticeSchema,
  calendar: calendarSchema,
  speakerInformation: speakerInformationSchema,
} as const;
