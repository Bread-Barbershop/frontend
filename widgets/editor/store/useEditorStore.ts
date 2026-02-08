import { create } from 'zustand';

import { componentCls } from '@/shared/samples/componentSample';

import { BlockType, PropsFromFields } from '../types/editor';
import { blockRegistry } from '../types/registry';

import { createDefaultProps } from './createDefaultProps';

export type EditorBlock<T extends BlockType = BlockType> = {
  id: string;
  type: string;
  component: T;
  props: PropsFromFields<(typeof blockRegistry)[T]['fields']>;
};

type ImageArray = {
  id: string;
  file: File[];
};

interface EditorState {
  block: EditorBlock[];
  images: ImageArray[];
  selectedId: string | null;
  selectedBlock: (id: string) => void;
  addBlock: (type: string, component: BlockType, id: string) => void;
  updateBlock: <T extends BlockType>(
    id: string,
    props: Partial<PropsFromFields<(typeof blockRegistry)[T]['fields']>>
  ) => void;
  deleteBlock: (id: string) => void;
  moveBlock: (from: number, to: number) => void;
  addAllBlock: (
    english: 'wedding' | 'firstBirthday' | 'birthday' | 'conference' | 'etc'
  ) => void;
  updateImage: (id: string, image: File[]) => void;
  updateImageId: (id: string, imageId: string) => void;
}

export const useEditorStore = create<EditorState>((set, get) => ({
  block: [],
  images: [],
  selectedId: null,
  selectedBlock: id =>
    set({
      selectedId: id,
    }),
  addBlock: (type, component, id) =>
    set(state => ({
      block: [
        ...state.block,
        {
          id,
          type,
          component,
          props: createDefaultProps(component),
        },
      ],
    })),
  updateBlock: <T extends BlockType>(
    id: string,
    props: Partial<PropsFromFields<(typeof blockRegistry)[T]['fields']>>
  ) =>
    set(state => ({
      block: state.block.map(block =>
        block.id === id
          ? {
              ...block,
              props: {
                ...block.props,
                ...props,
              },
            }
          : block
      ),
    })),
  deleteBlock: (id: string) =>
    set(state => ({
      block: state.block.filter(items => items.id !== id),
    })),
  moveBlock: (from, to) =>
    set(state => {
      const next = [...state.block];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);

      return { block: next };
    }),
  addAllBlock: english => {
    const selectedType = componentCls.find(
      component => component.english === english
    );
    if (!selectedType) return;

    selectedType.list.forEach((item, index) => {
      const id = crypto.randomUUID();
      if (index === 0) get().selectedBlock(id);
      if (item.component) {
        get().addBlock(selectedType.english, item.component, id);
      }
    });
  },
  updateImage: (id, image) =>
    set(state => {
      const index = state.images.findIndex(item => item.id === id);
      console.log('index', index);
      if (index === -1) {
        return { images: [...state.images, { id, file: image }] };
      }
      return {
        images: state.images.map(item =>
          item.id === id ? { id, file: image } : item
        ),
      };
    }),
  updateImageId: (id, imageId) =>
    set(state => ({
      block: state.block.map(block =>
        block.id === id
          ? { ...block, props: { ...block.props, images: imageId } }
          : block
      ),
    })),
}));
