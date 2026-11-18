import { ArrowLeft, Check, X } from 'lucide-react';
import { useState } from 'react';

import {
  DEFAULT_MEAL_MENU_STYLE,
  MEAL_MENU_STYLES,
  type MealMenuStyle,
} from '@/components/organisms/mealMenu/mealMenuContent';
import { MealMenuPreview } from '@/components/organisms/mealMenu/MealMenuPreview';
import { cn } from '@/shared/utils/cn';
import { createDefaultProps } from '@/shared/utils/createDefaultProps';

interface Props {
  onBack: () => void;
  onClose: () => void;
  onAdd: (style: MealMenuStyle) => void;
}

export default function MealMenuTemplatePicker({
  onBack,
  onClose,
  onAdd,
}: Props) {
  const [selectedStyle, setSelectedStyle] = useState<MealMenuStyle>(
    DEFAULT_MEAL_MENU_STYLE
  );
  const [sample] = useState(() => createDefaultProps('mealMenu'));

  return (
    <>
      <header className="flex shrink-0 items-start justify-between gap-4 px-6 pt-6 sm:px-7">
        <div>
          <button
            type="button"
            autoFocus
            onClick={onBack}
            className="mb-3 inline-flex items-center gap-1.5 rounded-md px-1 py-1 text-sm text-neutral-600 hover:text-neutral-950"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            블록 추가로 돌아가기
          </button>
          <h2 className="text-2xl font-semibold tracking-tight text-neutral-950">
            식사 메뉴 디자인
          </h2>
          <p className="mt-1 text-sm text-neutral-600">
            메뉴판을 고른 뒤 요리와 서빙 순서를 편집하세요.
          </p>
        </div>
        <button
          type="button"
          aria-label="식사 메뉴 디자인 닫기"
          onClick={onClose}
          className="grid size-9 shrink-0 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
        >
          <X size={18} aria-hidden="true" />
        </button>
      </header>
      <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto px-6 py-3 sm:px-7 lg:grid-cols-4">
        {MEAL_MENU_STYLES.map(style => {
          const selected = style.id === selectedStyle;
          return (
            <div
              key={style.id}
              className={cn(
                'relative flex min-w-0 flex-col gap-3 rounded-xl border bg-white p-2.5 transition-colors',
                selected
                  ? 'border-neutral-900 ring-1 ring-neutral-900'
                  : 'border-neutral-200 hover:border-neutral-500'
              )}
            >
              <div className="min-w-0 flex-1" aria-hidden="true">
                <MealMenuPreview
                  compact
                  blockInfo={{
                    id: style.id,
                    component: 'mealMenu',
                    type: 'etc',
                    props: { ...sample, menuStyle: style.id },
                  }}
                />
              </div>
              <div className="px-1 pb-1">
                <p className="text-sm font-semibold text-neutral-900">
                  {style.name}
                </p>
                <p className="mt-1 min-h-10 break-keep text-xs leading-relaxed text-neutral-600">
                  {style.description}
                </p>
              </div>
              {selected && (
                <span
                  aria-hidden="true"
                  className="absolute right-1.5 top-1.5 grid size-6 place-items-center rounded-full bg-neutral-900 text-white"
                >
                  <Check size={14} strokeWidth={2.5} />
                </span>
              )}
              <button
                type="button"
                aria-label={`${style.name} 선택`}
                aria-pressed={selected}
                className="absolute inset-0 rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                onClick={() => setSelectedStyle(style.id)}
              />
            </div>
          );
        })}
      </div>
      <footer className="flex shrink-0 justify-end border-t border-neutral-200 px-6 py-4 sm:px-7">
        <button
          type="button"
          onClick={() => onAdd(selectedStyle)}
          className="rounded-lg bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-neutral-700"
        >
          식사 메뉴 추가
        </button>
      </footer>
    </>
  );
}
