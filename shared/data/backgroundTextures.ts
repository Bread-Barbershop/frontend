export const BACKGROUND_TEXTURE_OPTIONS = [
  { id: 'none', label: '없음', size: 0 },
  { id: 'wood', label: '우드', size: 275 },
  { id: 'linen', label: '린넨', size: 218 },
  { id: 'hanji', label: '한지', size: 212 },
  { id: 'marble', label: '대리석', size: 288 },
  { id: 'plaster', label: '회벽', size: 230 },
  { id: 'leather', label: '가죽', size: 174 },
  { id: 'floral', label: '꽃 엠보싱', size: 243 },
] as const;

export type BackgroundTextureMaterial =
  (typeof BACKGROUND_TEXTURE_OPTIONS)[number]['id'];

export type BackgroundTextureSettings = {
  material: BackgroundTextureMaterial;
  strength: number;
};

export const DEFAULT_BACKGROUND_TEXTURE: BackgroundTextureSettings = {
  material: 'none',
  strength: 50,
};

export function resolveBackgroundTexture(
  input: unknown
): BackgroundTextureSettings {
  if (!input || typeof input !== 'object' || !('material' in input)) {
    return DEFAULT_BACKGROUND_TEXTURE;
  }

  const option = BACKGROUND_TEXTURE_OPTIONS.find(
    ({ id }) => id === input.material
  );
  if (!option) return DEFAULT_BACKGROUND_TEXTURE;

  const strength =
    'strength' in input &&
    typeof input.strength === 'number' &&
    Number.isFinite(input.strength)
      ? Math.min(100, Math.max(0, Math.round(input.strength)))
      : DEFAULT_BACKGROUND_TEXTURE.strength;

  return { material: option.id, strength };
}

export function backgroundTextureImage(material: BackgroundTextureMaterial) {
  return material === 'none'
    ? undefined
    : `url("/images/invitation-textures/${material}.webp")`;
}
