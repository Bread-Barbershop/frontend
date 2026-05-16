'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

import MessageIcon from '@/shared/assets/icons/message.svg';
import PhoneActionIcon from '@/shared/assets/icons/phone.svg';
import PhoneIcon from '@/shared/assets/icons/phoneIcon.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { formatPhoneNumber } from '@/shared/utils/phoneNumber';

import { PhoneGroup } from '../utils/phone.types';

interface Props {
  groups?: PhoneGroup[];
}

const getPhoneHrefNumber = (number: string) => number.replace(/[^\d+]/g, '');

function PhonePreviewPopup({ groups = [] }: Props) {
  const titleColor = useEditorStore(state => state.titleData.color);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const visibleGroups = groups
    .map(group => ({
      ...group,
      contacts: group.contacts.filter(
        contact =>
          contact.label.trim().length > 0 || contact.number.trim().length > 0
      ),
    }))
    .filter(group => group.name.trim().length > 0 || group.contacts.length > 0);
  const isEmpty = visibleGroups.length === 0;

  useEffect(() => {
    if (!isPopupOpen) return;

    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;

    dialog.showModal();

    return () => {
      if (dialog.open) {
        dialog.close();
      }
    };
  }, [isPopupOpen]);

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

      <AnimatePresence>
        {isPopupOpen && (
          <motion.dialog
            ref={dialogRef}
            aria-label="연락처"
            className="m-0 h-dvh max-h-none w-dvw max-w-none border-0 bg-black/50 p-0 backdrop:bg-transparent open:flex open:items-center open:justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            onCancel={event => {
              event.preventDefault();
              setIsPopupOpen(false);
            }}
            onClick={event => {
              if (event.target === event.currentTarget) {
                setIsPopupOpen(false);
              }
            }}
          >
            <motion.section
              className={`w-[280px] rounded-lg bg-white shadow-edit ${
                isEmpty ? '' : 'pb-[14px]'
              }`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
              onClick={event => event.stopPropagation()}
            >
              <ul
                className={`max-h-120 overflow-y-auto flex flex-col gap-1.5 pr-1 ${
                  isEmpty ? 'h-[72px] justify-center pr-0' : ''
                }`}
              >
                {isEmpty && (
                  <li className="flex items-center justify-center px-2 text-sm text-text-secondary text-center">
                    표시할 연락처가 없습니다.
                    <br />
                    연락처를 추가해주세요.
                  </li>
                )}

                {visibleGroups.map((group, groupIndex) => (
                  <li key={group.id} className="flex flex-col gap-1.5">
                    <p
                      className="h-11 flex items-center justify-center px-3 text-sm font-bold text-text-secondary text-center"
                      style={{ color: titleColor }}
                    >
                      {group.name.trim() || `그룹${groupIndex + 1}`}
                    </p>

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
                            <p className="truncate text-[13px] font-semibold leading-[13px] text-black">
                              {contact.label || `연락처 ${contactIndex + 1}`}
                            </p>
                            <p className="truncate text-[13px] font-semibold leading-[13px] text-black">
                              {formatPhoneNumber(contact.number)}
                            </p>
                          </div>

                          <div className="flex shrink-0 items-center">
                            <a
                              href={`sms:${getPhoneHrefNumber(contact.number)}`}
                              aria-label="문자 보내기"
                              className="flex items-center justify-center size-11 rounded-full text-[#787878] hover:bg-black/5 active:bg-black/10 transition-colors"
                            >
                              <MessageIcon />
                            </a>
                            <a
                              href={`tel:${getPhoneHrefNumber(contact.number)}`}
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
            </motion.section>
          </motion.dialog>
        )}
      </AnimatePresence>
    </>
  );
}

export default PhonePreviewPopup;
