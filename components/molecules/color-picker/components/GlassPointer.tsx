'use client';

export type GlassPointerSize = {
  outer: number;
  inner: number;
};

export const DEFAULT_GLASS_POINTER_SIZE: GlassPointerSize = {
  outer: 32,
  inner: 16,
};

/**
 * 팔레트와 각 슬라이더에서 공통으로 사용하는 시각 포인터입니다.
 *
 * 실제 운영체제 커서는 별도로 제어하고, 이 컴포넌트는 현재 선택 지점을
 * 일관된 스타일로 표시하는 역할만 담당합니다.
 */
export function GlassPointer({
  left,
  top = '50%',
  color,
  size = DEFAULT_GLASS_POINTER_SIZE,
  cursor = 'inherit',
}: {
  left?: string | number;
  top?: string | number;
  color: string;
  size?: GlassPointerSize;
  cursor?: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'auto',
        cursor,
      }}
    >
      <div
        className="flex items-center justify-center rounded-full border border-white/35 bg-white/20 shadow-[0_8px_18px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.45)]"
        style={{
          width: size.outer,
          height: size.outer,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="rounded-full border border-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
          style={{
            width: size.inner,
            height: size.inner,
            backgroundColor: color,
          }}
        />
      </div>
    </div>
  );
}
