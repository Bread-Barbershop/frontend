'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useRef, useState } from 'react';

import { ScreenTransitionLoader } from '@/components/molecules/screen-transition-loader';
import { DEFAULT_SCROLL_ANIMATION } from '@/components/molecules/scroll-fade-in/animationConfig';
import DrivePermissionRequiredModal from '@/features/session/components/DrivePermissionRequiredModal';
import LoginModal from '@/features/session/components/LoginModal';
import PrivacyNoticeModal from '@/features/session/components/PrivacyNoticeModal';
import { useAuthGate } from '@/features/session/hooks/useAuthGate';
import { DEFAULT_BACKGROUND_TEXTURE } from '@/shared/data/backgroundTextures';
import { createInvitationTemplate } from '@/shared/data/invitationTemplates';
import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';
import type { PersistedEditorBlock } from '@/shared/types/block';
import { createDefaultShareUrlState } from '@/shared/utils/shareUrlDefaults';
import InvitationTemplatePoster from '@/widgets/editor/preview/components/InvitationTemplatePoster';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import MainContentsArea from './MainContentsArea';

import type { SavedData } from '../[id]/types/savedata';

export async function prepareTemplateEditorData(
  templateId: string
): Promise<SavedData> {
  const prepared = await createInvitationTemplate(templateId);
  return {
    blocks: prepared.blocks as PersistedEditorBlock[],
    bulkData: {
      backgroundColor: prepared.backgroundColor,
      backgroundTexture: DEFAULT_BACKGROUND_TEXTURE,
      sectionStyle: prepared.sectionStyle,
      titleData: prepared.titleData,
      bodyData: prepared.bodyData,
      isZoom: false,
      scrollAnimation: DEFAULT_SCROLL_ANIMATION,
    },
    mainPoster: JSON.stringify(prepared.posterJson),
    bgm: { bgmInfo: null, bgmFile: null },
    shareUrl: createDefaultShareUrlState(),
    imageFolderId: '',
    audioFolderId: '',
    invitationImage: [],
  };
}

export default function TemplateEditorEntry({
  templateId,
  initialIsLoggedIn,
}: {
  templateId: string;
  initialIsLoggedIn: boolean;
}) {
  const template = INVITATION_TEMPLATES.find(item => item.id === templateId);
  const router = useRouter();
  const auth = useAuthGate({ initialIsLoggedIn, stayOnSessionExpiry: true });
  const [readyTemplateId, setReadyTemplateId] = useState<string | null>(null);
  const [isInitialAuthPending, setIsInitialAuthPending] =
    useState(initialIsLoggedIn);
  const [preparedData, setPreparedData] = useState<{
    templateId: string;
    data: SavedData;
  } | null>(null);
  const [templateLoadError, setTemplateLoadError] = useState<{
    templateId: string;
    attempt: number;
  } | null>(null);
  const [loadAttempt, setLoadAttempt] = useState(0);
  const startedTemplateIdRef = useRef<string | null>(null);
  const savedData =
    preparedData?.templateId === templateId ? preparedData.data : null;
  const beginEditing = useCallback(() => {
    setReadyTemplateId(templateId);
    // Refresh server session props (including the header) while retaining this draft.
    router.refresh();
  }, [router, templateId]);

  useEffect(() => {
    let isCurrent = true;

    if (!template) return;

    void prepareTemplateEditorData(templateId).then(
      data => {
        if (isCurrent) setPreparedData({ templateId, data });
      },
      () => {
        if (isCurrent)
          setTemplateLoadError({ templateId, attempt: loadAttempt });
      }
    );

    return () => {
      isCurrent = false;
    };
  }, [loadAttempt, template, templateId]);

  useEffect(() => {
    if (!template || !savedData || startedTemplateIdRef.current === templateId)
      return;
    startedTemplateIdRef.current = templateId;
    const authRun = auth.runAfterAuth(beginEditing);
    if (authRun) {
      void authRun.finally(() => setIsInitialAuthPending(false));
    }
  }, [auth, beginEditing, savedData, template, templateId]);

  if (!template)
    return (
      <div className="m-auto rounded-3xl bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">이 템플릿을 찾을 수 없어요.</h1>
        <Link href="/" className="mt-5 inline-block underline">
          홈에서 다른 디자인 고르기
        </Link>
      </div>
    );

  if (
    templateLoadError?.templateId === templateId &&
    templateLoadError.attempt === loadAttempt
  )
    return (
      <section className="m-auto rounded-3xl bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">템플릿을 불러오지 못했어요.</h1>
        <p className="mt-3 text-sm text-text-secondary">
          잠시 후 다시 시도해 주세요.
        </p>
        <button
          type="button"
          onClick={() => setLoadAttempt(attempt => attempt + 1)}
          className="mt-6 rounded-full bg-bg-plain px-6 py-3 text-sm font-semibold text-white"
        >
          다시 불러오기
        </button>
      </section>
    );

  if (readyTemplateId === templateId && savedData)
    return (
      <FabricProvider initialData={savedData.mainPoster}>
        <div className="flex h-full w-full flex-col justify-center overflow-x-auto overflow-y-hidden bg-[#E7E9EB]">
          <MainContentsArea savedData={savedData} />
        </div>
      </FabricProvider>
    );

  const showTransitionLoader =
    !savedData || auth.isBusy || isInitialAuthPending;

  return (
    <>
      {showTransitionLoader ? (
        <ScreenTransitionLoader label="초대장을 준비하는 중" />
      ) : (
        <section
          className="m-auto flex items-center gap-10 rounded-3xl bg-white p-8 shadow-edit"
          aria-label="선택한 템플릿으로 제작하기"
        >
          <div className="h-[360px] w-[166px] overflow-hidden rounded-lg shadow-lg">
            <InvitationTemplatePoster template={template} sizes="166px" />
          </div>
          <div className="max-w-80">
            <p className="text-xs text-text-secondary">선택한 템플릿</p>
            <h1 className="mt-3 text-3xl font-semibold text-text-plain">
              {template.name}
            </h1>
            <p className="mt-4 text-sm leading-6 text-text-secondary">
              로그인하면 이 디자인으로 바로 시작해요.
              <br />
              사진과 문구를 바꾸면 같은 디자인으로 완성할 수 있어요.
            </p>
            <button
              type="button"
              disabled={auth.isBusy || auth.isLoginPending}
              onClick={() => auth.runAfterAuth(beginEditing)}
              className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-bg-plain px-6 font-semibold text-white hover:bg-[#202020] disabled:opacity-50"
            >
              로그인하고 시작하기
            </button>
            <Link
              href="/"
              className="mt-4 inline-block text-xs text-text-secondary underline underline-offset-4"
            >
              다른 디자인 살펴보기
            </Link>
          </div>
        </section>
      )}
      <LoginModal
        open={auth.isLoginOpen}
        isLoading={auth.isLoginPending}
        onClose={auth.closeLogin}
        onGoogleLogin={auth.loginWithGoogle}
      />
      <PrivacyNoticeModal
        open={auth.isPrivacyNoticeOpen}
        onClose={auth.closePrivacyNotice}
      />
      <DrivePermissionRequiredModal
        open={auth.isDrivePermissionRequiredOpen}
        isLoading={auth.isLoginPending}
        onClose={auth.closeDrivePermissionRequired}
        onRetry={auth.retryDrivePermission}
      />
    </>
  );
}
