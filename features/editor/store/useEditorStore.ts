import { create } from 'zustand';

import { BlockType, PropsFromFields } from '../types/editor';
import { blockRegistry } from '../types/registry';

// import { createDefaultProps } from './createDefaultProps';

export type EditorBlock<T extends BlockType = BlockType> = {
  id: string;
  type: T;
  props: PropsFromFields<(typeof blockRegistry)[T]['fields']>;
};

interface EditorState {
  block: EditorBlock[];
  selectedId: string | null;
  selectedBlock: (id: string) => void;
  addBlock: (type: BlockType, id: string) => void;
  updateBlock: <T extends BlockType>(
    id: string,
    props: Partial<PropsFromFields<(typeof blockRegistry)[T]['fields']>>
  ) => void;
  deleteBlock: () => void;
  moveBlock: () => void;
}

export const useEditorStore = create<EditorState>(set => ({
  block: [],
  selectedId: null,
  selectedBlock: id =>
    set({
      selectedId: id,
    }),
  addBlock: (type, id) =>
    set(state => ({
      block: [
        ...state.block,
        {
          id,
          type,
          // props: createDefaultProps(type),
          props: {
            weddingDay: '',
            weddingTime: '',
            additionalContents: '',
            calendar: '',
            countDown: '',
          },
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
  deleteBlock: () => set({}),
  moveBlock: () => set({}),
}));
