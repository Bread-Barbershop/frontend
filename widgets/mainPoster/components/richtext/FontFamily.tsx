import { Textbox } from 'fabric';
import { useEffect, useState } from 'react';

import { Selector } from '@/components/molecules/selector';

import { CUSTOM_FONTS } from '../../constants/fonts';
import { useFabricContext } from '../../context/FabricContext';

type FontOption = {
  label: string;
  value: string;
};
type CustomFontOption = {
  label: string;
  value: string;
  url: string;
};

function FontFamily() {
  const { canvas, activeInfo, getRichStyles, applyRichStyle } =
    useFabricContext();
  const activeObject = canvas?.getActiveObject() as Textbox;

  const currentFontFamily =
    (activeInfo?.styles?.fontFamily as string) || 'Times New Roman';
  const [selectedFont, setSelectedFont] = useState<FontOption>({
    label: currentFontFamily,
    value: currentFontFamily,
  });

  useEffect(() => {
    if (!activeObject) {
      return;
    }
    const handleSync = () =>
      getRichStyles(activeObject, 'fontFamily', fontFamily =>
        setSelectedFont({
          label: fontFamily,
          value: fontFamily,
        })
      );

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject, getRichStyles]);

  const customFontOption: CustomFontOption[] = CUSTOM_FONTS.map(f => ({
    label: f.family,
    value: f.family,
    url: f.url,
  }));

  // 전역에서 관리되는 폰트 로딩은 useTemplate 등에서 처리되지만,
  // 에디터 진입 시 기본적으로 필요한 폰트들을 등록합니다.
  useEffect(() => {
    CUSTOM_FONTS.forEach(customFont => {
      const existingFaces = Array.from(document.fonts);
      const isAlreadyRegistered = existingFaces.some(
        face =>
          face.family === customFont.family && face.weight === customFont.weight
      );

      if (!isAlreadyRegistered) {
        const fontFace = new FontFace(customFont.family, customFont.url, {
          style: customFont.style as any,
          weight: customFont.weight as any,
        });
        document.fonts.add(fontFace);
        fontFace.load();
      }
    });
  }, []);

  const fontOption = customFontOption;

  if (!canvas) return;
  return (
    <div>
      <Selector
        placeholder="16px"
        options={fontOption}
        onSelect={option => {
          applyRichStyle({ fontFamily: option.value }, canvas);
        }}
        selected={selectedFont}
        showCheckbox={false}
        searchable={true}
      />
    </div>
  );
}
export default FontFamily;
