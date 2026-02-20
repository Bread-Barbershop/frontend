import { bgmDefinition } from '@/components/organisms/bgm/Bgm.definition';
import { galleryDefinition } from '@/components/organisms/gallery/Gallery.definition';
import { greetingDefinition } from '@/components/organisms/greeting/Greeting.definition';
import { weddingDayDefinition } from '@/components/organisms/sample/WeddingDay.definition';
import { introduceDefinition } from '@/components/organisms/sample2/Introduce.definition';

export const blockRegistry = {
  weddingDay: weddingDayDefinition,
  introduce: introduceDefinition,
  gallery: galleryDefinition,
  bgm: bgmDefinition,
  greeting: greetingDefinition
} as const;
