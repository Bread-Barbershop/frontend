import { ReactNode } from 'react';

import { PickerHsva } from '@/components/molecules/color-picker/components/colorPicker.types';
import { blockRegistry } from '@/shared/data/registry/registry';

import { blockSchema } from '../data/registry/block.schema';

import { BlockType, PropsFromFields } from './editor';
export type InvitationType =
  | 'wedding'
  | 'firstBirthday'
  | 'birthday'
  | 'conference'
  | 'etc';

export type EditorBlock<T extends BlockType = BlockType> = {
  id: string;
  type: InvitationType;
  component: T;
  props: PropsFromFields<(typeof blockSchema)[T]['fields']>;
};

export type PersistedBlockType = Exclude<BlockType, 'shareUrl'>;
export type PersistedEditorBlock = EditorBlock<PersistedBlockType>;

export type ImageArray = {
  id: string;
  file: (File | string)[];
};

export interface FontOption {
  label: string;
  value: string;
}
type TextAlignValue = 'left' | 'center' | 'right';
export interface BulkData {
  font: string;
  fontSize: string;
  fontWeight: string;
  color: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  align: TextAlignValue;
  isDefault: boolean;
}

export interface TextAlignOption {
  label: ReactNode;
  value: TextAlignValue;
}

export interface BlockSlice {
  block: EditorBlock[];
  addBlock: (type: InvitationType, component: BlockType, id: string) => void;
  updateBlock: <T extends BlockType>(
    id: string,
    props: Partial<PropsFromFields<(typeof blockRegistry)[T]['fields']>>
  ) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (from: number, to: number) => void;
  addAllBlock: (type: InvitationType) => void;
  setBlock: (block: EditorBlock[]) => void;
}

export interface ImageSlice {
  images: ImageArray[];
  updateImage: (id: string, image: (File | string)[]) => void;
  updateImageId: (id: string, imageId: string) => void;
}

export interface DrawingConfig {
  width: number;
  color: PickerHsva;
}

export interface ShapeConfig {
  strokeWidth: number;
  strokeColor: PickerHsva;
  fillColor: PickerHsva;
}

export interface UISlice {
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  selectedId: string | null;
  selectedBlock: (id: string | null) => void;
  activeTab: 'text' | 'image' | 'graphic' | 'background' | 'shape' | null;
  setActiveTab: (
    tab: 'text' | 'image' | 'graphic' | 'background' | 'shape' | null
  ) => void;
  drawingConfig: DrawingConfig;
  setDrawingConfig: (config: Partial<DrawingConfig>) => void;
  shapeConfig: ShapeConfig;
  setShapeConfig: (config: Partial<ShapeConfig>) => void;
  isDirty: boolean;
  setIsDirty: (isDirty: boolean) => void;
}

export interface DriveSlice {
  invitationFolderId: string;
  invitationUuid: string;
  audioFolderId: string;
  imageFolderId: string;
  hashFiles: string[];
  cleanUpFiles: string[];
  setHashFiles: (hash: string) => void;
  setCleanUpFiles: (fileId: string) => void;
  clearHashFiles: () => void;
  clearCleanUpFiles: () => void;
  setInvitationFolderId: (id: string) => void;
  setInvitationUuid: (uuid: string) => void;
  setAudioFolderId: (id: string) => void;
  setImageFolderId: (id: string) => void;
}
export interface BulkSlice {
  titleData: BulkData;
  bodyData: BulkData;
  backgroundColor: string;
  isZoom: boolean;
  setBackgroundColor: (color: string) => void;
  setTitleData: (data: BulkData) => void;
  setBodyData: (data: BulkData) => void;
  setIsZoom: (isZoom: boolean) => void;
}

export interface ShareUrlState {
  title: string;
  description: string;
  images: (File | string)[];
  urlTitle: string;
  urlDescription: string;
  urlImage: (File | string)[];
  showLocationButton: boolean;
  locationInfo?: {
    lat: number;
    lng: number;
    placeName: string;
  };
}

export interface ShareUrlSlice {
  shareUrl: ShareUrlState;
  shareUrlTab: 'url' | 'kakao';
  updateShareUrl: (data: Partial<ShareUrlState>) => void;
  setShareUrl: (data: ShareUrlState) => void;
  setShareUrlTab: (tab: 'url' | 'kakao') => void;
}

export type EditorState = BlockSlice &
  ImageSlice &
  UISlice &
  DriveSlice &
  ShareUrlSlice &
  BulkSlice & {
    reset: () => void;
  };
