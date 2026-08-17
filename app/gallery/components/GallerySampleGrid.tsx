'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import PhonePreviewFrame from '@/app/dashboard/components/preview/PhonePreviewFrame';
import {
  parseGuestPayload,
  type NormalizedGuestPayload,
} from '@/app/guest/[id]/validation/parseGuestPayload';
import DrivePermissionRequiredModal from '@/features/session/components/DrivePermissionRequiredModal';
import LoginModal from '@/features/session/components/LoginModal';
import PrivacyNoticeModal from '@/features/session/components/PrivacyNoticeModal';
import { useAuthGate } from '@/features/session/hooks/useAuthGate';

const CARD_WIDTH = 240;
const CARD_HEIGHT = 520;
const MAX_GRID_COLUMNS = 7;
const GRID_COLUMN_GAP = 26;
const GRID_ROW_GAP = 40;
const CARD_PADDING_X = 20;
const CARD_PADDING_Y = 32;
const ACTION_BUTTON_SHADOW =
  '0 8px 24px 0 rgb(0 0 0 / 6%), 0 2px 10px 0 rgb(0 0 0 / 8%)';
const SAMPLES_MANIFEST_URL = '/samples/manifest.json';

const gridWidth =
  CARD_WIDTH * MAX_GRID_COLUMNS + GRID_COLUMN_GAP * (MAX_GRID_COLUMNS - 1);

type GallerySample = {
  id: string;
  title: string;
  category: string;
  thumbnailUrl: string;
  dataUrl: string;
};

type SamplesManifest = {
  samples: GallerySample[];
};

type PreviewState =
  | {
      status: 'closed';
      payload: null;
      title: '';
    }
  | {
      status: 'loading' | 'error';
      payload: null;
      title: string;
    }
  | {
      status: 'success';
      payload: NormalizedGuestPayload;
      title: string;
    };

function GallerySampleGrid({
  initialIsLoggedIn,
  pagePaddingX,
}: {
  initialIsLoggedIn: boolean;
  pagePaddingX: number;
}) {
  const router = useRouter();
  const [samples, setSamples] = useState<GallerySample[]>([]);
  const [selectedSampleId, setSelectedSampleId] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewState>({
    status: 'closed',
    payload: null,
    title: '',
  });
  const {
    isBusy,
    isLoginOpen,
    isLoginPending,
    isPrivacyNoticeOpen,
    isDrivePermissionRequiredOpen,
    closeLogin,
    closePrivacyNotice,
    closeDrivePermissionRequired,
    loginWithGoogle,
    retryDrivePermission,
    runAfterAuth,
  } = useAuthGate({ initialIsLoggedIn });

  useEffect(() => {
    let cancelled = false;

    async function loadSamples() {
      const response = await fetch(SAMPLES_MANIFEST_URL);
      if (!response.ok) return;

      const manifest = (await response.json()) as SamplesManifest;
      if (!cancelled) {
        setSamples(manifest.samples);
      }
    }

    void loadSamples();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!selectedSampleId) return;

    const clearSelectionOnOutsideClick = (event: PointerEvent) => {
      if (!(event.target instanceof Element)) return;
      if (event.target.closest('[data-gallery-sample-card]')) return;

      setSelectedSampleId(null);
    };

    document.addEventListener('pointerdown', clearSelectionOnOutsideClick);

    return () => {
      document.removeEventListener('pointerdown', clearSelectionOnOutsideClick);
    };
  }, [selectedSampleId]);

  const selectCard = (sampleId: string, element: HTMLElement) => {
    setSelectedSampleId(sampleId);
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'center',
      inline: 'nearest',
    });
  };

  const openPreview = async (sample: GallerySample) => {
    setPreview({ status: 'loading', payload: null, title: sample.title });

    try {
      const response = await fetch(sample.dataUrl);
      if (!response.ok) {
        throw new Error(`sample_load_failed:${response.status}`);
      }

      const result = parseGuestPayload(await response.json());
      if (!result.ok) {
        throw new Error(`sample_parse_failed:${result.reason}`);
      }

      setPreview({
        status: 'success',
        payload: result.payload,
        title: sample.title,
      });
    } catch (error) {
      console.error('샘플 미리보기 로드 실패:', error);
      setPreview({ status: 'error', payload: null, title: sample.title });
    }
  };

  const openEditorWithSample = (sample: GallerySample) => {
    runAfterAuth(() => {
      router.push(`/editor?sample=${encodeURIComponent(sample.id)}`);
    });
  };

  return (
    <>
      <section
        className="mt-10 grid justify-start"
        style={{
          width: `min(${gridWidth}px, calc(100vw - ${pagePaddingX * 2}px))`,
          gridTemplateColumns: `repeat(auto-fit, ${CARD_WIDTH}px)`,
          columnGap: GRID_COLUMN_GAP,
          rowGap: GRID_ROW_GAP,
        }}
      >
        {samples.map(sample => (
          <article
            key={sample.id}
            data-gallery-sample-card
            role="button"
            tabIndex={0}
            aria-pressed={selectedSampleId === sample.id}
            className="relative cursor-pointer overflow-hidden rounded-2xl bg-white/72 shadow-edit backdrop-blur-sm outline-none focus-visible:ring-2 focus-visible:ring-black/50"
            style={{
              width: CARD_WIDTH,
              height: CARD_HEIGHT,
            }}
            onClick={event => selectCard(sample.id, event.currentTarget)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                selectCard(sample.id, event.currentTarget);
              }
            }}
          >
            <div className="relative h-full bg-[#F5F1EA]">
              <Image
                src={sample.thumbnailUrl}
                alt={sample.title}
                fill
                sizes="240px"
                className="object-cover"
              />
            </div>

            {selectedSampleId === sample.id && (
              <div
                className="absolute inset-0 flex flex-col justify-end bg-black/16"
                style={{
                  padding: `${CARD_PADDING_Y}px ${CARD_PADDING_X}px`,
                }}
              >
                <div className="flex flex-col gap-2">
                  <GalleryCardActionButton
                    variant="dark"
                    onClick={() => openPreview(sample)}
                  >
                    디자인 미리보기
                  </GalleryCardActionButton>
                  <GalleryCardActionButton
                    disabled={isBusy}
                    variant="light"
                    onClick={() => openEditorWithSample(sample)}
                  >
                    이 디자인으로 만들기
                  </GalleryCardActionButton>
                </div>
              </div>
            )}
          </article>
        ))}
      </section>

      {preview.status !== 'closed' && (
        <GalleryPreviewModal
          preview={preview}
          onClose={() =>
            setPreview({ status: 'closed', payload: null, title: '' })
          }
        />
      )}
      <LoginModal
        open={isLoginOpen}
        isLoading={isLoginPending}
        onClose={closeLogin}
        onGoogleLogin={loginWithGoogle}
      />
      <PrivacyNoticeModal
        open={isPrivacyNoticeOpen}
        onClose={closePrivacyNotice}
      />
      <DrivePermissionRequiredModal
        open={isDrivePermissionRequiredOpen}
        isLoading={isLoginPending}
        onClose={closeDrivePermissionRequired}
        onRetry={retryDrivePermission}
      />
    </>
  );
}

function GalleryCardActionButton({
  children,
  disabled = false,
  onClick,
  variant,
}: {
  children: string;
  disabled?: boolean;
  onClick?: () => void;
  variant: 'dark' | 'light';
}) {
  const isDark = variant === 'dark';

  return (
    <button
      type="button"
      disabled={disabled}
      className={`grid h-11 cursor-pointer grid-cols-[28px_1fr_28px] items-center rounded-lg px-2 py-2 text-[14px] font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${
        isDark
          ? 'bg-[#121212] text-white hover:bg-[#202020]'
          : 'bg-white text-[#121212] hover:bg-[#FAFAFB]'
      }`}
      style={{ boxShadow: ACTION_BUTTON_SHADOW }}
      onClick={event => {
        event.stopPropagation();
        if (disabled) return;
        onClick?.();
      }}
    >
      <span
        aria-hidden="true"
        className="flex size-5 items-center justify-center rounded-full border border-current"
      >
        <span className="size-1.5 rounded-full bg-current" />
      </span>
      <span>{children}</span>
      <span aria-hidden="true" />
    </button>
  );
}

function GalleryPreviewModal({
  onClose,
  preview,
}: {
  onClose: () => void;
  preview: Exclude<PreviewState, { status: 'closed' }>;
}) {
  const isSuccess = preview.status === 'success';

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/58 px-6 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={`${preview.title} 디자인 미리보기`}
      onClick={onClose}
    >
      <div onClick={event => event.stopPropagation()}>
        <PhonePreviewFrame
          folderId=""
          isPosterReady={isSuccess}
          payload={isSuccess ? preview.payload : null}
        >
          <div className="flex min-h-full flex-col items-center justify-center px-8 text-center">
            {preview.status === 'loading' ? (
              <>
                <div className="h-9 w-9 animate-spin rounded-full border-2 border-black/10 border-t-border-plain" />
                <p className="mt-5 font-pretendard text-[15px] font-semibold leading-[22px] text-text-plain">
                  샘플을 불러오고 있어요.
                </p>
              </>
            ) : (
              <p className="font-pretendard text-[15px] font-semibold leading-[22px] text-text-plain">
                샘플 미리보기를 불러오지 못했습니다.
              </p>
            )}
          </div>
        </PhonePreviewFrame>
      </div>
    </div>
  );
}

export default GallerySampleGrid;
