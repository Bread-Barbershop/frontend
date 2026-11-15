'use client';

import { useState } from 'react';

import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';
import type { InvitationTemplateType } from '@/shared/data/invitationTemplates/types';
import { useInvitationTemplate } from '@/widgets/editor/preview/hooks/useInvitationTemplate';

import { PosterPanelView } from './PosterPanelView';

const CATEGORIES = [
  ['all', '전체'],
  ['wedding', '결혼식'],
  ['birthday', '생일'],
  ['seminar', '세미나'],
  ['firstBirthday', '돌잔치'],
] as const;

export const PosterPanel = () => {
  const [category, setCategory] = useState<InvitationTemplateType | 'all'>(
    'all'
  );
  const { applyTemplate, isApplying } = useInvitationTemplate();
  const templates = INVITATION_TEMPLATES.filter(
    template => category === 'all' || template.type === category
  );
  return (
    <section
      className="flex h-full min-h-0 flex-1 flex-col gap-3 px-1"
      aria-label="표지 디자인 선택"
    >
      <nav className="flex shrink-0 justify-between" aria-label="표지 카테고리">
        {CATEGORIES.map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={category === value}
            disabled={isApplying}
            className={`h-11 px-1 text-xs transition-colors disabled:opacity-50 ${category === value ? 'border-b border-black font-semibold text-text-primary' : 'text-text-secondary'}`}
            onClick={() => setCategory(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      <p className="text-[11px] text-text-secondary">
        표지만 바꿔요. 본문은 그대로 유지돼요.
      </p>
      <PosterPanelView
        templates={templates}
        isApplying={isApplying}
        onSelectTemplate={id => void applyTemplate(id, { posterOnly: true })}
      />
    </section>
  );
};
