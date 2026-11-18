'use client';

import { ArrowUpRight, X } from 'lucide-react';
import Image from 'next/image';
import { useId, useRef } from 'react';

import naverLogo from '@/shared/assets/images/supporters/naver.png';
import woowaBrothersLogo from '@/shared/assets/images/supporters/woowa-brothers.jpg';

import styles from './HeaderSupportersButton.module.css';

const fontProviders = [
  {
    name: '네이버',
    copyright: 'NAVER Corporation',
    logo: naverLogo,
    logoClassName: 'w-[112%]',
    licenseUrl: '/font/licenses/naver.txt',
  },
  {
    name: '우아한형제들',
    copyright: 'Woowa Brothers Corporation',
    logo: woowaBrothersLogo,
    logoClassName: 'w-[125%]',
    licenseUrl: '/font/licenses/baemin.txt',
  },
];

export default function HeaderSupportersButton({
  className,
}: {
  className: string;
}) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();
  const titleId = `${dialogId}-title`;

  return (
    <>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-controls={dialogId}
        onClick={() => dialogRef.current?.showModal()}
        className={className}
      >
        Supporters
      </button>

      <dialog
        ref={dialogRef}
        id={dialogId}
        aria-labelledby={titleId}
        className="fixed inset-0 m-auto max-h-[calc(100dvh_-_2rem)] w-[calc(100%_-_2rem)] max-w-md overflow-y-auto rounded-2xl border-0 bg-white p-6 text-text-plain shadow-xl backdrop:bg-black/40"
      >
        <div className="mb-5 flex items-center justify-between gap-4">
          <h2 id={titleId} className="text-2xl font-bold">
            Fonted By
          </h2>
          <form method="dialog">
            <button
              type="submit"
              aria-label="닫기"
              className="flex size-9 cursor-pointer items-center justify-center rounded-full text-neutral-600 hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
            >
              <X size={19} aria-hidden="true" />
            </button>
          </form>
        </div>

        <ul className="grid grid-cols-2 gap-3 py-2 sm:gap-6">
          {fontProviders.map(provider => (
            <li key={provider.name} className="min-w-0">
              <a
                href={provider.licenseUrl}
                target="_blank"
                rel="noreferrer"
                aria-label={`${provider.name} 글꼴 라이선스 전문 (새 탭)`}
                aria-describedby={`${dialogId}-${provider.name}-license`}
                className={`${styles.logoLink} group flex flex-col items-center gap-3 rounded-xl p-2 text-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-black`}
              >
                <span
                  className={`${styles.logoFrame} flex aspect-square w-full max-w-28 items-center justify-center rounded-2xl border border-neutral-200 bg-white`}
                >
                  <Image
                    src={provider.logo}
                    alt=""
                    unoptimized
                    className={`h-auto max-w-none shrink-0 ${provider.logoClassName}`}
                  />
                </span>
                <span className="flex items-center justify-center gap-1 text-sm font-semibold">
                  {provider.name}
                  <ArrowUpRight size={13} aria-hidden="true" />
                </span>
                <span
                  id={`${dialogId}-${provider.name}-license`}
                  className="min-h-8 text-[11px] leading-4 text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100"
                >
                  <span className="block">© {provider.copyright}</span>
                  SIL Open Font License 1.1
                </span>
              </a>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
