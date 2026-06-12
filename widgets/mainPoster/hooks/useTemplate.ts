import { Canvas, IText, Textbox } from 'fabric';
import { useCallback, useRef } from 'react';

import { getTemplateJson } from '@/app/api/template/utils';
import { CUSTOM_FONTS } from '@/shared/fonts/fonts';
import { useToast } from '@/shared/hooks/useToast';

type FontRequest = {
  family: string;
  weight: string;
  style: string;
};

type StyleRecord = Record<string, any>;

type TemplateStyleRun = {
  start?: number;
  end?: number;
  style?: StyleRecord;
};

const DEFAULT_FONT_WEIGHT = '400';
const DEFAULT_FONT_STYLE = 'normal';
const TEXT_OBJECT_TYPES = new Set(['textbox', 'i-text', 'text', 'Textbox']);

const templateJsonCache = new Map<string, Promise<any>>();
const templateReadyCache = new Map<string, Promise<any>>();

const waitForNextFrame = () =>
  new Promise<void>(resolve => requestAnimationFrame(() => resolve()));

const waitForFrames = async (count: number) => {
  for (let i = 0; i < count; i += 1) {
    await waitForNextFrame();
  }
};

const waitForTimeout = (ms: number) =>
  new Promise<void>(resolve => window.setTimeout(resolve, ms));

const createFontRequestKey = (font: FontRequest) =>
  `${font.family}::${font.weight}::${font.style}`;

const getAllFontFamilies = () =>
  Array.from(new Set(CUSTOM_FONTS.map(font => font.family)));

const FONT_FAMILIES = getAllFontFamilies().sort((a, b) => b.length - a.length);

const WEIGHT_TOKEN_MAP: Record<string, string> = {
  thin: '100',
  extralight: '200',
  ultralight: '200',
  light: '300',
  regular: '400',
  normal: '400',
  medium: '500',
  semibold: '600',
  demibold: '600',
  bold: '700',
  extrabold: '800',
  ultrabold: '800',
  heavy: '900',
  black: '900',
};

const normalizeFontFamilyName = (value?: string | null) => {
  if (!value) return null;

  const trimmed = value.trim();
  if (!trimmed) return null;

  if (FONT_FAMILIES.includes(trimmed)) {
    return {
      family: trimmed,
      weight: DEFAULT_FONT_WEIGHT,
      style: DEFAULT_FONT_STYLE,
    };
  }

  for (const family of FONT_FAMILIES) {
    if (
      trimmed === family ||
      trimmed.startsWith(`${family}-`) ||
      trimmed.startsWith(`${family} `)
    ) {
      const suffix = trimmed.slice(family.length).replace(/^[-\s]+/, '');
      const normalizedSuffix = suffix.toLowerCase().replace(/\s+/g, '');

      return {
        family,
        weight: WEIGHT_TOKEN_MAP[normalizedSuffix] ?? DEFAULT_FONT_WEIGHT,
        style: normalizedSuffix.includes('italic') ? 'italic' : DEFAULT_FONT_STYLE,
      };
    }
  }

  return {
    family: trimmed,
    weight: DEFAULT_FONT_WEIGHT,
    style: DEFAULT_FONT_STYLE,
  };
};

const normalizeFontRequest = (
  family?: string,
  weight?: string | number,
  style?: string
): FontRequest | null => {
  const normalized = normalizeFontFamilyName(family);
  if (!normalized) return null;

  return {
    family: normalized.family,
    weight: String(weight ?? normalized.weight ?? DEFAULT_FONT_WEIGHT),
    style: style ?? normalized.style ?? DEFAULT_FONT_STYLE,
  };
};

const isTextObject = (obj: any) => TEXT_OBJECT_TYPES.has(obj?.type);

const isTemplateStyleRunArray = (
  styles: unknown
): styles is TemplateStyleRun[] => Array.isArray(styles);

const getTemplateStyleRuns = (obj: any): TemplateStyleRun[] =>
  isTemplateStyleRunArray(obj?.styles) ? obj.styles : [];

const getFirstFabricStyleEntry = (styles?: StyleRecord) => {
  if (!styles || Array.isArray(styles)) return null;

  for (const row of Object.values(styles)) {
    if (!row || typeof row !== 'object') continue;

    for (const charStyle of Object.values(row as StyleRecord)) {
      if (charStyle && typeof charStyle === 'object') {
        return charStyle as StyleRecord;
      }
    }
  }

  return null;
};

const isRunActiveAtIndex = (
  run: TemplateStyleRun,
  textIndexWithoutNewline: number
) => {
  if (typeof run.start !== 'number' || typeof run.end !== 'number') {
    return false;
  }

  return (
    textIndexWithoutNewline >= run.start &&
    textIndexWithoutNewline < run.end
  );
};

const buildFabricStylesFromRuns = (text: string, styleRuns: TemplateStyleRun[]) => {
  if (!styleRuns.length) return {};

  const stylesByLine: Record<number, Record<number, StyleRecord>> = {};
  let lineIndex = 0;
  let charIndexInLine = 0;
  let textIndexWithoutNewline = 0;

  for (let rawIndex = 0; rawIndex < text.length; rawIndex += 1) {
    const character = text[rawIndex];

    if (character === '\n') {
      lineIndex += 1;
      charIndexInLine = 0;
      continue;
    }

    const matchingRun = styleRuns.find(run =>
      isRunActiveAtIndex(run, textIndexWithoutNewline)
    );

    if (matchingRun?.style) {
      stylesByLine[lineIndex] ??= {};
      stylesByLine[lineIndex][charIndexInLine] = { ...matchingRun.style };
    }

    charIndexInLine += 1;
    textIndexWithoutNewline += 1;
  }

  return stylesByLine;
};

const normalizeFabricStyleMap = (
  styles: StyleRecord,
  fallbackFont: FontRequest | null
) => {
  Object.values(styles).forEach((row: any) => {
    if (!row || typeof row !== 'object') return;

    Object.values(row).forEach((charStyle: any) => {
      if (!charStyle || typeof charStyle !== 'object') return;

      const normalizedCharFont = normalizeFontRequest(
        charStyle.fontFamily ?? fallbackFont?.family,
        charStyle.fontWeight ?? fallbackFont?.weight,
        charStyle.fontStyle ?? fallbackFont?.style
      );

      if (!normalizedCharFont) return;

      charStyle.fontFamily = normalizedCharFont.family;
      charStyle.fontWeight = normalizedCharFont.weight;
      charStyle.fontStyle = normalizedCharFont.style;
    });
  });
};

const normalizeTemplateTextObject = (obj: any) => {
  const styleRuns = getTemplateStyleRuns(obj);
  const firstStyleRun = styleRuns.find(run => run?.style)?.style;
  const firstFabricStyleEntry = getFirstFabricStyleEntry(obj.styles);

  const normalizedTopLevel = normalizeFontRequest(
    obj.fontFamily,
    obj.fontWeight,
    obj.fontStyle
  );
  const normalizedRunLevel = normalizeFontRequest(
    firstStyleRun?.fontFamily,
    firstStyleRun?.fontWeight,
    firstStyleRun?.fontStyle
  );
  const normalizedFabricStyleLevel = normalizeFontRequest(
    firstFabricStyleEntry?.fontFamily,
    firstFabricStyleEntry?.fontWeight,
    firstFabricStyleEntry?.fontStyle
  );

  if (normalizedTopLevel) {
    obj.fontFamily = normalizedTopLevel.family;
    obj.fontWeight = normalizedTopLevel.weight;
    obj.fontStyle = normalizedTopLevel.style;
  }

  if (styleRuns.length > 0) {
    obj.styles = buildFabricStylesFromRuns(obj.text ?? '', styleRuns);
  }

  const effectiveFont =
    normalizedFabricStyleLevel ?? normalizedRunLevel ?? normalizedTopLevel;

  if (obj.styles && !Array.isArray(obj.styles)) {
    normalizeFabricStyleMap(obj.styles, effectiveFont);
  }
};

export const normalizeTemplateJsonFonts = (templateJson: any) => {
  templateJson.objects?.forEach((obj: any) => {
    if (isTextObject(obj)) {
      normalizeTemplateTextObject(obj);
    }
  });

  return templateJson;
};

const collectTemplateFonts = (templateJson: any) => {
  const fontRequests = new Map<string, FontRequest>();

  const addFont = (
    family?: string,
    weight?: string | number,
    style?: string
  ) => {
    const request = normalizeFontRequest(family, weight, style);
    if (!request) return;

    fontRequests.set(createFontRequestKey(request), request);
  };

  templateJson.objects?.forEach((obj: any) => {
    addFont(obj.fontFamily, obj.fontWeight, obj.fontStyle);

    if (!obj.styles || Array.isArray(obj.styles)) return;

    Object.values(obj.styles).forEach((row: any) => {
      if (!row || typeof row !== 'object') return;

      Object.values(row).forEach((charStyle: any) => {
        addFont(
          charStyle.fontFamily ?? obj.fontFamily,
          charStyle.fontWeight ?? obj.fontWeight,
          charStyle.fontStyle ?? obj.fontStyle
        );
      });
    });
  });

  return Array.from(fontRequests.values());
};

const getTemplateJsonCached = (jsonUrl: string) => {
  const cached = templateJsonCache.get(jsonUrl);
  if (cached) return cached;

  const request = getTemplateJson(jsonUrl).then(templateJson =>
    normalizeTemplateJsonFonts(templateJson)
  );
  templateJsonCache.set(jsonUrl, request);
  return request;
};

const cloneTemplateJson = <T,>(templateJson: T): T => {
  if (typeof structuredClone === 'function') {
    return structuredClone(templateJson);
  }

  return JSON.parse(JSON.stringify(templateJson)) as T;
};

export const preloadFonts = async (templateJson: any) => {
  const normalizedTemplateJson = normalizeTemplateJsonFonts(templateJson);
  const fontRequests = collectTemplateFonts(normalizedTemplateJson);

  for (const request of fontRequests) {
    const customFonts = CUSTOM_FONTS.filter(
      font =>
        font.family === request.family &&
        font.weight === request.weight &&
        font.style === request.style
    );

    if (customFonts.length === 0) continue;

    for (const customFont of customFonts) {
      const isAlreadyRegistered = Array.from(document.fonts).some(
        face =>
          face.family === customFont.family &&
          face.weight === customFont.weight &&
          face.style === customFont.style
      );

      if (!isAlreadyRegistered) {
        try {
          const fontFace = new FontFace(customFont.family, customFont.url, {
            weight: customFont.weight,
            style: customFont.style,
          });
          await fontFace.load();
          document.fonts.add(fontFace);
        } catch (error) {
          console.error(`폰트 등록 실패: ${customFont.family}`, error);
        }
      }
    }
  }

  const loadPromises = fontRequests.map(async request => {
    try {
      await document.fonts.load(
        `${request.style} ${request.weight} 10px "${request.family}"`
      );
    } catch (error) {
      console.warn(
        `폰트 로드 실패: ${request.family} ${request.weight} ${request.style}`,
        error
      );
    }
  });

  await Promise.all(loadPromises);
  await document.fonts.ready;
};

export const prepareTemplateAssets = async (jsonUrl: string) => {
  const cached = templateReadyCache.get(jsonUrl);
  if (cached) return cached;

  const request = (async () => {
    const templateJson = await getTemplateJsonCached(jsonUrl);
    await preloadFonts(templateJson);
    return templateJson;
  })();

  templateReadyCache.set(jsonUrl, request);
  return request;
};

interface UseTemplateProps {
  runHistoryTransaction?: (
    task: () => Promise<void> | void,
    options?: { save?: boolean }
  ) => Promise<void>;
}

const getCanvasTextObjects = (canvas: Canvas) =>
  canvas.getObjects().filter(
    obj => obj.isType('textbox') || obj.isType('itext') || obj.isType('text')
  ) as Array<Textbox | IText>;

const remeasureTextObjects = (canvas: Canvas) => {
  const textObjects = getCanvasTextObjects(canvas);

  textObjects.forEach(textObj => {
    const fixedWidth =
      textObj.isType('textbox') && typeof textObj.width === 'number'
        ? textObj.width
        : undefined;

    textObj.set({
      dirty: true,
      objectCaching: false,
    });

    if ('_clearCache' in textObj) {
      (textObj as any)._clearCache();
    }

    if ('_splitText' in textObj) {
      (textObj as any)._splitText();
    }

    if (fixedWidth !== undefined) {
      textObj.set({ width: fixedWidth });
    }

    if ('_generateStyleMap' in textObj && '_splitText' in textObj) {
      (textObj as any)._generateStyleMap((textObj as any)._splitText());
    }

    if ('_initDimensions' in textObj) {
      (textObj as any)._initDimensions();
    } else if ('initDimensions' in textObj) {
      (textObj as any).initDimensions();
    }

    if (
      textObj.isType('textbox') &&
      typeof (textObj as any).calcTextHeight === 'function'
    ) {
      textObj.set({
        height: (textObj as any).calcTextHeight(),
      });
    }

    textObj.setCoords();
  });
};

export const stabilizeCanvasAfterLoad = async (
  canvas: Canvas,
  options?: { delayMs?: number }
) => {
  const delayMs = options?.delayMs ?? 120;

  remeasureTextObjects(canvas);
  canvas.discardActiveObject();
  canvas.requestRenderAll();

  await waitForFrames(1);
  await waitForTimeout(delayMs);

  remeasureTextObjects(canvas);
  canvas.requestRenderAll();
  await waitForFrames(1);
};

export const useTemplate = ({
  runHistoryTransaction,
}: UseTemplateProps = {}) => {
  const { error: errorToast } = useToast();
  const latestRequestIdRef = useRef(0);

  const applyTemplateToCanvas = useCallback(
    async (canvas: Canvas | null, jsonUrl: string) => {
      if (!canvas) return;

      const requestId = ++latestRequestIdRef.current;

      try {
        const preparedTemplateJson = await prepareTemplateAssets(jsonUrl);
        if (requestId !== latestRequestIdRef.current) return;

        const templateJson = cloneTemplateJson(preparedTemplateJson);

        await waitForFrames(1);
        if (requestId !== latestRequestIdRef.current) return;

        if (runHistoryTransaction) {
          await runHistoryTransaction(
            async () => {
              if (requestId !== latestRequestIdRef.current) return;
              await canvas.loadFromJSON(templateJson);
            },
            { save: true }
          );
        } else {
          await canvas.loadFromJSON(templateJson);
        }

        if (requestId !== latestRequestIdRef.current) return;

        await stabilizeCanvasAfterLoad(canvas);
      } catch (error) {
        if (requestId !== latestRequestIdRef.current) return;

        errorToast('템플릿 적용 중 오류가 발생했습니다.');
        console.error('템플릿 적용 중 오류 발생:', error);
        throw error;
      }
    },
    [errorToast, runHistoryTransaction]
  );

  return { applyTemplateToCanvas };
};
