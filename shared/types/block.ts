import { ReactNode } from 'react';

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

export interface UISlice {
  isEdit: boolean;
  setIsEdit: (isEdit: boolean) => void;
  selectedId: string | null;
  selectedBlock: (id: string) => void;
  activeTab: 'text' | 'image' | 'diagram' | null;
  setActiveTab: (tab: 'text' | 'image' | 'diagram' | null) => void;
}

export interface DriveSlice {
  invitationUuid: string;
  audioFolderId: string;
  imageFolderId: string;
  setInvitationUuid: (uuid: string) => void;
  setAudioFolderId: (id: string) => void;
  setImageFolderId: (id: string) => void;
}
export interface BulkSlice {
  isEngTitle: boolean;
  titleData: BulkData;
  bodyData: BulkData;
  backgroundColor: string;
  setBackgroundColor: (color: string) => void;
  setEngTitle: (isEngTitle: boolean) => void;
  setTitleData: (data: BulkData) => void;
  setBodyData: (data: BulkData) => void;
}

export type EditorState = BlockSlice &
  ImageSlice &
  UISlice &
  DriveSlice &
  BulkSlice;
