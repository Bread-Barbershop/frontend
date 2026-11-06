import Image from 'next/image';

import inviaLogo3d from '@/shared/assets/logo/invia-simple-logo-3d.png';

export function GuestUnavailableNotice({ retryHref }: { retryHref: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#F6F7F9] px-5 py-10">
      <section className="w-full max-w-[390px] rounded-[28px] border border-black/5 bg-white px-7 py-9 text-center shadow-[0_24px_80px_-40px_rgb(17_24_39_/_45%)] sm:max-w-[430px] sm:px-9 sm:py-10">
        <Image
          src={inviaLogo3d}
          alt="Invia"
          width={82}
          height={82}
          priority
          className="mx-auto mb-2 h-[100px] w-[100px] object-contain"
        />
        <p className="mb-3 font-pretendard text-[12px] font-bold tracking-[0.2em] text-[#9AA3AF]">
          GUEST INVITATION
        </p>
        <h1 className="font-pretendard text-[24px] font-bold leading-8 tracking-[-0.02em] text-[#111827] sm:text-[26px] sm:leading-9">
          초대장을 불러오지 못했어요
        </h1>
        <p className="mx-auto mt-4 max-w-[300px] font-pretendard text-[14px] font-medium leading-[140%] text-[#6B7280]">
          일시적인 연결 문제로 초대장 데이터를 확인하지 못했습니다. 잠시 후 다시
          시도해 주세요.
        </p>
        <a
          href={retryHref}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-black px-5 font-pretendard text-[14px] font-semibold text-white transition-colors hover:bg-[#202020]"
        >
          다시 시도하기
        </a>
      </section>
    </main>
  );
}
