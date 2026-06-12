import Image from 'next/image';

import inviaLogo3d from '@/shared/assets/logo/invia-simple-logo-3d.png';

import type { ReactNode } from 'react';

type GuestAccessNoticeProps = {
  title: string;
  description: ReactNode;
};

export function GuestAccessNotice({
  title,
  description,
}: GuestAccessNoticeProps) {
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
          PRIVATE INVITATION
        </p>
        <h1 className="font-pretendard text-[24px] font-bold leading-8 tracking-[-0.02em] text-[#111827] sm:text-[26px] sm:leading-9">
          {title}
        </h1>
        <p className="mx-auto mt-4 flex max-w-[300px] flex-col font-pretendard text-[14px] font-medium leading-[140%] text-[#6B7280]">
          {description}
        </p>
        <div className="mt-4 rounded-2xl bg-[#F8FAFC] px-4 py-3 font-pretendard text-[13px] font-semibold leading-[140%] text-[#4B5563]">
          <span className="block">잠시 후 다시 열어보거나,</span>
          <span className="block">
            초대장을 보내준 분에게 공개 상태를 확인해 주세요.
          </span>
        </div>
      </section>
    </main>
  );
}
