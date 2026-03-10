import { accountSchema } from '@/components/organisms/account/Account.schema';
import { bgmSchema } from '@/components/organisms/bgm/Bgm.schema';
import { coupleIntroductionSchema } from '@/components/organisms/couple-introduction/CoupleIntroduction.schema';
import { gallerySchema } from '@/components/organisms/gallery/Gallery.schema';
import { greetingSchema } from '@/components/organisms/greeting/Greeting.schema';
import { phoneSchema } from '@/components/organisms/phone/Phone.schema';
import { placeSchema } from '@/components/organisms/place/Place.schema';

export const blockSchema = {
  gallery: gallerySchema,
  bgm: bgmSchema,
  greeting: greetingSchema,
  phone: phoneSchema,
  place: placeSchema,
  account: accountSchema,
  coupleIntroduction: coupleIntroductionSchema,
} as const;
