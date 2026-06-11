import { BODY_BULK_DATA, TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import type { BulkData } from '@/shared/types/block';
import { toStyle } from '@/shared/utils/toStyle';

type BulkStyleVariant = 'body' | 'title';

const DEFAULT_BULK_DATA_BY_VARIANT: Record<BulkStyleVariant, BulkData> = {
  body: BODY_BULK_DATA,
  title: TITLE_BULK_DATA,
};

export function createBulkOverrideStyle(
  data: BulkData,
  variant: BulkStyleVariant,
  isEng?: boolean
): import('react').CSSProperties {
  const currentStyle = toStyle(data, variant === 'title', isEng);
  const defaultStyle = toStyle(
    DEFAULT_BULK_DATA_BY_VARIANT[variant],
    variant === 'title',
    isEng
  );

  return {
    fontSize:
      currentStyle.fontSize === defaultStyle.fontSize
        ? undefined
        : currentStyle.fontSize,
    fontFamily:
      currentStyle.fontFamily === defaultStyle.fontFamily
        ? undefined
        : currentStyle.fontFamily,
    fontWeight:
      currentStyle.fontWeight === defaultStyle.fontWeight
        ? undefined
        : currentStyle.fontWeight,
    fontStyle:
      currentStyle.fontStyle === defaultStyle.fontStyle
        ? undefined
        : currentStyle.fontStyle,
    textDecoration:
      currentStyle.textDecoration === defaultStyle.textDecoration
        ? undefined
        : currentStyle.textDecoration,
    textAlign:
      currentStyle.textAlign === defaultStyle.textAlign
        ? undefined
        : currentStyle.textAlign,
    color:
      currentStyle.color === defaultStyle.color ? undefined : currentStyle.color,
  };
}
