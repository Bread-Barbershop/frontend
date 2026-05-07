import { ReactNode } from 'react';

import { BulkData } from '@/shared/types/block';

export function useBulkEditor(
  bulkData: BulkData,
  onBulkChange: (bulkData: BulkData) => void
) {
  const handleFontSizeSelect = (option: {
    label: string | ReactNode;
    value: string;
  }) => {
    const selected = option;
    onBulkChange({
      ...bulkData,
      fontSize: selected.value,
    });
  };
  const handleFontFamilySelect = (option: {
    label: string | ReactNode;
    value: string;
  }) => {
    const selected = option;
    onBulkChange({
      ...bulkData,
      font: selected.value,
    });
  };

  const handleTextAlignSelect = (option: {
    label: string | ReactNode;
    value: string;
  }) => {
    const selected = option;
    onBulkChange({
      ...bulkData,
      align: selected.value as any,
    });
  };

  const handleTextColorSelect = (hex: string) => {
    onBulkChange({
      ...bulkData,
      color: hex,
    });
  };

  return {
    handleFontSizeSelect,
    handleFontFamilySelect,
    handleTextAlignSelect,
    handleTextColorSelect,
  };
}
