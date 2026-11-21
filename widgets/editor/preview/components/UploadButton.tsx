import React, { useRef, useState } from 'react';

import { useConfirm } from '@/shared/hooks/useConfirm';
import { useFabricViewContext } from '@/widgets/mainPoster/context/FabricContext';

import { getPosterExampleText } from './posterExampleText';
import { SaveModal } from './SaveModal';

import type { useInvitationUpload } from '../hooks/useInvitationUpload';

function UploadButton({
  upload,
}: {
  upload: ReturnType<typeof useInvitationUpload>;
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const {
    handleUpload,
    isLoading,
    isFail,
    isCleaningUp,
    pendingInvitation,
    loadingMessage,
    photoProgress,
  } = upload;
  const { confirm } = useConfirm();
  const { canvas } = useFabricViewContext();

  const handleClose = () => {
    if (!isLoading) {
      setIsModalOpen(false);
    }
  };

  return (
    <div ref={tabRef}>
      <button
        type="button"
        disabled={isLoading || isCleaningUp}
        className="w-full h-11 bg-white rounded-lg shadow-edit flex-center text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
        onClick={async () => {
          const examples = getPosterExampleText(canvas?.getObjects() ?? []);
          const shown = examples.slice(0, 3).map(text => `“${text}”`);
          if (examples.length > shown.length) {
            shown.push(`외 ${examples.length - shown.length}개`);
          }
          const isConfirm = await confirm({
            ...(examples.length
              ? {
                  message: ['표지에 예시 문구가 남아 있어요.', ...shown, '본문을 바꿔도 표지 문구는 그대로 발행돼요. 이대로 저장할까요?'].join('\n'),
                  confirmText: '그대로 저장',
                  cancelText: '돌아가기',
                }
              : {
                  message: '저장하시겠습니까?\n다소 시간이 소요될 수 있습니다.',
                }),
            variant: 'white',
            xPosition: 'center',
            yPosition: 'center',
          });
          if (!isConfirm) {
            return;
          }

          void handleUpload();
          setIsModalOpen(true);
        }}
      >
        모두 저장하기
      </button>
      {isModalOpen && (
        <SaveModal
          ref={modalRef}
          isLoading={isLoading}
          isFail={isFail}
          pendingInvitation={pendingInvitation}
          skipDashboardHandoff={Boolean(pendingInvitation?.audienceSlug)}
          loadingMessage={loadingMessage}
          photoProgress={photoProgress}
          retry={() => void handleUpload()}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

export default UploadButton;
