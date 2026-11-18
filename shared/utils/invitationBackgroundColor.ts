import {
  hexToRgba,
  hslaStringToHsva,
  hsvaToRgba,
  rgbaStringToHsva,
  type RgbaColor,
} from '@uiw/color-convert';

import { BODY_BULK_DATA, TITLE_BULK_DATA } from '@/shared/data/sample/bulkData';
import type { BulkData } from '@/shared/types/block';

const DARK_TITLE_COLOR = '#FFFAF2';
const DARK_BODY_COLOR = '#E2E6ED';
const DARK_BACKGROUND_LUMINANCE = Math.sqrt(21) * 0.05 - 0.05;
const HEX_COLOR = /^#?(?:[a-f\d]{3,4}|[a-f\d]{6}|[a-f\d]{8})$/i;
const CSS_COLOR =
  /^(rgb|hsl)a?\(\s*-?(?:\d*\.)?\d+(?:%|deg|grad|rad|turn)?(?:\s*,\s*|\s+)-?(?:\d*\.)?\d+%?(?:\s*,\s*|\s+)-?(?:\d*\.)?\d+%?(?:\s*[,/]\s*-?(?:\d*\.)?\d+%?)?\s*\)$/;

function linearize(channel: number) {
  const value = channel / 255;
  return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
}

export function parseInvitationBackgroundColor(
  value: string
): RgbaColor | undefined {
  const normalized = value.trim().toLowerCase();
  if (normalized === 'transparent') return { r: 0, g: 0, b: 0, a: 0 };
  if (normalized === 'black') return hexToRgba('#000');
  if (normalized === 'white') return hexToRgba('#fff');
  if (HEX_COLOR.test(normalized)) {
    const digits = normalized.replace(/^#/, '');
    // The converter expands #RGB but does not expand #RGBA.
    return hexToRgba(
      digits.length === 4 ? digits.replace(/./g, '$&$&') : digits
    );
  }

  const format = CSS_COLOR.exec(normalized)?.[1];
  if (format === 'rgb') return hsvaToRgba(rgbaStringToHsva(normalized));
  if (format === 'hsl') return hsvaToRgba(hslaStringToHsva(normalized));
  return undefined;
}

function getLuminance(value: string) {
  const color = parseInvitationBackgroundColor(value);
  if (!color) return 1;

  const { r, g, b, a } = color;
  const compositeOnWhite = (channel: number) => channel * a + 255 * (1 - a);
  return (
    0.2126 * linearize(compositeOnWhite(r)) +
    0.7152 * linearize(compositeOnWhite(g)) +
    0.0722 * linearize(compositeOnWhite(b))
  );
}

export function isDarkInvitationBackground(backgroundColor: string) {
  return getLuminance(backgroundColor) <= DARK_BACKGROUND_LUMINANCE;
}

export function usesDarkInvitationCards(
  backgroundColor: string,
  titleData: BulkData,
  bodyData: BulkData
) {
  return (
    (titleData.colorMode === 'automatic' ||
      bodyData.colorMode === 'automatic') &&
    isDarkInvitationBackground(backgroundColor)
  );
}

export function usesAutomaticBulkColor(data: BulkData, defaultColor: string) {
  if (data.colorMode) return data.colorMode === 'automatic';
  return data.color.trim().toLowerCase() === defaultColor.toLowerCase();
}

function resolveTextColor(
  data: BulkData,
  lightColor: string,
  darkColor: string,
  backgroundLuminance: number
): BulkData {
  if (!usesAutomaticBulkColor(data, lightColor)) return data;

  let color = lightColor;
  if (backgroundLuminance <= DARK_BACKGROUND_LUMINANCE) {
    const contrast =
      (getLuminance(darkColor) + 0.05) / (backgroundLuminance + 0.05);
    color = contrast >= 4.5 ? darkColor : '#FFFFFF';
  }

  if (color === data.color) return data;
  return { ...data, color, colorMode: 'automatic' };
}

export function resolveInvitationTextColors(
  backgroundColor: string,
  titleData: BulkData,
  bodyData: BulkData
) {
  const luminance = getLuminance(backgroundColor);
  return {
    titleData: resolveTextColor(
      titleData,
      TITLE_BULK_DATA.color,
      DARK_TITLE_COLOR,
      luminance
    ),
    bodyData: resolveTextColor(
      bodyData,
      BODY_BULK_DATA.color,
      DARK_BODY_COLOR,
      luminance
    ),
  };
}
