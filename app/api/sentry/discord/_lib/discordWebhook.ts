import 'server-only';

type SentryIssue = {
  id?: string | number;
  title?: string;
  culprit?: string;
  level?: string;
  permalink?: string;
  web_url?: string;
  shortId?: string;
  project?: {
    slug?: string;
    name?: string;
  };
  metadata?: {
    type?: string;
    value?: string;
  };
};

type SentryEvent = {
  event_id?: string;
  message?: string;
  title?: string;
  platform?: string;
  level?: string;
  web_url?: string;
  url?: string;
  tags?: Array<{
    key?: string;
    value?: string;
  }>;
  release?: string;
  environment?: string;
};

export type SentryWebhookPayload = {
  action?: string;
  actor?: {
    name?: string;
  };
  data?: {
    issue?: SentryIssue;
    event?: SentryEvent;
  };
  installation?: {
    uuid?: string;
  };
  project?: string;
};

type DiscordEmbedField = {
  inline?: boolean;
  name: string;
  value: string;
};

export type DiscordWebhookBody = {
  content: string;
  embeds: Array<{
    color: number;
    fields: DiscordEmbedField[];
    title: string;
    url?: string;
  }>;
};

function findTagValue(
  tags: SentryEvent['tags'] | undefined,
  key: string
) {
  return tags?.find((tag) => tag.key === key)?.value;
}

function getEnvironmentName(payload: SentryWebhookPayload) {
  return (
    payload.data?.event?.environment ||
    findTagValue(payload.data?.event?.tags, 'environment') ||
    'unknown'
  );
}

function getEnvironmentLabel(environment: string) {
  const normalized = environment.trim().toLowerCase();

  if (normalized === 'production' || normalized === 'prod') {
    return '운영';
  }

  if (
    normalized === 'preview' ||
    normalized === 'staging' ||
    normalized === 'stage' ||
    normalized === 'qa' ||
    normalized === 'test'
  ) {
    return '테스트 서버';
  }

  if (
    normalized === 'local' ||
    normalized === 'localhost' ||
    normalized === 'development' ||
    normalized === 'dev'
  ) {
    return '로컬 테스트';
  }

  return environment;
}

function getEnvironmentColor(environment: string) {
  const normalized = environment.trim().toLowerCase();

  if (normalized === 'production' || normalized === 'prod') {
    return 0xed4245;
  }

  if (
    normalized === 'preview' ||
    normalized === 'staging' ||
    normalized === 'stage' ||
    normalized === 'qa' ||
    normalized === 'test'
  ) {
    return 0xfee75c;
  }

  return 0x5865f2;
}

function getIssueTitle(payload: SentryWebhookPayload) {
  return (
    payload.data?.issue?.title ||
    payload.data?.issue?.metadata?.value ||
    payload.data?.event?.title ||
    payload.data?.event?.message ||
    'Sentry Alert'
  );
}

function getIssueUrl(payload: SentryWebhookPayload) {
  return (
    payload.data?.issue?.permalink ||
    payload.data?.issue?.web_url ||
    payload.data?.event?.web_url ||
    payload.data?.event?.url
  );
}

function getProjectName(payload: SentryWebhookPayload) {
  return (
    payload.data?.issue?.project?.slug ||
    payload.data?.issue?.project?.name ||
    payload.project ||
    'unknown'
  );
}

function getLevel(payload: SentryWebhookPayload) {
  return (
    payload.data?.issue?.level ||
    payload.data?.event?.level ||
    findTagValue(payload.data?.event?.tags, 'level') ||
    'error'
  );
}

function getRelease(payload: SentryWebhookPayload) {
  return (
    payload.data?.event?.release ||
    findTagValue(payload.data?.event?.tags, 'release') ||
    '-'
  );
}

function getCulprit(payload: SentryWebhookPayload) {
  return payload.data?.issue?.culprit || payload.data?.event?.platform || '-';
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}...`
    : value;
}

function toFields(payload: SentryWebhookPayload) {
  const environment = getEnvironmentName(payload);
  const issueUrl = getIssueUrl(payload);

  const fields: DiscordEmbedField[] = [
    {
      name: '환경',
      value: `${getEnvironmentLabel(environment)} (${environment})`,
      inline: true,
    },
    {
      name: '레벨',
      value: getLevel(payload),
      inline: true,
    },
    {
      name: '프로젝트',
      value: getProjectName(payload),
      inline: true,
    },
    {
      name: '릴리즈',
      value: truncate(getRelease(payload), 256),
      inline: false,
    },
    {
      name: '위치',
      value: truncate(getCulprit(payload), 1024),
      inline: false,
    },
  ];

  if (issueUrl) {
    fields.push({
      name: 'Sentry',
      value: issueUrl,
      inline: false,
    });
  }

  return fields;
}

export function buildDiscordWebhookBody(
  payload: SentryWebhookPayload
): DiscordWebhookBody {
  const environment = getEnvironmentName(payload);
  const environmentLabel = getEnvironmentLabel(environment);
  const issueTitle = truncate(getIssueTitle(payload), 256);
  const action = payload.action || 'received';
  const issueUrl = getIssueUrl(payload);

  return {
    content: `[${environmentLabel}] Sentry ${action}`,
    embeds: [
      {
        title: `[${environmentLabel}] ${issueTitle}`,
        url: issueUrl,
        color: getEnvironmentColor(environment),
        fields: toFields(payload),
      },
    ],
  };
}

export function isAuthorizedSentryWebhook(request: Request) {
  void request;
  return true;
}
