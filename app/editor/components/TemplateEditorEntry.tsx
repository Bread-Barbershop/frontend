'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import DrivePermissionRequiredModal from '@/features/session/components/DrivePermissionRequiredModal';
import LoginModal from '@/features/session/components/LoginModal';
import PrivacyNoticeModal from '@/features/session/components/PrivacyNoticeModal';
import { useAuthGate } from '@/features/session/hooks/useAuthGate';
import { createInvitationTemplate } from '@/shared/data/invitationTemplates';
import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';
import type { PersistedEditorBlock } from '@/shared/types/block';
import { createDefaultShareUrlState } from '@/shared/utils/shareUrlDefaults';
import InvitationTemplatePoster from '@/widgets/editor/preview/components/InvitationTemplatePoster';
import { FabricProvider } from '@/widgets/mainPoster/context/FabricContext';

import MainContentsArea from './MainContentsArea';

import type { SavedData } from '../[id]/types/savedata';

export function prepareTemplateEditorData(templateId: string): SavedData {
  const prepared = createInvitationTemplate(templateId);
  return {
    blocks: prepared.blocks as PersistedEditorBlock[],
    bulkData: {
      backgroundColor: prepared.backgroundColor,
      titleData: prepared.titleData,
      bodyData: prepared.bodyData,
      isZoom: false,
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
  const [ready, setReady] = useState(false);
  const startedRef = useRef(false);
  const savedData = useMemo(
    () => (template ? prepareTemplateEditorData(templateId) : null),
    [template, templateId]
  );
  const beginEditing = useCallback(() => {
    setReady(true);
    // Refresh server session props (including the header) while retaining this draft.
    router.refresh();
  }, [router]);

  useEffect(() => {
    if (!template || startedRef.current) return;
    startedRef.current = true;
    auth.runAfterAuth(beginEditing);
  }, [auth, beginEditing, template]);

  if (!template || !savedData)
    return (
      <div className="m-auto rounded-3xl bg-white p-10 text-center">
        <h1 className="text-xl font-semibold">이 템플릿을 찾을 수 없어요.</h1>
        <Link href="/" className="mt-5 inline-block underline">
          홈에서 다른 디자인 고르기
        </Link>
      </div>
    );

  if (ready)
    return (
      <FabricProvider initialData={savedData.mainPoster}>
        <div className="flex h-full w-full flex-col justify-center overflow-x-auto overflow-y-hidden bg-[#E7E9EB]">
          <MainContentsArea savedData={savedData} />
        </div>
      </FabricProvider>
    );

  return (
    <>
      <section
        className="m-auto flex items-center gap-10 rounded-3xl bg-white p-8 shadow-edit"
        aria-label="선택한 템플릿으로 제작하기"
      >
        <div className="h-[360px] w-[166px] overflow-hidden rounded-lg shadow-lg">
          <InvitationTemplatePoster template={template} />
        </div>
        <div className="max-w-80">
          <p className="text-xs text-text-secondary">선택한 템플릿</p>
          <h1 className="mt-3 text-3xl font-semibold text-text-plain">
            {template.name}
          </h1>
          <p className="mt-4 text-sm leading-6 text-text-secondary">
            로그인하면 이 디자인으로 바로 시작해요.
            <br />
            사진, 이름, 일정은 편집기에서 바꿀 수 있어요.
          </p>
          <button
            type="button"
            disabled={auth.isBusy || auth.isLoginPending}
            onClick={() => auth.runAfterAuth(beginEditing)}
            className="mt-7 flex h-12 w-full items-center justify-center rounded-full bg-bg-plain px-6 font-semibold text-white hover:bg-[#202020] disabled:opacity-50"
          >
            {auth.isBusy ? '초대장 준비 중…' : '로그인하고 시작하기'}
          </button>
          <Link
            href="/"
            className="mt-4 inline-block text-xs text-text-secondary underline underline-offset-4"
          >
            다른 디자인 살펴보기
          </Link>
        </div>
      </section>
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
