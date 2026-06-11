import { Textbox } from 'fabric';
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
import {
  loadCustomFont,
  preloadPreviewFonts,
  preloadFontFamilyWeights,
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

  const FAMILY_OPTIONS = createFontFamilyOptions().map(option =>
    createFontOption(option.value, 400)
  );

  const weightOptions = useMemo(() => {
    return getFontWeights(selectedFont.value)
      .map(weight => ({
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
        options={FAMILY_OPTIONS}
        onSelect={async option => {
          const newFamily = option.value;

          const currentWeight =
            selectedWeight.value === MIXED_VALUE ? '400' : selectedWeight.value;

          const nextWeight = getFallbackWeight(newFamily, currentWeight) ?? getDefaultFontWeight(newFamily);

          const nextSelectedWeight = {
            label: weightToLabel(nextWeight),
            value: nextWeight,
            style: {
              fontFamily: getFontFallbackStack(newFamily),
              fontWeight: nextWeight,
            },
          };

          await preloadFontFamilyWeights(newFamily);

          setSelectedFont({
            label: newFamily,
            value: newFamily,
            style: {
              fontFamily: getFontFallbackStack(newFamily),
              fontWeight: 400,
            },
          });
          setSelectedWeight(nextSelectedWeight);
          await loadCustomFont(newFamily, nextWeight);
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
          await loadCustomFont(selectedFont.value, nextWeight);

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
