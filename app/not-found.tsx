'use client';
import Link from 'next/link';

import Arrow from '@/shared/assets/icons/arrow.svg';

function NotFound() {
  return (
    <div className="min-h-screen w-full flex-center flex-col overflow-hidden relative bg-bg-base font-maruburi">
      <div
        className="
          flex w-185 flex-col gap-2 rounded-4xl p-8
          bg-white/6 backdrop-blur-xs
          border-x border-white/30
          shadow-2xl
          supports-backdrop-filter:bg-white/6
        "
        style={{
          boxShadow: 'inset 8px 8px 16px 5px rgba(0, 0, 0, 0.06)',
        }}
      >
        <div className="relative flex flex-col items-center px-10 py-14 sm:px-[72px] sm:py-[60px]">
          <div className="relative">
            <div className="font-light text-6xl">404</div>
          </div>

          <div className="flex items-center gap-4 my-7 anim-fade-5">
            <div
              className="h-px w-[60px]"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(0,0,0,0.5), transparent)',
              }}
            />
            <div className="w-1.5 h-1.5 rotate-45 bg-black" />
            <div
              className="h-px w-[60px]"
              style={{
                background:
                  'linear-gradient(90deg, transparent, rgba(0,0,0,0.5), transparent)',
              }}
            />
          </div>

          <p className="font-normal text-2xl italic text-center">
            페이지가 존재하지 않습니다.
          </p>

          <p className="font-light text-center mt-4">Page Not Found</p>
          <p className="font-normal text-center mt-3">
            찾으시는 페이지가 존재하지 않거나 이동되었습니다
          </p>

          <Link
            href="/"
            className="inline-flex items-center gap-2.5 relative overflow-hidden mt-12 cursor-pointer border border-black/30 rounded-md px-4 py-2"
          >
            <Arrow className="w-2 h-[10px] text-black rotate-90 font-light" />
            <span>메인으로 돌아가기</span>
          </Link>
        </div>
      </div>

      {/* Bottom branding */}
      <span className="absolute bottom-7">Invia</span>
    </div>
  );
}

export default NotFound;
