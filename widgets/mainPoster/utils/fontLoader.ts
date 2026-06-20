import { getFontFaces, getFontFamilies } from '@/shared/fonts/fontRegistry';

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

export const hasCustomFontFace = (
  family: string,
  weight: string,
  style = 'normal'
) => {
  const normalizedWeight = String(weight);

  return getFontFaces(family).some(
    face => String(face.weight) === normalizedWeight && face.style === style
  );
};

export const loadCustomFont = async (
  family: string,
  weight: string,
  style = 'normal'
) => {
  const normalizedWeight = String(weight);
  const font = getFontFaces(family).find(
    face => String(face.weight) === normalizedWeight && face.style === style
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
  return getFontFamilies()
    .map(fontFamily => {
      const regular = fontFamily.faces.find(face => String(face.weight) === '400');

      return regular ?? fontFamily.faces[0];
    })
    .filter(Boolean);
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
  const fonts = getFontFaces(family).filter(face => face.style === style);

  await Promise.allSettled(
    fonts.map(font =>
      loadCustomFont(font.family, String(font.weight), font.style)
    )
  );
};
