export interface GalleryType {
  variant: GalleryVariant;
  ratio: RatioType;
}

export type GalleryVariant =
  | 'galleryType1'
  | 'galleryType2'
  | 'galleryType3'
  | 'galleryType4'
  | 'galleryType5';

export type RatioType = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
