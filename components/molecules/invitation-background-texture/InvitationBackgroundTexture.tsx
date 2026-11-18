'use client';

import { AnimatePresence, motion } from 'framer-motion';

import { usePrefersReducedMotion } from '@/components/organisms/gallery/hooks/usePrefersReducedMotion';
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
  const reducedMotion = usePrefersReducedMotion();
  const blendMode = isDarkInvitationBackground(color) ? 'soft-light' : 'normal';
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
      <div
        className="absolute inset-0 motion-safe:transition-[background-color] motion-safe:duration-300 motion-safe:ease-out"
        style={{ backgroundColor: color }}
      />
      <AnimatePresence initial={false}>
        {material && opacity > 0 && (
          <motion.div
            key={`${material.id}-${blendMode}`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 0 : 0.3, ease: 'easeOut' }}
            style={{
              backgroundImage: backgroundTextureImage(material.id),
              backgroundSize: `${material.size}px`,
              mixBlendMode: blendMode,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
