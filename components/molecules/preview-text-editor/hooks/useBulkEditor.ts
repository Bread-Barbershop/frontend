import {
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
    void loadCustomFont(resolveFontFamily(bulkData.font), selected.value);
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
      await preloadFontFamilyWeights(nextFamily);
      await loadCustomFont(nextFamily, nextWeight);
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
