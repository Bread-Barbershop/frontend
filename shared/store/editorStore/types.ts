import { blockRegistry } from '@/shared/data/registry/registry';
import { EditorBlock, InvitationType } from '@/shared/types/block';
import { BlockType, PropsFromFields } from '@/shared/types/editor';

export type ImageArray = {
  id: string;
  file: File[];
};

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
}

export interface ImageSlice {
  images: ImageArray[];
  updateImage: (id: string, image: File[]) => void;
  updateImageId: (id: string, imageId: string) => void;
}

export interface UISlice {
  selectedId: string | null;
  selectedBlock: (id: string) => void;
  activeTab: 'image' | 'diagram' | null;
  setActiveTab: (tab: 'image' | 'diagram' | null) => void;
}

export type EditorState = BlockSlice & ImageSlice & UISlice;
