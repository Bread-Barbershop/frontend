import { create } from 'zustand';

type ColorHistoryState = {
  colorHistory: string[];
  addColorHistory: (hex: string, maxCount: number) => void;
};

const DEFAULT_COLOR_HISTORY = ['#000000', '#FFFFFF'];

export const useColorHistoryStore = create<ColorHistoryState>(set => ({
  colorHistory: DEFAULT_COLOR_HISTORY,
  addColorHistory: (hex, maxCount) =>
    set(state => ({
      colorHistory: [
        hex,
        ...state.colorHistory.filter(color => color !== hex),
      ].slice(0, maxCount),
    })),
}));
