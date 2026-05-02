import { Canvas, Textbox, IText } from 'fabric';

import { getTemplateJson } from '@/app/api/template/utils';

import { CUSTOM_FONTS } from '../constants/fonts';

/**
 * 템플릿 JSON에서 모든 fontFamily를 추출하여 로드합니다.
 */
const preloadFonts = async (templateJson: any) => {
  const fontFamilies = new Set<string>();

  // 기본 객체들에서 fontFamily 추출
  templateJson.objects?.forEach((obj: any) => {
    if (obj.fontFamily) {
      fontFamilies.add(obj.fontFamily);
    }

    // 텍스트 스타일(부분 스타일)에서 fontFamily 추출
    if (obj.styles) {
      Object.values(obj.styles).forEach((row: any) => {
        Object.values(row).forEach((charStyle: any) => {
          if (charStyle.fontFamily) {
            fontFamilies.add(charStyle.fontFamily);
          }
        });
      });
    }
  });

  // 커스텀 폰트 등록 확인 및 등록
  for (const font of fontFamilies) {
    const customFonts = CUSTOM_FONTS.filter(f => f.family === font);
    if (customFonts.length > 0) {
      // 이미 등록된 폰트인지 확인
      const existingFaces = Array.from(document.fonts);

      for (const customFont of customFonts) {
        const isAlreadyRegistered = existingFaces.some(
          face =>
            face.family === customFont.family &&
            face.weight === customFont.weight
        );

        if (!isAlreadyRegistered) {
          try {
            const fontFace = new FontFace(customFont.family, customFont.url, {
              weight: customFont.weight,
              style: customFont.style,
            });
            document.fonts.add(fontFace);
          } catch (e) {
            console.error(`폰트 등록 실패: ${customFont.family}`, e);
          }
        }
      }
    }
  }

  const loadPromises = Array.from(fontFamilies).map(async font => {
    const fontSpec = `10px "${font}"`;
    try {
      await document.fonts.load(fontSpec);
    } catch (e) {
      console.warn(`폰트 로드 실패: ${font}`, e);
    }
  });

  await Promise.all(loadPromises);
  await document.fonts.ready;
};

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

      // 1. 폰트 로딩 보장 (JSON 로드 전)
      await preloadFonts(templateJson);

      // 2. JSON 로드
      await canvas.loadFromJSON(templateJson);

      // 3. 개체별 보정 및 렌더링 최적화
      const objects = canvas.getObjects();
      for (const obj of objects) {
        // 이미지 필터 적용
        if (
          obj.isType('image') &&
          'applyFilters' in obj &&
          (obj as any).filters?.length
        ) {
          (obj as any).applyFilters();
        }

        // 텍스트 개체 재계산 (폰트 적용 보장)
        if (
          obj.isType('textbox') ||
          obj.isType('itext') ||
          obj.isType('text')
        ) {
          const textObj = obj as Textbox | IText;

          // 캐시 초기화 및 다시 그리기 강제
          textObj.set({
            dirty: true,
            objectCaching: false,
          });

          // 폰트에 따른 치수 재계산
          if ('_initDimensions' in textObj) {
            (textObj as any)._initDimensions();
          } else if ('initDimensions' in textObj) {
            (textObj as any).initDimensions();
          }

          textObj.setCoords();
        }
      }

      // 브라우저가 폰트를 완전히 적용할 시간을 주기 위해 한 프레임 대기 후 렌더링
      await new Promise(resolve => requestAnimationFrame(resolve));
      canvas.requestRenderAll();

      // 최종적으로 한 번 더 렌더링 (간혹 비동기 폰트 적용 시 필요)
      setTimeout(() => {
        canvas.requestRenderAll();
      }, 100);
    } catch (error) {
      console.error('템플릿 적용 중 오류 발생:', error);
      throw error;
    }
  };

  return { applyTemplateToCanvas };
};
