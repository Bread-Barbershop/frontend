import { bgmDefinition } from '@/components/organisms/bgm/Bgm.definition';
import { galleryDefinition } from '@/components/organisms/gallery/Gallery.definition';
export const blockRegistry = {
  gallery: galleryDefinition,
  bgm: bgmDefinition,
} as const;
