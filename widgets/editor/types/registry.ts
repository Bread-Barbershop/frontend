import { bgmDefinition } from '@/components/organisms/bgm/Bgm.definition';
import { galleryDefinition } from '@/components/organisms/gallery/Gallery.definition';
import { greetingDefinition } from '@/components/organisms/greeting/Greeting.definition';

export const blockRegistry = {
  gallery: galleryDefinition,
  bgm: bgmDefinition,
  greeting: greetingDefinition,
} as const;
