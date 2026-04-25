import { ComponentType } from 'react';

import { GalleryTemplateProps, GalleryVariant } from '../types/galleryType';

import GalleryType1 from './GalleryType1';
import GalleryType2 from './GalleryType2';
import GalleryType3 from './GalleryType3';
import GalleryType4 from './GalleryType4';
import GalleryType5 from './GalleryType5';
import GalleryType6 from './GalleryType6';
import GalleryType7 from './GalleryType7';

export const GalleryTemplate = {
  galleryType1: GalleryType1,
  galleryType2: GalleryType2,
  galleryType3: GalleryType3,
  galleryType4: GalleryType4,
  galleryType5: GalleryType5,
  galleryType6: GalleryType6,
  galleryType7: GalleryType7,
} satisfies Record<GalleryVariant, ComponentType<GalleryTemplateProps>>;
