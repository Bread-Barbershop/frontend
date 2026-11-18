'use client';

import { animate, motion, useMotionValue, useTransform } from 'framer-motion';
import { Check } from 'lucide-react';
import { useEffect, useId } from 'react';
import { useShallow } from 'zustand/shallow';

import { usePrefersReducedMotion } from '@/components/organisms/gallery/hooks/usePrefersReducedMotion';
import {
  BACKGROUND_TEXTURE_OPTIONS,
  backgroundTextureImage,
} from '@/shared/data/backgroundTextures';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { cn } from '@/shared/utils/cn';
import { parseInvitationBackgroundColor } from '@/shared/utils/invitationBackgroundColor';

export default function BackgroundTextureEdit() {
  const { backgroundColor, backgroundTexture, setBackgroundTexture } =
    useEditorStore(
      useShallow(state => ({
        backgroundColor: state.backgroundColor,
        backgroundTexture: state.backgroundTexture,
        setBackgroundTexture: state.setBackgroundTexture,
      }))
    );
  const headingId = useId();
  const color = parseInvitationBackgroundColor(backgroundColor);
  const swatchColor = color
    ? `rgb(${color.r}, ${color.g}, ${color.b})`
    : backgroundColor;
  const selectedMaterial = BACKGROUND_TEXTURE_OPTIONS.find(
    ({ id }) => id === backgroundTexture.material
  );

  return (
    <section className="w-full space-y-2 border-t border-dashed border-border-divider pt-3">
      <div className="flex justify-between gap-2">
        <h3 id={headingId} className="text-sm font-semibold text-text-primary">
          질감
        </h3>
        <span className="text-xs text-text-secondary" aria-live="polite">
          {selectedMaterial?.label}
        </span>
      </div>
      <div
        role="group"
        aria-labelledby={headingId}
        className="grid grid-cols-4 gap-x-2 gap-y-2.5"
      >
        {BACKGROUND_TEXTURE_OPTIONS.map(({ id, label, size }) => {
          const selected = id === backgroundTexture.material;

          return (
            <button
              key={id}
              type="button"
              aria-pressed={selected}
              className={cn(
                'grid min-w-0 cursor-pointer gap-1 rounded-md text-center text-xs text-text-primary focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
                selected && 'font-semibold'
              )}
              onClick={() =>
                setBackgroundTexture({ ...backgroundTexture, material: id })
              }
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative block h-8 rounded-md border border-black/10 motion-safe:transition-[background-color,box-shadow] motion-safe:duration-300',
                  selected && 'ring-2 ring-offset-1 ring-primary'
                )}
                style={{ backgroundColor: swatchColor }}
              >
                {id !== 'none' && (
                  <span
                    className="absolute inset-0 rounded-[inherit] opacity-[0.84]"
                    style={{
                      backgroundImage: backgroundTextureImage(id),
                      backgroundPosition: '39% 48%',
                      backgroundSize: `${size * 0.6}px`,
                    }}
                  />
                )}
                <span
                  className={cn(
                    'absolute right-0.5 bottom-0.5 grid size-4 place-items-center rounded-full bg-primary text-white motion-safe:transition-opacity motion-safe:duration-200',
                    selected ? 'opacity-100' : 'opacity-0'
                  )}
                >
                  <Check size={11} strokeWidth={3} />
                </span>
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      {backgroundTexture.material !== 'none' && (
        <TextureStrengthSlider
          strength={backgroundTexture.strength}
          onChange={strength =>
            setBackgroundTexture({ ...backgroundTexture, strength })
          }
        />
      )}
    </section>
  );
}

function TextureStrengthSlider({
  strength,
  onChange,
}: {
  strength: number;
  onChange: (strength: number) => void;
}) {
  const rangeId = useId();
  const reducedMotion = usePrefersReducedMotion();
  const displayed = useMotionValue(strength);
  const percent = useTransform(displayed, value => `${Math.round(value)}%`);

  useEffect(() => {
    if (reducedMotion) {
      displayed.jump(strength);
      return;
    }
    const animation = animate(displayed, strength, {
      duration: 0.3,
      ease: 'easeOut',
    });
    return () => animation.stop();
  }, [displayed, reducedMotion, strength]);

  return (
    <div className="grid grid-cols-[auto_1fr_4ch] items-center gap-2 text-xs text-text-secondary">
      <label htmlFor={rangeId}>질감 강도</label>
      <div className="relative grid h-5 min-w-0 items-center">
        <input
          id={rangeId}
          type="range"
          min={0}
          max={100}
          value={strength}
          aria-valuetext={`${strength}%`}
          className="peer absolute inset-0 z-10 m-0 h-full w-full cursor-pointer opacity-0 accent-primary forced-colors:opacity-100"
          onChange={event => onChange(Number(event.target.value))}
        />
        <div
          aria-hidden="true"
          className="pointer-events-none mx-2 h-1.5 rounded-full bg-black/15 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-4 peer-focus-visible:outline-primary forced-colors:hidden"
        >
          <motion.div
            className="relative h-full rounded-full bg-primary"
            style={{ width: percent }}
          >
            <span className="absolute top-1/2 right-0 size-4 translate-x-1/2 -translate-y-1/2 rounded-full bg-primary" />
          </motion.div>
        </div>
      </div>
      <motion.output
        htmlFor={rangeId}
        aria-live="off"
        className="text-right tabular-nums"
      >
        {percent}
      </motion.output>
    </div>
  );
}
