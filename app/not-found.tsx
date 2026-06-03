import { ArrowUpRight, Home, Search } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import HeaderPrivacyNoticeButton from '@/features/session/components/HeaderPrivacyNoticeButton';
import inviaLogo from '@/shared/assets/logo/Invia-logo.png';

const HEADER_NAV_LINK_CLASS =
  'flex items-center border-b border-transparent px-2 py-[6.5px] text-[16px] font-semibold text-[#121212] transition-colors hover:border-black hover:text-black';

const QUICK_LINKS = [
  {
    href: '/',
    label: '홈으로 돌아가기',
    description: 'Invia 메인 페이지로 이동합니다.',
    icon: Home,
  },
  {
    href: '/faq',
    label: 'FAQ 살펴보기',
    description: '자주 묻는 질문에서 답변을 찾아보세요.',
    icon: Search,
  },
] as const;

function NotFound() {
  return (
    <div className="relative grid min-h-dvh grid-rows-[auto_1fr_auto] overflow-hidden bg-[#f7f7f3] text-[#171717]">
      <div className="pointer-events-none absolute inset-0 opacity-70 [background-image:linear-gradient(to_right,rgba(23,23,23,0.045)_1px,transparent_1px),linear-gradient(to_bottom,rgba(23,23,23,0.045)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="pointer-events-none absolute -right-36 -top-36 h-[34rem] w-[34rem] rounded-full bg-white/80 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-52 -left-40 h-[36rem] w-[36rem] rounded-full bg-[#e7ebef]/80 blur-3xl" />

      <header className="relative flex h-14 items-center justify-between bg-transparent px-10">
        <div className="flex h-full items-center gap-8">
          <Link
            href="/"
            aria-label="Invia 홈으로 이동"
            className="flex h-full max-h-full cursor-pointer items-center px-6"
          >
            <Image
              src={inviaLogo}
              alt="Invia"
              width={92}
              height={18}
              className="h-[18px] w-auto"
              priority
            />
          </Link>

          <nav className="flex h-full items-center gap-6">
            <Link href="/faq" className={HEADER_NAV_LINK_CLASS}>
              FAQ
            </Link>
          </nav>
        </div>

        <HeaderPrivacyNoticeButton />
      </header>

      <main className="relative mx-auto grid w-full max-w-7xl items-center gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.72fr)] lg:gap-20 lg:px-12 lg:py-20">
        <section>
          <p className="text-xs font-bold tracking-[0.24em] text-black/45">
            PAGE NOT FOUND
          </p>
          <h1 className="mt-6 max-w-3xl text-[clamp(4rem,9vw,8.8rem)] font-semibold leading-[0.88] tracking-[-0.11em]">
            Lost,
            <br />
            not gone.
          </h1>
          <p className="mt-8 max-w-lg text-base leading-7 text-black/60 sm:text-lg sm:leading-8">
            요청하신 페이지를 찾을 수 없습니다.
            <br />
            주소가 변경되었거나 삭제된 페이지일 수 있습니다.
          </p>
        </section>

        <section className="border-t border-black lg:border-t-0">
          <div className="flex items-end justify-between border-b border-black/15 py-6">
            <span className="text-xs font-bold tracking-[0.2em] text-black/40">
              STATUS CODE
            </span>
            <span className="text-[clamp(5.5rem,18vw,11rem)] font-semibold leading-[0.72] tracking-[-0.12em]">
              404
            </span>
          </div>

          <div>
            {QUICK_LINKS.map(({ href, label, description, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="group flex cursor-pointer items-center gap-4 border-b border-black/15 py-5 transition-colors hover:border-black"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-black/15 transition-colors group-hover:bg-black group-hover:text-white">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="flex-1">
                  <span className="block text-base font-semibold tracking-[-0.02em]">
                    {label}
                  </span>
                  <span className="mt-1 block text-sm leading-6 text-black/50">
                    {description}
                  </span>
                </span>
                <ArrowUpRight className="h-5 w-5 text-black/40 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-black" />
              </Link>
            ))}
          </div>
        </section>
      </main>

      <footer className="relative flex h-10 items-center justify-between bg-transparent px-10">
        <Link href="/policy" className="text-text-secondary">
          개인정보 처리방침
        </Link>

        <div className="text-text-secondary">
          © {new Date().getFullYear()}{' '}
          <span className="font-semibold">Invia</span>. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

export default NotFound;
