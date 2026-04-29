import { useEffect } from 'react';

import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const useInitFabricData = () => {
  const { canvas, initialData, saveHistory } = useFabricContext();

  useEffect(() => {
    if (!canvas || !initialData) return;

    const loadData = async () => {
      try {
        await canvas.loadFromJSON(initialData);

        canvas.getObjects().forEach(obj => {
          if (obj.isType('textbox') || obj.isType('itext')) {
            obj.set({ dirty: true });
            (obj as any).initDimensions?.();
          }
        });

        canvas.requestRenderAll();
        saveHistory();
      } catch (error) {
        console.error('Failed to load canvas data:', error);
      }
    };

    loadData();
  }, [canvas, initialData]);
};
