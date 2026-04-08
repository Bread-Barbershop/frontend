import { Canvas, FabricImage } from 'fabric';

interface Props {
  canvas: Canvas | null;
  saveHistory: () => void;
}
export const useFabricBackground = ({ canvas, saveHistory }: Props) => {
  const setBackgroundColor = (color: string) => {
    if (!canvas) return;
    canvas.set({
      backgroundColor: color,
      backgroundImage: null,
    });
    canvas.requestRenderAll();
    saveHistory();
  };

  const setBackgroundImage = async (base64: string) => {
    if (!canvas) return;

    try {
      const img = await FabricImage.fromURL(base64);

      // 캔버스 크기에 맞춰 이미지 스케일링 (Cover)
      const scaleX = canvas.width / img.width;
      const scaleY = canvas.height / img.height;
      const scale = Math.max(scaleX, scaleY);

      img.set({
        scaleX: scale,
        scaleY: scale,
        originX: 'center',
        originY: 'center',
        left: canvas.width / 2,
        top: canvas.height / 2,
      });

      canvas.set({ backgroundImage: img });
      canvas.requestRenderAll();
      saveHistory();
    } catch (error) {
      console.error('Failed to set background image:', error);
    }
  };

  return {
    setBackgroundColor,
    setBackgroundImage,
  };
};
