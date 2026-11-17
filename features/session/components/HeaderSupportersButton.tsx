'use client';

import { ArrowUpRight, X } from 'lucide-react';
import { useId, useRef } from 'react';

const fontProviders = [
  {
    name: '네이버',
    copyright: 'NAVER Corporation',
    licenseUrl: '/font/licenses/naver.txt',
  },
  {
    name: '배민',
    copyright: 'Woowa Brothers Corporation',
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

        <ul className="space-y-2">
          {fontProviders.map(provider => (
            <li key={provider.name}>
              <a
                href={provider.licenseUrl}
                target="_blank"
                rel="noreferrer"
                className="group block rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 hover:border-neutral-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <span className="flex flex-wrap items-center justify-between gap-x-3">
                  <span className="text-lg font-bold">{provider.name}</span>
                  <span className="flex items-center gap-1 text-sm font-medium text-neutral-700">
                    라이선스 전문
                    <ArrowUpRight size={14} aria-hidden="true" />
                  </span>
                </span>
                <span className="mt-1 block text-xs leading-5 text-neutral-600 opacity-0 transition-opacity group-hover:opacity-100 group-focus:opacity-100 motion-reduce:transition-none [@media(hover:none)]:opacity-100">
                  © {provider.copyright} · SIL Open Font License 1.1
                </span>
              </a>
            </li>
          ))}
        </ul>
      </dialog>
    </>
  );
}
