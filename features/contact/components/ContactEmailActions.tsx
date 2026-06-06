'use client';

import { ArrowUpRight, Copy } from 'lucide-react';

import { useToast } from '@/shared/hooks/useToast';

export const CONTACT_EMAIL = 'teambread.official@gmail.com';

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
    throw new Error('Failed to copy contact email');
  }
};

function ContactEmailActions() {
  const { success: successToast, error: errorToast } = useToast();

  const handleCopyEmail = async () => {
    try {
      await copyTextToClipboard(CONTACT_EMAIL);
      successToast('문의 이메일 주소가 복사되었습니다.');
    } catch {
      errorToast('이메일 주소 복사에 실패했습니다.');
    }
  };

  return (
    <div className="flex flex-col items-start gap-4 lg:items-end">
      <p className="text-sm text-white/65">{CONTACT_EMAIL}</p>
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={handleCopyEmail}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-white px-4 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-white/85"
        >
          이메일 주소 복사
          <Copy className="h-4 w-4" />
        </button>
        <a
          href={`mailto:${CONTACT_EMAIL}`}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-white/35 px-4 py-2.5 text-sm font-semibold transition-colors hover:border-white"
        >
          메일 앱 열기
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>
    </div>
  );
}

export default ContactEmailActions;
