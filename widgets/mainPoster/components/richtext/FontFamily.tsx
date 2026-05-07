import { Textbox } from 'fabric';
import { CSSProperties, useEffect, useState } from 'react';

import { Selector } from '@/components/molecules/selector';

import { CUSTOM_FONTS } from '../../constants/fonts';
import { useFabricContext } from '../../context/FabricContext';
import { preloadPreviewFonts } from '../../utils/fontLoader';
import {
  createFontOption,
  createFontStyle,
  MIXED_VALUE,
  mixedOption,
  weightToLabel,
} from '../../utils/fontUtils';

type FontOption = {
  label: string;
  value: string;
  style?: CSSProperties;
};

function FontFamily() {
  const { canvas, activeInfo, getRichStyles, applyRichStyle } =
    useFabricContext();
  const activeObject = canvas?.getActiveObject() as Textbox;

  const currentFontFamily =
    (activeInfo?.styles?.fontFamily as string) || 'Pretendard';
  const currentFontWeight = (activeInfo?.styles?.fontWeight as string) || '400';

  const [selectedFont, setSelectedFont] = useState<FontOption>(
    createFontOption(currentFontFamily)
  );

  const [selectedWeight, setSelectedWeight] = useState<FontOption>({
    label: weightToLabel(currentFontWeight),
    value: currentFontWeight,
  });

  useEffect(() => {
    preloadPreviewFonts();
  }, []);

  useEffect(() => {
    if (!activeObject) {
      return;
    }

    const handleSync = () => {
      getRichStyles(activeObject, 'fontFamily', fontFamily => {
        setSelectedFont(
          fontFamily === MIXED_VALUE
            ? mixedOption
            : {
                label: fontFamily,
                value: fontFamily,
                style: {
                  fontFamily: `"${fontFamily}", Pretendard`,
                  fontWeight: 400,
                },
              }
        );
      });

      getRichStyles(activeObject, 'fontWeight', fontWeight => {
        setSelectedWeight(
          fontWeight === MIXED_VALUE
            ? mixedOption
            : {
                label: weightToLabel(fontWeight),
                value: fontWeight,
              }
        );
      });
    };

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject, getRichStyles]);

  const families = Array.from(new Set(CUSTOM_FONTS.map(f => f.family)));
  const familyOptions = families.map(family => createFontOption(family, 400));

  const availableWeights = CUSTOM_FONTS.filter(
    f => f.family === selectedFont.value
  );
  const weightOptions = Array.from(new Set(availableWeights.map(f => f.weight)))
    .sort((a, b) => Number(a) - Number(b))
    .map(weight => ({
      label: weightToLabel(weight),
      value: weight,
      style: createFontStyle(selectedFont.value, weight),
    }));

  const getFallbackWeight = (weights: string[], currentWeight: string) => {
    if (weights.includes(currentWeight)) return currentWeight;
    if (weights.includes('400')) return '400';
    return weights[0] ?? '400';
  };

  if (!canvas) return null;

  return (
    <div className="flex gap-3">
      <Selector
        className="w-[211px]"
        labelClassName="justify-start pl-1"
        optionLabelClassName="justify-start pl-1"
        placeholder="폰트 패밀리"
        options={familyOptions}
        onSelect={option => {
          const newFamily = option.value;

          const weights = CUSTOM_FONTS.filter(f => f.family === newFamily).map(
            f => String(f.weight)
          );

          const currentWeight =
            selectedWeight.value === MIXED_VALUE ? '400' : selectedWeight.value;

          const nextWeight = getFallbackWeight(weights, currentWeight);

          const nextSelectedWeight = {
            label: weightToLabel(nextWeight),
            value: nextWeight,
          };

          setSelectedFont({
            label: newFamily,
            value: newFamily,
            style: {
              fontFamily: `"${newFamily}", Pretendard`,
              fontWeight: 400,
            },
          });
          setSelectedWeight(nextSelectedWeight);

          applyRichStyle(
            {
              fontFamily: newFamily,
              fontWeight: nextWeight,
            },
            canvas
          );
        }}
        selected={selectedFont}
        showCheckbox={false}
        searchable={true}
      />

      <Selector
        className="w-[112px]"
        labelClassName="justify-start pl-1"
        optionLabelClassName="justify-start pl-1"
        placeholder="굵기"
        options={weightOptions}
        onSelect={option => {
          const nextWeight = option.value;

          setSelectedWeight({
            label: weightToLabel(nextWeight),
            value: nextWeight,
            style: {
              fontFamily:
                selectedFont.value === MIXED_VALUE
                  ? 'Pretendard'
                  : `"${selectedFont.value}", Pretendard`,
              fontWeight: nextWeight,
            },
          });

          applyRichStyle({ fontWeight: nextWeight }, canvas);
        }}
        selected={selectedWeight}
        showCheckbox={false}
        searchable={false}
      />
    </div>
  );
}
export default FontFamily;
