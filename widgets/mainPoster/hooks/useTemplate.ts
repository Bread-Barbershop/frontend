import { Canvas } from 'fabric';

import { getTemplateJson } from '@/app/api/template/utils';

export const useTemplate = () => {
  /**
   * 템플릿 JSON을 가져와서 캔버스에 적용합니다.
   * @param canvas Fabric 캔버스 인스턴스
   * @param jsonUrl 템플릿 JSON URL
   */
  const applyTemplateToCanvas = async (
    canvas: Canvas | null,
    jsonUrl: string
  ) => {
    if (!canvas) return;

    try {
      const templateJson = await getTemplateJson(jsonUrl);

      // Fabric 6+ 및 7+ 버전의 loadFromJSON은 Promise를 반환합니다.
      await canvas.loadFromJSON(templateJson);

      // 이미지 필터 및 텍스트 레이아웃 재계산 보장
      const objects = canvas.getObjects();
      for (const obj of objects) {
        if (
          obj.isType('image') &&
          'applyFilters' in obj &&
          (obj as any).filters?.length
        ) {
          (obj as any).applyFilters();
        }

        if (obj.isType('textbox') || obj.isType('itext')) {
          obj.set({ dirty: true });
          (obj as any).initDimensions?.();
        }
      }

      canvas.requestRenderAll();
    } catch (error) {
      console.error('템플릿 적용 중 오류 발생:', error);
      throw error;
    }
  };

  return { applyTemplateToCanvas };
};
