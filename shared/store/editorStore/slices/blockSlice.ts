import { StateCreator } from 'zustand';

import { readPhotoStoryPages } from '@/components/organisms/photoStory/PhotoStory.schema';
import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import type { BlockSlice, EditorBlock, EditorState } from '@/shared/types/block';
import { createDefaultProps } from '@/shared/utils/createDefaultProps';

export const createBlockSlice: StateCreator<EditorState, [], [], BlockSlice> = (
  set,
  get
) => ({
  block: [],
  addBlock: (type, component, id, initialProps) =>
    set(state => ({
      block: [
        ...state.block,
        {
          id,
          type,
          component,
          props: { ...createDefaultProps(component, type), ...initialProps },
        },
      ],
    })),
  updateBlock: (id, props) =>
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
  updateBlockAppearance: (id, appearance) =>
    set(state => ({
      block: state.block.map(block =>
        block.id === id
          ? { ...block, props: { ...block.props, ...appearance } }
          : block
      ),
    })),
  deleteBlock: (id: string) =>
    set(state => {
      const block = state.block.filter(item => item.id !== id);
      const story = state.block.find(
        (item): item is EditorBlock<'photoStory'> =>
          item.id === id && item.component === 'photoStory'
      );
      if (!story) return { block };
      const pageIds = new Set(
        readPhotoStoryPages(story.props.pages).map(page => page.id)
      );
      return {
        block,
        images: state.images.filter(image => !pageIds.has(image.id)),
      };
    }),
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
      // UISlice의 기능을 get()을 통해 참조 가능
      if (index === 0) get().selectedBlock(id);
      if (item.component) {
        get().addBlock(english, item.component, id);
      }
    });
  },
  setBlock: block => set({ block }),
});
