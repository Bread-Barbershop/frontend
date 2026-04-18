'use client';

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
}: {
  left?: string | number;
  top?: string | number;
  color: string;
}) {
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        transform: 'translate(-50%, -50%)',
        pointerEvents: 'none',
      }}
    >
      <div
        className="flex h-8 w-8 items-center justify-center rounded-full border border-white/35 bg-white/20 shadow-[0_8px_18px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.45)]"
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <div
          className="h-4 w-4 rounded-full border border-white/70 shadow-[0_1px_3px_rgba(0,0,0,0.2)]"
          style={{ backgroundColor: color }}
        />
      </div>
    </div>
  );
}
