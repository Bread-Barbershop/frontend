export interface GalleryType {
  variant: VariantType;
  ratio: RatioType;
}

export type GalleryVariant =
  | 'galleryType1'
  | 'galleryType2'
  | 'galleryType3'
  | 'galleryType4'
  | 'galleryType5';

export interface VariantType {
  variant: GalleryVariant;
}

export type RatioType = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';
