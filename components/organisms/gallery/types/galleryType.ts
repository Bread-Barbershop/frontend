export interface GalleryType {
  variant: GalleryVariant;
  ratio: RatioType;
}

export type GalleryVariant =
  | 'galleryType1'
  | 'galleryType2'
  | 'galleryType3'
  | 'galleryType4'
  | 'galleryType5'
  | 'galleryType6'
  | 'galleryType7';

export type RatioType = '1:1' | '4:3' | '3:4' | '16:9' | '9:16';

export interface GalleryTemplateProps {
  preview: string[];
  ratio: RatioType;
  imageClick: (index: number) => void;
}
