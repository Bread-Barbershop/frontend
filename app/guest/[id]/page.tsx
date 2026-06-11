import 'server-only';

import Image from 'next/image';
import { notFound } from 'next/navigation';

import inviaLogo3d from '@/shared/assets/logo/invia-simple-logo-3d.png';
import {
  resolveShareDescription,
  resolveShareImageUrl,
  resolveShareTitle,
} from '@/shared/utils/shareUrlDefaults';

import GuestBgm from './components/GuestBgm';
import { GuestMainPoster } from './components/GuestMainPoster';
import GuestRenderer from './components/GuestRenderer';
import { isGuestPayload } from './utils/guestBlockTypeGuards';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

export const dynamic = 'force-static';
export const revalidate = false;

function publicDataJsonUrl(fileId: string) {
  return `https://drive.google.com/uc?export=download&id=${encodeURIComponent(fileId)}`;
}

function isPrivateDriveStatus(status: number) {
  return status === 401 || status === 403 || status === 404;
}

function isPrivateDriveBody(raw: string) {
  const head = raw.trimStart().slice(0, 120).toLowerCase();
  return head.startsWith('<!doctype') || head.startsWith('<html');
}

function renderPrivateInvitationNotice() {
  return (
    <GuestAccessNotice
      title="비공개 초대장이에요"
      description={
        <>
          <span>초대장 주인이 공개로 전환하면</span>
          <span>이 링크에서 다시 확인할 수 있어요.</span>
        </>
      }
    />
  );
}

function GuestAccessNotice({
  title,
  description,
}: {
  title: string;
  description: ReactNode;
}) {
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(publicDataJsonUrl(id), {
      next: { tags: [`invitation:${id}`] },
    });

    if (!res.ok) return {};

    const raw = await res.text();
    if (isPrivateDriveBody(raw)) {
      return {};
    }

    let payload: unknown;
    try {
      payload = JSON.parse(raw);
    } catch {
      return {};
    }

    if (!isGuestPayload(payload)) {
      return {};
    }

    const topLevelShare = payload.shareUrl;
    const title = resolveShareTitle(topLevelShare?.urlTitle);
    const description = resolveShareDescription(topLevelShare?.urlDescription);
    const imageUrl = resolveShareImageUrl(topLevelShare?.urlImage?.[0]);

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: imageUrl,
      },
      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: imageUrl,
      },
      icons: {
        icon: '/favicon.ico',
      },
    };
  } catch {
    return {};
  }
}

export default async function GuestPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const res = await fetch(publicDataJsonUrl(id), {
    next: { tags: [`invitation:${id}`] },
  });

  if (!res.ok) {
    if (isPrivateDriveStatus(res.status)) {
      return renderPrivateInvitationNotice();
    }

    notFound();
  }

  const raw = await res.text();
  if (isPrivateDriveBody(raw)) {
    return renderPrivateInvitationNotice();
  }

  let payload: unknown;
  try {
    payload = JSON.parse(raw);
  } catch {
    notFound();
  }
  if (!isGuestPayload(payload)) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-neutral-50">
      <div
        id="preview-container"
        className="relative mx-auto w-full min-w-[375px] max-w-[430px] bg-white shadow-sm"
        style={{
          backgroundColor: payload.bulkData.backgroundColor,
        }}
      >
        <div className="sticky top-0 z-50 h-0">
          <GuestBgm bgm={payload.bgm} />
        </div>
        <GuestMainPoster
          thumbnailFileId={payload.mainPoster.thumbnailFileId ?? ''}
        />
        <div className="mx-auto w-full">
          <GuestRenderer blocks={payload.blocks} bulkData={payload.bulkData} />
        </div>
      </div>
    </main>
  );
}
