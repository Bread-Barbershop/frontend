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
  const handleFontFamilySelect = (
    option: FontOption | { label: string; value: string }
  ) => {
    const selected = option;
    onBulkChange({
      ...bulkData,
      font: selected.value,
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
  const handleTextCharSpacing = (charSpacing: number) => {
    onBulkChange({
      ...bulkData,
      charSpacing,
    });
  };
  const handleTextLineHeight = (lineHeight: number) => {
    onBulkChange({
      ...bulkData,
      lineHeight,
    });
  };
  return {
    handleFontSizeSelect,
    handleFontFamilySelect,
    handleTextAlignSelect,
    handleTextColorSelect,
    handleTextCharSpacing,
    handleTextLineHeight,
  };
}
