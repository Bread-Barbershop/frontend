import { StateCreator } from 'zustand';

import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import { BlockSlice, EditorState } from '@/shared/types/block';
import { createDefaultProps } from '@/shared/utils/createDefaultProps';

export const createBlockSlice: StateCreator<EditorState, [], [], BlockSlice> = (
  set,
  get
) => ({
  block: [],
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
      // UISlice의 기능을 get()을 통해 참조 가능
      if (index === 0) get().selectedBlock(id);
      if (item.component) {
        get().addBlock(selectedType.english, item.component, id);
      }
    });
  },
});
