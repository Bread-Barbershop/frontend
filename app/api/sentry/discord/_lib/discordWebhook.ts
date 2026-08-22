import 'server-only';

type SentryIssue = {
  culprit?: string;
  level?: string;
  metadata?: { value?: string };
  permalink?: string;
  project?: { name?: string; slug?: string };
  title?: string;
  web_url?: string;
};

type SentryEvent = {
  environment?: string;
  level?: string;
  message?: string;
  platform?: string;
  release?: string;
  tags?: Array<{ key?: string; value?: string }>;
  title?: string;
  url?: string;
  web_url?: string;
};

type SentryError = {
  culprit?: string;
  issue_url?: string;
  level?: string;
  location?: string;
  logger?: string;
  metadata?: { value?: string };
  project?: number | string;
  release?: string | null;
  request?: { url?: string };
  tags?: Array<[string, string]>;
  title?: string;
  url?: string;
  web_url?: string;
};

export type SentryWebhookPayload = {
  action?: string;
  data?: { error?: SentryError; event?: SentryEvent; issue?: SentryIssue };
  project?: string;
};

type DiscordEmbedField = { inline?: boolean; name: string; value: string };

export type DiscordWebhookBody = {
  content: string;
  embeds: Array<{
    color: number;
    description?: string;
    fields: DiscordEmbedField[];
    title: string;
    url?: string;
  }>;
};

const OPERATION_LABELS: Record<string, string> = {
  invitation_save: '초대장 저장 실패',
  drive_audio_asset_load: '오디오 파일 불러오기 실패',
  drive_dashboard_load: '초대장 목록 불러오기 실패',
  drive_editor_load_assets: '에디터 에셋 불러오기 실패',
  drive_editor_load_data: '초대장 데이터 불러오기 실패',
  drive_editor_load_list: '초대장 목록 불러오기 실패',
  drive_image_asset_load: '이미지 파일 불러오기 실패',
  drive_save_prepare: '초대장 저장 준비 실패',
  drive_share_metadata_load: '공유 정보 불러오기 실패',
  drive_share_metadata_save: '공유 정보 저장 실패',
  drive_thumbnail_load: '썸네일 불러오기 실패',
  drive_thumbnail_save: '썸네일 저장 실패',
  drive_visibility_publish: '공개 권한 설정 실패',
  drive_visibility_revoke: '공개 권한 해제 실패',
};

const STAGE_LABELS: Record<string, string> = {
  prepare: '저장 준비',
  publish_visibility: '공개 권한 설정',
  save_data_json: '초대장 데이터 저장',
  save_share_meta: '공유 정보 저장',
  save_thumbnail: '썸네일 저장',
  upload_audio: '오디오 업로드',
  upload_images: '이미지 업로드',
};
function findEventTag(tags: SentryEvent['tags'], key: string) {
  return tags?.find(tag => tag.key === key)?.value;
}

function findErrorTag(tags: SentryError['tags'], key: string) {
  return tags?.find(tag => tag[0] === key)?.[1];
}

function getErrorTag(payload: SentryWebhookPayload, key: string) {
  return findErrorTag(payload.data?.error?.tags, key);
}

function formatKnownValue(value: string, labels: Record<string, string>) {
  const label = labels[value];
  return label ? `${label}(${value})` : value;
}

function getEnvironmentName(payload: SentryWebhookPayload) {
  return (
    getErrorTag(payload, 'environment') ||
    payload.data?.event?.environment ||
    findEventTag(payload.data?.event?.tags, 'environment') ||
    'unknown'
  );
}

function getEnvironmentLabel(environment: string) {
  const normalized = environment.trim().toLowerCase();
  if (normalized === 'production' || normalized === 'prod') return '운영';
  if (['preview', 'staging', 'stage', 'qa', 'test'].includes(normalized))
    return '테스트 서버';
  if (['local', 'localhost', 'development', 'dev'].includes(normalized))
    return '로컬 테스트';
  return environment;
}

function getEnvironmentColor(environment: string) {
  const normalized = environment.trim().toLowerCase();
  if (normalized === 'production' || normalized === 'prod') return 0xed4245;
  if (['preview', 'staging', 'stage', 'qa', 'test'].includes(normalized))
    return 0xfee75c;
  return 0x5865f2;
}

function getIssueTitle(payload: SentryWebhookPayload) {
  return (
    payload.data?.error?.title ||
    payload.data?.error?.metadata?.value ||
    payload.data?.issue?.title ||
    payload.data?.issue?.metadata?.value ||
    payload.data?.event?.title ||
    payload.data?.event?.message ||
    'Sentry Alert'
  );
}

function getIssueUrl(payload: SentryWebhookPayload) {
  return (
    payload.data?.error?.web_url ||
    payload.data?.error?.issue_url ||
    payload.data?.error?.url ||
    payload.data?.issue?.permalink ||
    payload.data?.issue?.web_url ||
    payload.data?.event?.web_url ||
    payload.data?.event?.url
  );
}

function getProjectName(payload: SentryWebhookPayload) {
  return (
    String(payload.data?.error?.project || '').trim() ||
    payload.data?.issue?.project?.slug ||
    payload.data?.issue?.project?.name ||
    payload.project ||
    'unknown'
  );
}

function getLevel(payload: SentryWebhookPayload) {
  return (
    payload.data?.error?.level ||
    payload.data?.issue?.level ||
    payload.data?.event?.level ||
    getErrorTag(payload, 'level') ||
    findEventTag(payload.data?.event?.tags, 'level') ||
    'error'
  );
}

function getRelease(payload: SentryWebhookPayload) {
  return (
    payload.data?.error?.release ||
    payload.data?.event?.release ||
    getErrorTag(payload, 'release') ||
    findEventTag(payload.data?.event?.tags, 'release') ||
    '-'
  );
}

function getCulprit(payload: SentryWebhookPayload) {
  return (
    payload.data?.error?.culprit ||
    payload.data?.error?.location ||
    payload.data?.error?.request?.url ||
    payload.data?.error?.logger ||
    payload.data?.issue?.culprit ||
    payload.data?.event?.platform ||
    '-'
  );
}

function getAlertTitle(payload: SentryWebhookPayload) {
  const operation = getErrorTag(payload, 'operation');
  return operation
    ? (OPERATION_LABELS[operation] ?? operation)
    : getIssueTitle(payload);
}

function getStageLabel(payload: SentryWebhookPayload) {
  const failedStage = getErrorTag(payload, 'failed_stage');
  if (!failedStage) return undefined;
  return failedStage
    .split(',')
    .map(stage => formatKnownValue(stage.trim(), STAGE_LABELS))
    .join(', ');
}

function getFailureSummary(payload: SentryWebhookPayload) {
  const failedStage = getErrorTag(payload, 'failed_stage');
  const stage = getStageLabel(payload);
  const imageFailureCount = Number(getErrorTag(payload, 'image_failure_count'));
  const audioFailureCount = Number(getErrorTag(payload, 'audio_failure_count'));
  const dataFailureCount = Number(getErrorTag(payload, 'data_failure_count'));

  if (failedStage === 'upload_images' && imageFailureCount > 0) {
    return `${stage} 단계에서 이미지 ${imageFailureCount}개 업로드에 실패했습니다.`;
  }

  if (failedStage === 'upload_audio' && audioFailureCount > 0) {
    return `${stage} 단계에서 오디오 ${audioFailureCount}개 업로드에 실패했습니다.`;
  }

  if (failedStage === 'save_data_json' && dataFailureCount > 0) {
    return `${stage} 단계에서 초대장 데이터 ${dataFailureCount}개 저장에 실패했습니다.`;
  }

  if (stage) {
    return `${stage} 단계에서 오류가 발생했습니다.`;
  }

  return getIssueTitle(payload);
}

function truncate(value: string, maxLength: number) {
  return value.length > maxLength
    ? `${value.slice(0, maxLength - 1)}...`
    : value;
}

function toFields(payload: SentryWebhookPayload) {
  const environment = getEnvironmentName(payload);
  const issueUrl = getIssueUrl(payload);
  const stage = getStageLabel(payload);
  const fields: DiscordEmbedField[] = [
    {
      name: '환경',
      value: `${getEnvironmentLabel(environment)} (${environment})`,
      inline: true,
    },
    { name: '레벨', value: getLevel(payload), inline: true },
    { name: '프로젝트', value: getProjectName(payload), inline: true },
    {
      name: '릴리즈',
      value: truncate(getRelease(payload), 256),
      inline: false,
    },
    { name: '위치', value: truncate(getCulprit(payload), 1024), inline: false },
  ];

  fields.unshift({
    name: '\uc624\ub958',
    value: truncate(getIssueTitle(payload), 1024),
    inline: false,
  });
  if (stage) fields.unshift({ name: '단계', value: stage, inline: false });
  if (issueUrl) fields.push({ name: 'Sentry', value: issueUrl, inline: false });
  return fields;
}

export function buildDiscordWebhookBody(
  payload: SentryWebhookPayload
): DiscordWebhookBody {
  const environment = getEnvironmentName(payload);
  const environmentLabel = getEnvironmentLabel(environment);
  const alertTitle = truncate(getAlertTitle(payload), 256);
  const issueUrl = getIssueUrl(payload);

  return {
    content: `[${environmentLabel}] ${alertTitle}`,
    embeds: [
      {
        title: alertTitle,
        description: truncate(getFailureSummary(payload), 4096),
        url: issueUrl,
        color: getEnvironmentColor(environment),
        fields: toFields(payload),
      },
    ],
  };
}
