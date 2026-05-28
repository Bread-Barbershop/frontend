'use client';

import { useViewportScale } from '@/shared/hooks/useViewportScale';

function DashboardTitle() {
  const titleScale = useViewportScale();

  return (
    <div
      className="border border-white/30 bg-white/15 text-right backdrop-blur-md"
      style={{
        padding: `${2 * titleScale}rem`,
        borderRadius: `${2 * titleScale}rem`,
        boxShadow:
          'inset 4px 4px 18px rgba(0, 0, 0, 0.08), inset -4px -4px 18px rgba(255, 255, 255, 0.75)',
      }}
    >
      <p
        className="font-medium"
        style={{ fontSize: `${1.5 * titleScale}rem` }}
      >
        Archive
      </p>
      <p
        className="font-black"
        style={{ fontSize: `${4 * titleScale}rem` }}
      >
        내 초대장
      </p>
      <p
        className="font-medium"
        style={{ fontSize: `${1.5 * titleScale}rem` }}
      >
        저장한 초대장을 다시 편집하거나 사용할 수 있어요.
      </p>
    </div>
  );
}

export default DashboardTitle;
