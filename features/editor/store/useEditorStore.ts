import { create } from 'zustand';

type ComponentBlock<Type, Props> = {
  id: string;
  order: number;
  type: Type;
  props: Props;
};

interface EditorState {
  block: ComponentBlock[];
  addBlock: () => void;
  updateBlock: () => void;
  deleteBlock: () => void;
  moveBlock: () => void;
}

export const useEditorStore = create<EditorState>(set => ({
  block: [],
  addBlock: () => set({}),
  updateBlock: () => set({}),
  deleteBlock: () => set({}),
  moveBlock: () => set({}),
}));
