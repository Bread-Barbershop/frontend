'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

import CopyIcon from '@/shared/assets/icons/copy.svg';
import PhoneActionIcon from '@/shared/assets/icons/phone.svg';
import PhoneIcon from '@/shared/assets/icons/phoneIcon.svg';
import { formatPhoneNumber } from '@/shared/utils/phoneNumber';

import { PhoneGroup } from '../utils/phone.types';

interface Props {
  groups?: PhoneGroup[];
}

const copyTextToClipboard = async (text: string) => {
  if (navigator.clipboard?.writeText && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.top = '-9999px';
  textarea.style.left = '-9999px';

  document.body.appendChild(textarea);
  textarea.select();
  textarea.setSelectionRange(0, textarea.value.length);

  const isCopied = document.execCommand('copy');
  document.body.removeChild(textarea);

  if (!isCopied) {
    throw new Error('Failed to copy phone number');
  }
};

function PhonePreviewPopup({ groups = [] }: Props) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [showCopyToast, setShowCopyToast] = useState(false);
  const [isCopyToastVisible, setIsCopyToastVisible] = useState(false);
  const [copyToastKey, setCopyToastKey] = useState(0);
  const visibleGroups = groups
    .map(group => ({
      ...group,
      contacts: group.contacts.filter(
        contact =>
          contact.label.trim().length > 0 || contact.number.trim().length > 0
      ),
    }))
    .filter(
      group => group.name.trim().length > 0 || group.contacts.length > 0
    );

  useEffect(() => {
    if (copyToastKey === 0) return;

    const fadeTimer = window.setTimeout(() => {
      setIsCopyToastVisible(false);
    }, 1500);
    const unmountTimer = window.setTimeout(() => {
      setShowCopyToast(false);
    }, 2000);

    return () => {
      window.clearTimeout(fadeTimer);
      window.clearTimeout(unmountTimer);
    };
  }, [copyToastKey]);

  const handleCopyPhoneNumber = async (number: string) => {
    try {
      await copyTextToClipboard(number);
      setShowCopyToast(true);
      setIsCopyToastVisible(true);
      setCopyToastKey(prev => prev + 1);
    } catch (error) {
      console.error('copy failed:', error);
    }
  };

  const copyToast =
    showCopyToast && typeof document !== 'undefined'
      ? createPortal(
          <div
            className={`fixed left-1/2 top-[calc(env(safe-area-inset-top)+16px)] z-[9999] -translate-x-1/2 transition-opacity duration-500 ${
              isCopyToastVisible ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <div className="w-fit whitespace-nowrap rounded-xl bg-white p-5 text-center text-sm font-semibold text-text-primary shadow-[0_8px_24px_-8px_rgba(0,0,0,0.18),0_24px_60px_-20px_rgba(0,0,0,0.12)]">
              복사가 완료되었어요!
            </div>
          </div>,
          document.body
        )
      : null;

  return (
    <>
      {copyToast}
      <button
        type="button"
        className="flex justify-center items-center py-2 px-10 rounded-lg border border-[#e5e5e8] hover:bg-gray-50 hover:border-gray-300 cursor-pointer"
        onClick={() => setIsPopupOpen(true)}
      >
        <PhoneIcon className="size-5.5 text-text-secondary" />
        <p className="text-sm font-bold text-text-secondary">연락처</p>
      </button>

      {isPopupOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center"
          onClick={() => setIsPopupOpen(false)}
        >
          <section
            aria-label="연락처"
            role="dialog"
            aria-modal="true"
            className="w-[280px] rounded-lg bg-white pb-[14px] shadow-edit"
            onClick={event => event.stopPropagation()}
          >
            <ul className="max-h-120 overflow-y-auto flex flex-col gap-1.5 pr-1">
              {visibleGroups.length === 0 && (
                <li className="h-11 flex items-center justify-center px-2 text-sm text-text-secondary text-center">
                  표시할 연락처가 없습니다.
                </li>
              )}

              {visibleGroups.map((group, groupIndex) => (
                <li key={group.id} className="flex flex-col gap-1.5">
                  {(group.name || visibleGroups.length > 1) && (
                    <p className="h-11 flex items-center justify-center px-3 text-sm font-bold text-text-secondary text-center">
                      {group.name || `${groupIndex + 1}번 그룹`}
                    </p>
                  )}

                  <ul className="flex flex-col gap-1.5">
                    {group.contacts.length === 0 && (
                      <li className="h-11 flex items-center justify-center px-3 text-sm text-text-secondary text-center">
                        표시할 연락처가 없습니다.
                      </li>
                    )}

                    {group.contacts.map((contact, contactIndex) => (
                      <li
                        key={contact.id}
                        className="h-11 flex items-center justify-between gap-3 pl-5 pr-[7px]"
                      >
                        <div className="min-w-0 flex flex-col justify-center gap-1.5 text-left">
                          <p className="truncate text-[13px] font-semibold leading-[13px] text-[#444444]">
                            {contact.label || `연락처 ${contactIndex + 1}`}
                          </p>
                          <p className="truncate text-[13px] font-semibold leading-[13px] text-[#444444]">
                            {formatPhoneNumber(contact.number)}
                          </p>
                        </div>

                        <div className="flex shrink-0 items-center">
                          <button
                            type="button"
                            aria-label="전화번호 복사"
                            className="flex items-center justify-center size-11 rounded-full text-[#787878] hover:bg-black/5 active:bg-black/10 transition-colors"
                            onClick={() => handleCopyPhoneNumber(contact.number)}
                          >
                            <CopyIcon />
                          </button>
                          <a
                            href={`tel:${contact.number}`}
                            aria-label="전화 걸기"
                            className="flex items-center justify-center size-11 rounded-full text-[#787878] hover:bg-black/5 active:bg-black/10 transition-colors"
                          >
                            <PhoneActionIcon />
                          </a>
                        </div>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </>
  );
}

export default PhonePreviewPopup;
