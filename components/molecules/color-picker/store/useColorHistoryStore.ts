import { create } from 'zustand';

type ColorHistoryState = {
  colorHistory: string[];
  addColorHistory: (hex: string, maxCount: number) => void;
};

export const useColorHistoryStore = create<ColorHistoryState>(set => ({
  colorHistory: [],
  addColorHistory: (hex, maxCount) =>
    set(state => ({
      colorHistory: [
        hex,
        ...state.colorHistory.filter(color => color !== hex),
      ].slice(0, maxCount),
    })),
}));
