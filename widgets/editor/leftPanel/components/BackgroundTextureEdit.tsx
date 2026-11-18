'use client';

import { Check } from 'lucide-react';
import { useId } from 'react';
import { useShallow } from 'zustand/shallow';

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
  const rangeId = useId();
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
                  'relative block h-8 rounded-md border border-black/10',
                  selected && 'outline-2 outline-offset-1 outline-primary'
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
                {selected && (
                  <span className="absolute right-0.5 bottom-0.5 grid size-4 place-items-center rounded-full bg-primary text-white">
                    <Check size={11} strokeWidth={3} />
                  </span>
                )}
              </span>
              <span>{label}</span>
            </button>
          );
        })}
      </div>
      {backgroundTexture.material !== 'none' && (
        <div className="grid grid-cols-[auto_1fr_3ch] items-center gap-2 text-xs text-text-secondary">
          <label htmlFor={rangeId}>질감 강도</label>
          <input
            id={rangeId}
            type="range"
            min={0}
            max={100}
            value={backgroundTexture.strength}
            aria-valuetext={`${backgroundTexture.strength}%`}
            className="w-full min-w-0 cursor-pointer accent-primary"
            onChange={event =>
              setBackgroundTexture({
                ...backgroundTexture,
                strength: Number(event.target.value),
              })
            }
          />
          <output htmlFor={rangeId} className="text-right tabular-nums">
            {backgroundTexture.strength}%
          </output>
        </div>
      )}
    </section>
  );
}
