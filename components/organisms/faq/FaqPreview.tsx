import { MiddlePreviewWrapper } from '@/components/organisms/wrapper/MiddlePreviewWrapper';
import type { EditorBlock } from '@/shared/types/block';

import type { HTMLAttributes } from 'react';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'faq'>;
  titleClassName?: string;
  isGuestPage?: boolean;
}

export function FaqPreview({ blockInfo, titleClassName, className = '', isGuestPage = false, ...rest }: Props) {
  const { title, items } = blockInfo.props;
  const visible = (Array.isArray(items) ? items : []).filter(item =>
    item && typeof item.question === 'string' &&
    typeof item.answer === 'string' &&
    item.question.trim() && (!isGuestPage || item.answer.trim())
  );
  return (
    <MiddlePreviewWrapper className={className} titleClassName={titleClassName}
      mainTitle={title} mainTitleDefault="자주 묻는 질문" {...rest}>
      <div className="flex w-full flex-col gap-2 text-left">
        {visible.map((item, i) => (
          <details key={i} className="group rounded-lg border border-border-divider p-4">
            <summary className="cursor-pointer select-none text-sm font-medium text-text-primary">
              {item.question}
            </summary>
            <p className="mt-3 whitespace-pre-wrap break-words text-sm leading-relaxed text-text-secondary">
              {item.answer || '답변을 작성해 주세요.'}
            </p>
          </details>
        ))}
        {visible.length === 0 && !isGuestPage && (
          <p className="text-xs text-text-tertiary">질문과 답변을 작성해 주세요.</p>
        )}
      </div>
    </MiddlePreviewWrapper>
  );
}
