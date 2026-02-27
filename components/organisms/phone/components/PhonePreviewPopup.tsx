'use client';

import { useState } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import Message from '@/shared/assets/icons/message.svg';
import PhoneIcon from '@/shared/assets/icons/phoneIcon.svg';

type PhoneContact = {
  label: string;
  number: string;
};

interface Props {
  contacts?: PhoneContact[];
}

function PhonePreviewPopup({ contacts = [] }: Props) {
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const visibleContacts = contacts.filter(
    contact =>
      contact.label.trim().length > 0 || contact.number.trim().length > 0
  );

  return (
    <>
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
            className="w-full max-w-93.75 rounded-lg bg-white px-4 pb-4 shadow-edit"
            onClick={event => event.stopPropagation()}
          >
            <NavigationBar
              action={
                <UtilityButton
                  size="md"
                  variant="danger"
                  onClick={() => setIsPopupOpen(false)}
                  aria-label="닫기"
                  className="text-sm"
                >
                  닫기
                </UtilityButton>
              }
              direction="right"
            >
              연락처
            </NavigationBar>

            <ul className="max-h-120 overflow-y-auto space-y-2 pr-1">
              {visibleContacts.length === 0 && (
                <li className="px-2 py-3 text-sm text-text-secondary text-center">
                  표시할 연락처가 없습니다.
                </li>
              )}

              {visibleContacts.map((contact, index) => (
                <li
                  key={`${contact.label}-${contact.number}-${index}`}
                  className="flex items-center justify-between gap-3 px-3 py-2 rounded-lg hover:bg-black/5 transition-colors"
                >
                  <p className="text-sm font-semibold text-text-primary">
                    {contact.label || `연락처 ${index + 1}`}
                  </p>

                  <div className="flex items-center gap-2">
                    <a
                      href={`tel:${contact.number}`}
                      aria-label="전화 걸기"
                      className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
                    >
                      <PhoneIcon className="w-7 h-7 text-text-secondary" />
                    </a>

                    <a
                      href={`sms:${contact.number}`}
                      aria-label="문자 보내기"
                      className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-black/5 active:bg-black/10 transition-colors"
                    >
                      <Message className="w-5 h-5 text-text-secondary" />
                    </a>
                  </div>
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
