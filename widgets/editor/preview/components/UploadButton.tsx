import React, { useEffect, useRef, useState } from 'react';

import { useInvitationUpload } from '../hooks/useInvitationUpload';

import { SaveModal } from './SaveModal';

function UploadButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const tabRef = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const { handleUpload, isLoading, isFail } = useInvitationUpload();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        !isLoading &&
        tabRef.current &&
        !tabRef.current.contains(event.target as Node) &&
        modalRef.current &&
        !modalRef.current.contains(event.target as Node)
      ) {
        setIsModalOpen(false);
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, isLoading]);

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
        <SaveModal ref={modalRef} isLoading={isLoading} isFail={isFail} />
      )}
    </div>
  );
}

export default UploadButton;
