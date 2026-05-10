import { CUSTOM_FONTS } from '../constants/fonts';

const loadingFontMap = new Map<string, Promise<void>>();

const normalizeFontUrl = (url: string) => {
  if (url.startsWith('url(')) {
    return url;
  }

  return `url(${url})`;
};

export const getFontKey = (
  family: string,
  weight: string,
  style = 'normal'
) => {
  return `${family}-${weight}-${style}`;
};

export const loadCustomFont = async (
  family: string,
  weight: string,
  style = 'normal'
) => {
  const normalizedWeight = String(weight);

  const font = CUSTOM_FONTS.find(
    font =>
      font.family === family &&
      String(font.weight) === normalizedWeight &&
      font.style === style
  );

  if (!font) {
    console.warn('폰트 정보를 찾을 수 없습니다.', {
      family,
      weight: normalizedWeight,
      style,
    });
    return;
  }

  const fontKey = getFontKey(family, normalizedWeight, style);

  const inflight = loadingFontMap.get(fontKey);
  if (inflight) return inflight;

  const promise = (async () => {
    const fontFace = new FontFace(family, normalizeFontUrl(font.url), {
      weight: normalizedWeight,
      style,
    });
    await fontFace.load();
    document.fonts.add(fontFace);
    await document.fonts.load(`${style} ${normalizedWeight} 16px "${family}"`);
  })();
  loadingFontMap.set(fontKey, promise);
  return promise;
};

export const getPreviewFonts = () => {
  const familyMap = new Map<string, (typeof CUSTOM_FONTS)[number][]>();

  CUSTOM_FONTS.forEach(font => {
    const fonts = familyMap.get(font.family) ?? [];
    familyMap.set(font.family, [...fonts, font]);
  });

  return Array.from(familyMap.values()).map(fonts => {
    const regular = fonts.find(font => String(font.weight) === '400');

    return regular ?? fonts[0];
  });
};

export const preloadPreviewFonts = async () => {
  const previewFonts = getPreviewFonts();

  await Promise.allSettled(
    previewFonts.map(font =>
      loadCustomFont(font.family, String(font.weight), font.style)
    )
  );
};

export const preloadFontFamilyWeights = async (
  family: string,
  style = 'normal'
) => {
  const fonts = CUSTOM_FONTS.filter(
    font => font.family === family && font.style === style
  );

  await Promise.allSettled(
    fonts.map(font =>
      loadCustomFont(font.family, String(font.weight), font.style)
    )
  );
};
