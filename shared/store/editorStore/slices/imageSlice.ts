import { StateCreator } from 'zustand';

import { EditorState, ImageSlice } from '@/shared/types/block';

export const createImageSlice: StateCreator<
  EditorState,
  [],
  [],
  ImageSlice
> = set => ({
  images: [],
  updateImage: (id, image) =>
    set(state => {
      const index = state.images.findIndex(item => item.id === id);
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
});
