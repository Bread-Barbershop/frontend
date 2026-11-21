export const POSTER_BACKGROUND_VERSION = 1;

type TemplateBackground = {
  color: string;
  inset?: { left: number; top: number; width: number; height: number };
  stockImage?: { sourceLength: number; sourceHash: number };
};

const WEDDING_07_BACKGROUND = { color: '#314952' };

// Preset copies generate new object IDs and slot keys, but keep the slot label.
const LEGACY_TEMPLATE_BACKGROUNDS = new Map<string, TemplateBackground>([
  [
    'Photo Slot 1781771300634',
    {
      color: '#486374',
      inset: {
        left: 187.2409,
        top: 401.6479,
        width: 335.4817,
        height: 595.7043,
      },
    },
  ],
  [
    'Photo Slot 1781771632193',
    {
      color: '#486374',
      inset: { left: 187.5, top: 401.1479, width: 334.625, height: 594.7043 },
    },
  ],
  ['Photo Slot 1781774244347', WEDDING_07_BACKGROUND],
  ['Photo Slot 1781774294686', WEDDING_07_BACKGROUND],
  ['Photo Slot 1781774310061', WEDDING_07_BACKGROUND],
  ['Photo Slot 1781774334804', WEDDING_07_BACKGROUND],
  ['Photo Slot 1781775622865', { color: '#29252B' }],
  ['Photo Slot 1781791569640', { color: '#414638' }],
  [
    'Photo Slot 1781693436810',
    {
      color: '#AC6232',
      stockImage: { sourceLength: 57939, sourceHash: 0x46e4483d },
    },
  ],
  [
    'Photo Slot 1781694552818',
    {
      color: '#B05B6D',
      stockImage: { sourceLength: 72287, sourceHash: 0x9fff7d99 },
    },
  ],
  [
    'Photo Slot 1781696600049',
    {
      color: '#827361',
      stockImage: { sourceLength: 5103, sourceHash: 0x9759262e },
    },
  ],
]);

const STOCK_SEMINAR_IMAGE_PROPERTIES = {
  type: 'Image',
  left: 187.5,
  top: 406,
  width: 375,
  height: 812,
  cropX: 0,
  cropY: 0,
  opacity: 1,
  visible: true,
};

type SerializedPosterObject = Record<string, unknown> & {
  slot?: { label?: string; replaceable?: boolean };
};

function matchesStockSeminarImage(
  image: SerializedPosterObject,
  { sourceLength, sourceHash }: NonNullable<TemplateBackground['stockImage']>
) {
  const { src, filters, clipPath, shadow, imageBaseScale } = image;
  if (
    typeof src !== 'string' ||
    src.length !== sourceLength ||
    imageBaseScale != null ||
    (Array.isArray(filters) && filters.length > 0) ||
    clipPath ||
    shadow ||
    !Object.entries(STOCK_SEMINAR_IMAGE_PROPERTIES).every(
      ([key, value]) => image[key] === value
    )
  ) {
    return false;
  }

  // FNV-1a fingerprint of the inline WebP in the original template.
  let hash = 0x811c9dc5;
  for (let index = 0; index < src.length; index++) {
    hash = Math.imul(hash ^ src.charCodeAt(index), 0x01000193);
  }
  return hash >>> 0 === sourceHash;
}

export function restoreLegacyPosterBackground(
  poster: Record<string, unknown>
): Record<string, unknown> {
  if (
    poster?.background !== '#ffffff' ||
    poster.posterBackgroundVersion !== undefined ||
    poster.backgroundImage != null ||
    !Array.isArray(poster.objects)
  ) {
    return poster;
  }

  const objects: (SerializedPosterObject | null)[] = poster.objects;
  const candidates = new Set<TemplateBackground>();
  for (const object of objects) {
    if (object?.type !== 'Rect' && object?.type !== 'Image') continue;
    const { slot } = object;
    if (!slot?.replaceable || !slot.label) continue;
    const background = LEGACY_TEMPLATE_BACKGROUNDS.get(slot.label);
    if (background) candidates.add(background);
  }

  const [template] = candidates;
  if (candidates.size !== 1) return poster;

  const [layer, secondLayer] = objects.filter(
    object => object?.id === 'background-layer'
  );
  if (
    secondLayer ||
    (layer &&
      (!template.stockImage ||
        !matchesStockSeminarImage(layer, template.stockImage)))
  ) {
    return poster;
  }

  if (template.inset) {
    return {
      ...poster,
      backgroundImage: {
        type: 'Rect',
        originX: 'center',
        originY: 'center',
        ...template.inset,
        fill: template.color,
        strokeWidth: 0,
      },
    };
  }

  return { ...poster, background: template.color };
}
