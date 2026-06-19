import {
  hasCustomFontFace,
  loadCustomFont,
  preloadFontFamilyWeights,
} from '@/shared/fonts/fontLoader';
import {
  getFallbackWeight,
  getFontFamilyOption,
} from '@/shared/fonts/fontOptions';
import { resolveFontFamily } from '@/shared/fonts/fontRegistry';
import { BulkData, FontOption, TextAlignOption } from '@/shared/types/block';

export function useBulkEditor(
  bulkData: BulkData,
  onBulkChange: (bulkData: BulkData) => void
) {
  const handleFontSizeSelect = (
    option: FontOption | { label: string; value: string }
  ) => {
    const selected = option;
    onBulkChange({
      ...bulkData,
      fontSize: selected.value,
    });
  };
  const handleFontWeightSelect = (
    option: FontOption | { label: string; value: string }
  ) => {
    const selected = option;
    const family = resolveFontFamily(bulkData.font);
    const style = bulkData.italic ? 'italic' : 'normal';

    if (hasCustomFontFace(family, selected.value, style)) {
      void loadCustomFont(family, selected.value, style);
    }

    onBulkChange({
      ...bulkData,
      fontWeight: selected.value,
    });
  };
  const handleFontFamilySelect = (
    option: FontOption | { label: string; value: string }
  ) => {
    const selected = option;
    const nextFamily = resolveFontFamily(selected.value);
    const nextWeight = getFallbackWeight(nextFamily, bulkData.fontWeight);

    void (async () => {
      const style = bulkData.italic ? 'italic' : 'normal';

      if (hasCustomFontFace(nextFamily, nextWeight, style)) {
        await preloadFontFamilyWeights(nextFamily, style);
        await loadCustomFont(nextFamily, nextWeight, style);
      }
    })();

    onBulkChange({
      ...bulkData,
      font: nextFamily,
      fontWeight: nextWeight,
    });
  };

  const handleTextAlignSelect = (
    option: TextAlignOption | { label: string; value: string }
  ) => {
    const selected = option as TextAlignOption;
    onBulkChange({
      ...bulkData,
      align: selected.value,
    });
  };

  const handleTextColorSelect = (hex: string) => {
    onBulkChange({
      ...bulkData,
      color: hex,
    });
  };

  return {
    selectedFontFamily: getFontFamilyOption(bulkData.font),
    handleFontSizeSelect,
    handleFontFamilySelect,
    handleTextAlignSelect,
    handleTextColorSelect,
    handleFontWeightSelect,
  };
}
