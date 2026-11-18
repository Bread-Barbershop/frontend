import {
  BACKGROUND_TEXTURE_OPTIONS,
  backgroundTextureImage,
  type BackgroundTextureSettings,
} from '@/shared/data/backgroundTextures';
import {
  isDarkInvitationBackground,
  parseInvitationBackgroundColor,
} from '@/shared/utils/invitationBackgroundColor';

type Props = {
  color: string;
  texture?: BackgroundTextureSettings;
};

export function InvitationBackgroundTexture({ color, texture }: Props) {
  const material = BACKGROUND_TEXTURE_OPTIONS.find(
    ({ id }) => id === texture?.material && id !== 'none'
  );
  const opacity =
    material && texture?.strength
      ? (texture.strength / 100) *
        (parseInvitationBackgroundColor(color)?.a ?? 1)
      : 0;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 isolate bg-white"
    >
      <div className="absolute inset-0" style={{ backgroundColor: color }} />
      {material && opacity > 0 && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: backgroundTextureImage(material.id),
            backgroundSize: `${material.size}px`,
            mixBlendMode: isDarkInvitationBackground(color)
              ? 'soft-light'
              : 'normal',
            opacity,
          }}
        />
      )}
    </div>
  );
}
