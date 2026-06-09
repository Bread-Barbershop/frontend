import React, { useRef, useState } from 'react';

import { useConfirm } from '@/shared/hooks/useConfirm';

import { useInvitationUpload } from '../hooks/useInvitationUpload';

import { SaveModal } from './SaveModal';

function UploadButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { handleUpload, isLoading, isFail, isCleaningUp } = useInvitationUpload();
  const { confirm } = useConfirm();

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
          
          const isConfirm = await confirm({
            message:
              '저장하시겠습니까?\n다소 시간이 소요될 수 있습니다.',
            variant: 'white',
            xPosition : 'center',
            yPosition : 'center'
          });
          if(!isConfirm) {
            
            return;
          }
          
          handleUpload();
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
          retry={handleUpload}
          onClose={handleClose}
        />
      )}
    </div>
  );
}

export default UploadButton;
