import { bgmSchema } from '@/components/organisms/bgm/Bgm.schema';
import { gallerySchema } from '@/components/organisms/gallery/Gallery.schema';
import { greetingSchema } from '@/components/organisms/greeting/Greeting.schema';
import { phoneSchema } from '@/components/organisms/phone/Phone.schema';

export const blockSchema = {
  gallery: gallerySchema,
  bgm: bgmSchema,
  greeting: greetingSchema,
  phone: phoneSchema,
} as const;
