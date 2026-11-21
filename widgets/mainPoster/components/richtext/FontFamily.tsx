import { CSSProperties, useEffect, useMemo, useState } from 'react';

import { Selector } from '@/components/molecules/selector';
import {
  createFontFamilyOptions,
  getFallbackWeight,
} from '@/shared/fonts/fontOptions';
import {
  getDefaultFontWeight,
  getFontFallbackStack,
  getFontWeights,
} from '@/shared/fonts/fontRegistry';

import { useFabricContext } from '../../context/FabricContext';
import { isTextboxObject } from '../../utils/fabricUtils';
import {
  hasCustomFontFace,
  loadCustomFont,
  loadFontPreview,
} from '../../utils/fontLoader';
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

const familyOptions = createFontFamilyOptions();

async function loadPosterFont(
  family: string,
  weight: string,
  preferredStyle: 'normal' | 'italic'
) {
  const style = hasCustomFontFace(family, weight, preferredStyle)
    ? preferredStyle
    : 'normal';
  if (hasCustomFontFace(family, weight, style)) {
    await loadCustomFont(family, weight, style);
  }
}

function FontFamily() {
  const { canvas, activeInfo, getRichStyles, applyRichStyle } =
    useFabricContext();
  const rawActiveObject = canvas?.getActiveObject();
  const activeObject = isTextboxObject(rawActiveObject)
    ? rawActiveObject
    : null;

  const currentFontFamily =
    (activeInfo?.styles?.fontFamily as string) || 'Pretendard';
  const currentFontWeight = (activeInfo?.styles?.fontWeight as string) || '400';
  const currentFontStyle =
    (activeInfo?.styles?.fontStyle as string) === 'italic'
      ? 'italic'
      : 'normal';

  const [selectedFont, setSelectedFont] = useState<FontOption>(
    createFontOption(currentFontFamily)
  );
  const [selectedWeight, setSelectedWeight] = useState<FontOption>({
    label: weightToLabel(currentFontWeight),
    value: currentFontWeight,
  });

  useEffect(() => {
    if (!activeObject) return;

    const handleSync = () => {
      if (!isTextboxObject(activeObject)) return;
      getRichStyles(
        activeObject,
        ['fontFamily', 'fontWeight'],
        ([fontFamily, fontWeight]) => {
          const isMixedFontFamily = fontFamily === MIXED_VALUE;
          const isMixedFontWeight = fontWeight === MIXED_VALUE;

          setSelectedFont(
            isMixedFontFamily
              ? mixedOption
              : {
                  label: fontFamily,
                  value: fontFamily,
                  style: {
                    fontFamily: getFontFallbackStack(fontFamily),
                    fontWeight: 400,
                  },
                }
          );

          setSelectedWeight(
            isMixedFontWeight
              ? mixedOption
              : {
                  label: weightToLabel(fontWeight),
                  value: fontWeight,
                  style: {
                    fontFamily: isMixedFontFamily
                      ? getFontFallbackStack('Pretendard')
                      : getFontFallbackStack(fontFamily),
                    fontWeight,
                  },
                }
          );
        }
      );
    };

    activeObject.on('changed', handleSync);
    activeObject.on('selection:changed', handleSync);

    handleSync();

    return () => {
      activeObject.off('changed', handleSync);
      activeObject.off('selection:changed', handleSync);
    };
  }, [activeObject, getRichStyles]);

  const weightOptions = useMemo(() => {
    return getFontWeights(selectedFont.value).map(weight => ({
      label: weightToLabel(weight),
      value: weight,
      style: createFontStyle(selectedFont.value, weight),
    }));
  }, [selectedFont.value]);

  if (!canvas) return null;

  return (
    <div className="flex gap-3">
      <Selector<FontOption>
        placeholder="폰트 패밀리"
        variant="fontFamily"
        options={familyOptions}
        onOptionVisible={loadFontPreview}
        onSelect={async option => {
          const newFamily = option.value;
          const currentWeight =
            selectedWeight.value === MIXED_VALUE ? '400' : selectedWeight.value;
          const nextWeight =
            getFallbackWeight(newFamily, currentWeight) ??
            getDefaultFontWeight(newFamily);
          await loadPosterFont(newFamily, nextWeight, currentFontStyle);

          const nextSelectedWeight = {
            label: weightToLabel(nextWeight),
            value: nextWeight,
            style: {
              fontFamily: getFontFallbackStack(newFamily),
              fontWeight: nextWeight,
            },
          };

          setSelectedFont({
            label: option.label,
            value: newFamily,
            style: {
              fontFamily: getFontFallbackStack(newFamily),
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
        searchable={false}
      />

      <Selector<FontOption>
        placeholder="굵기"
        variant="fontWeight"
        options={weightOptions}
        onSelect={async option => {
          const nextWeight = option.value;

          setSelectedWeight({
            label: weightToLabel(nextWeight),
            value: nextWeight,
            style: {
              fontFamily: getFontFallbackStack(selectedFont.value),
              fontWeight: `${nextWeight}`,
            },
          });

          await loadPosterFont(
            selectedFont.value,
            nextWeight,
            currentFontStyle
          );
          applyRichStyle({ fontWeight: nextWeight }, canvas);
        }}
        selected={selectedWeight}
        searchable={false}
      />
    </div>
  );
}

export default FontFamily;
