import { bgmDefinition } from '@/components/organisms/bgm/Bgm.definition';
import { galleryDefinition } from '@/components/organisms/gallery/Gallery.definition';
import { greetingDefinition } from '@/components/organisms/greeting/Greeting.definition';
import { placeDefinition } from '@/components/organisms/place/Place.definition';

import { blockSchema } from './block.schema';

export const blockRegistry = {
  gallery: { ...blockSchema.gallery, ...galleryDefinition },
  bgm: { ...blockSchema.bgm, ...bgmDefinition },
  greeting: { ...blockSchema.greeting, ...greetingDefinition },
  place: { ...blockSchema.place, ...placeDefinition },
} as const;
