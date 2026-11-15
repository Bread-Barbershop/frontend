import type { InvitationTemplate } from '@/shared/data/invitationTemplates/types';
import InvitationTemplatePoster from '@/widgets/editor/preview/components/InvitationTemplatePoster';

export function PosterPanelView({
  templates,
  isApplying,
  onSelectTemplate,
}: {
  templates: InvitationTemplate[];
  isApplying: boolean;
  onSelectTemplate: (id: string) => void;
}) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-2 content-start gap-3 overflow-y-auto pb-5 scrollbar-hide">
      {templates.map(template => (
        <button
          type="button"
          key={template.id}
          aria-label={`${template.name} 표지 적용`}
          disabled={isApplying}
          onClick={() => onSelectTemplate(template.id)}
          className="group flex flex-col overflow-hidden rounded-lg border border-black/5 text-left transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-wait disabled:opacity-50"
        >
          <div className="aspect-[375/812] w-full">
            <InvitationTemplatePoster template={template} />
          </div>
          <span className="w-full truncate bg-white px-2 py-2.5 text-[11px] font-medium text-text-plain">
            {template.name}
          </span>
        </button>
      ))}
    </div>
  );
}
