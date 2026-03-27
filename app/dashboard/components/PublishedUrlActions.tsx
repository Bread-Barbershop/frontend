import {
  DASHBOARD_COPY,
  PUBLISHED_URL_ACTIONS_CLASS,
} from '@/app/dashboard/dashboardConfig';

type PublishedUrlActionsProps = {
  url: string;
  onCopy: () => void;
};

function PublishedUrlActions({ url, onCopy }: PublishedUrlActionsProps) {
  return (
    <div dir="ltr" className={PUBLISHED_URL_ACTIONS_CLASS}>
      <a
        href={url}
        target="_blank"
        rel="noreferrer"
        className="min-w-0 flex-1 py-2 text-sm text-text-primary"
        title={url}
      >
        <span className="block truncate">{url}</span>
      </a>
      <button
        type="button"
        onClick={onCopy}
        className="shrink-0 cursor-pointer border-border-neutral px-1 py-2 text-sm text-[#1F72EF]"
      >
        {DASHBOARD_COPY.copyUrlLabel}
      </button>
    </div>
  );
}

export default PublishedUrlActions;
