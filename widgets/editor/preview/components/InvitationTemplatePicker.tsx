import { ArrowLeft, Check } from 'lucide-react';

import { UtilityButton } from '@/components/atoms/button';
import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import {
  getInvitationTemplates,
  type InvitationTemplate,
  type InvitationTemplateType,
} from '@/shared/data/invitationTemplates';

import InvitationTemplatePoster from './InvitationTemplatePoster';

interface Props {
  type: InvitationTemplateType;
  selectedId: string | null;
  isApplying: boolean;
  onSelect: (id: string) => void;
  onTypeChange: (type: InvitationTemplateType) => void;
  onBack: () => void;
  onClose: () => void;
  onApply: () => void;
}

const TEMPLATE_TYPES: InvitationTemplateType[] = [
  'wedding',
  'firstBirthday',
  'birthday',
  'seminar',
];

const getCategoryName = (type: InvitationTemplateType) =>
  componentCls.find(category => category.english === type)?.korea ?? '초대장';

const getPageNames = (template: InvitationTemplate) => {
  const category = componentCls.find(item => item.english === template.type);
  return template.blockTypes.map(
    type =>
      category?.list.find(item => item.component === type)?.contents ?? type
  );
};

const getFontFamilies = (template: InvitationTemplate) =>
  Array.from(
    new Set(
      template.poster.objects
        .filter(object => object.kind === 'text')
        .map(object => object.fontFamily)
    )
  );

function TemplateDetails({ template }: { template: InvitationTemplate }) {
  const colors = Object.values(template.colors);

  return (
    <div className="grid shrink-0 grid-cols-[1.5fr_0.65fr_1fr] gap-6 border-t border-neutral-200 px-6 py-3.5">
      <div className="min-w-0">
        <p className="mb-1.5 text-xs font-semibold text-neutral-700">
          포함 페이지
          <span className="ml-1 font-normal text-neutral-400">
            {template.blockTypes.length}개
          </span>
        </p>
        <div className="flex max-h-12 flex-wrap gap-1 overflow-y-auto">
          {getPageNames(template).map((name, index) => (
            <span
              key={`${name}-${index}`}
              className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600"
            >
              {name}
            </span>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-semibold text-neutral-700">
          색상 팔레트
        </p>
        <div className="flex items-center gap-2" aria-label="색상 팔레트">
          {colors.map((color, index) => (
            <span
              key={`${color}-${index}`}
              aria-label={`팔레트 색상 ${index + 1}`}
              title={`팔레트 색상 ${index + 1}`}
              className="size-6 rounded-full border border-black/10 shadow-sm"
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
      <div className="min-w-0">
        <p className="mb-1.5 text-xs font-semibold text-neutral-700">
          포스터 글꼴
        </p>
        <p className="line-clamp-2 break-keep text-xs leading-4 text-neutral-500">
          {getFontFamilies(template).join(' · ')}
        </p>
      </div>
    </div>
  );
}

function InvitationTemplatePicker({
  type,
  selectedId,
  isApplying,
  onSelect,
  onTypeChange,
  onBack,
  onClose,
  onApply,
}: Props) {
  const templates = getInvitationTemplates(type);
  const selectedTemplate = templates.find(
    template => template.id === selectedId
  );

  return (
    <div
      className="flex min-h-0 flex-1 flex-col"
      aria-label="초대장 템플릿 선택"
    >
      <header className="flex shrink-0 items-start justify-between px-7 pb-4 pt-6">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-neutral-400">
            INVITATION COLLECTION
          </p>
          <h2 className="mt-1 text-[22px] font-semibold tracking-tight text-neutral-900">
            {getCategoryName(type)} 초대장 스타일
          </h2>
          <p className="mt-1 text-sm text-neutral-500">
            포스터를 비교하고 새 초대장 구성을 골라 보세요.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="블록 추가로 돌아가기"
            autoFocus
            onClick={onBack}
            disabled={isApplying}
            className="flex h-10 items-center gap-2 rounded-full px-4 text-sm font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-50"
          >
            <ArrowLeft size={16} />
            블록 추가
          </button>
          <button
            type="button"
            aria-label="템플릿 선택 닫기"
            onClick={onClose}
            disabled={isApplying}
            className="rounded-full px-3 py-2 text-sm text-neutral-500 hover:bg-neutral-100 disabled:opacity-50"
          >
            닫기
          </button>
        </div>
      </header>

      <nav
        aria-label="초대장 종류"
        className="mx-7 grid shrink-0 grid-cols-4 rounded-full bg-neutral-100 p-1"
      >
        {TEMPLATE_TYPES.map(templateType => {
          const isActive = type === templateType;

          return (
            <button
              key={templateType}
              type="button"
              aria-pressed={isActive}
              onClick={() => onTypeChange(templateType)}
              disabled={isApplying}
              className={`h-10 rounded-full px-3 text-sm font-medium transition-colors disabled:opacity-50 ${isActive ? 'bg-white text-neutral-900 shadow-sm' : 'text-neutral-500 hover:text-neutral-800'}`}
            >
              {getCategoryName(templateType)}
            </button>
          );
        })}
      </nav>

      <div className="grid min-h-0 flex-1 grid-cols-3 gap-4 overflow-y-auto px-7 py-4">
        {templates.map(template => {
          const isSelected = template.id === selectedId;

          return (
            <button
              key={template.id}
              type="button"
              data-template-id={template.id}
              aria-pressed={isSelected}
              aria-label={`${template.name} 템플릿 선택`}
              onClick={() => onSelect(template.id)}
              disabled={isApplying}
              className={`relative flex min-w-0 flex-col items-center rounded-2xl border-2 bg-white p-3.5 text-left transition-all disabled:cursor-wait ${isSelected ? 'border-black shadow-[0_8px_24px_rgba(0,0,0,0.12)]' : 'border-neutral-200 hover:border-neutral-400 hover:shadow-md'}`}
            >
              <span
                className={`absolute right-4 top-4 z-10 flex size-7 items-center justify-center rounded-full ${isSelected ? 'bg-black text-white' : 'bg-white/95 text-transparent shadow-sm'}`}
                aria-hidden="true"
              >
                <Check size={16} strokeWidth={3} />
              </span>
              <span
                className="mb-3 flex h-[260px] w-full items-center justify-center overflow-hidden rounded-xl bg-neutral-50 p-2"
                style={{ backgroundColor: template.colors.background }}
              >
                <span className="h-full aspect-[375/812] shadow-lg">
                  <InvitationTemplatePoster template={template} />
                </span>
              </span>
              <span className="w-full truncate text-sm font-semibold text-neutral-900">
                {template.name}
              </span>
              <span className="mt-1 line-clamp-2 min-h-10 w-full text-xs leading-[18px] text-neutral-500">
                {template.description}
              </span>
              <span className="mt-2 flex w-full flex-wrap gap-1.5">
                {template.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full bg-neutral-100 px-2 py-1 text-[11px] text-neutral-600"
                  >
                    {tag}
                  </span>
                ))}
              </span>
            </button>
          );
        })}
      </div>

      {selectedTemplate && <TemplateDetails template={selectedTemplate} />}

      <footer className="flex shrink-0 items-center justify-between border-t border-neutral-200 px-7 py-4">
        <p className="max-w-[66%] text-sm leading-5 text-neutral-500">
          적용하면 현재 포스터와 페이지 구성이 선택한 템플릿으로 교체됩니다.
        </p>
        <UtilityButton
          variant="primary"
          disabled={!selectedTemplate || isApplying}
          aria-label="선택한 템플릿 적용"
          onClick={onApply}
          className="h-11 min-w-40 rounded-full bg-black px-7 text-sm font-semibold text-white hover:bg-neutral-800 disabled:bg-neutral-300"
        >
          {isApplying ? '적용 중…' : '이 템플릿 사용하기'}
        </UtilityButton>
      </footer>
    </div>
  );
}

export default InvitationTemplatePicker;
