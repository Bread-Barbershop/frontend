import React, { useRef, useState } from 'react';

import { useInvitationUpload } from '../hooks/useInvitationUpload';

import { SaveModal } from './SaveModal';

function UploadButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { handleUpload, isLoading, isFail } = useInvitationUpload();

  const handleClose = () => {
    if (!isLoading) {
      setIsModalOpen(false);
    }
  };

  return (
    <div ref={tabRef}>
      <button
        type="button"
        className="w-full h-11 bg-white rounded-lg shadow-edit flex-center text-sm font-semibold"
        onClick={() => {
          handleUpload();
          setIsModalOpen(true);
        }}
      >
        저장하기
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
