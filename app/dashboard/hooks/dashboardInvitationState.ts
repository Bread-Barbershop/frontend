import type {
  InvitationReadiness,
  InvitationVisibilityResult,
  InviteListItem,
} from '@/app/dashboard/types';
import {
  DASHBOARD_PENDING_INVITATION_KEY,
  type DashboardPendingInvitation,
} from '@/shared/constants/dashboardPendingInvitation';

export type InvitationResultMap = Record<
  string,
  InvitationVisibilityResult | null
>;

export const READINESS_POLL_DELAYS_MS = [1000, 1500, 2500, 4000, 6000];
export const PENDING_INVITATION_POLL_DELAYS_MS = [1000, 1500, 2500, 4000, 6000];
export const PENDING_INVITATION_MAX_ATTEMPTS = 10;

export const sleep = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(new DOMException('Aborted', 'AbortError'));
      return;
    }

    const onAbort = () => {
      clearTimeout(timeoutId);
      reject(new DOMException('Aborted', 'AbortError'));
    };
    const timeoutId = setTimeout(() => {
      signal.removeEventListener('abort', onAbort);
      resolve();
    }, ms);

    signal.addEventListener('abort', onAbort, { once: true });
  });

export function isAbortError(error: unknown) {
  return error instanceof DOMException && error.name === 'AbortError';
}

export function resolveInviteGuestUrl(invite: InviteListItem) {
  return invite.guestUrl ?? null;
}

export function resolveInvitePublished(invite: InviteListItem) {
  return invite.published ?? Boolean(resolveInviteGuestUrl(invite));
}

export function resolveInviteReadiness(
  invite: InviteListItem
): InvitationReadiness {
  if (invite.readiness) return invite.readiness;
  return resolveInviteGuestUrl(invite) ? 'ready' : 'idle';
}

export function normalizeInvite(invite: InviteListItem): InviteListItem {
  const guestUrl = resolveInviteGuestUrl(invite);
  const published = resolveInvitePublished(invite);

  return {
    ...invite,
    guestUrl,
    published,
    readiness: resolveInviteReadiness(invite),
  };
}

export function normalizeInvites(invites: InviteListItem[]) {
  return invites.map(normalizeInvite);
}

function isPendingInvitationPayload(
  value: unknown
): value is DashboardPendingInvitation {
  return (
    typeof value === 'object' &&
    value !== null &&
    'invitationFolderId' in value &&
    typeof value.invitationFolderId === 'string' &&
    value.invitationFolderId.length > 0 &&
    'invitationUuid' in value &&
    typeof value.invitationUuid === 'string' &&
    value.invitationUuid.length > 0 &&
    'dataJsonFileId' in value &&
    typeof value.dataJsonFileId === 'string' &&
    value.dataJsonFileId.length > 0 &&
    'guestUrl' in value &&
    typeof value.guestUrl === 'string' &&
    value.guestUrl.length > 0 &&
    'createdAt' in value &&
    typeof value.createdAt === 'string' &&
    (!('published' in value) || typeof value.published === 'boolean') &&
    (!('ready' in value) || typeof value.ready === 'boolean')
  );
}

export function readPendingInvitationFromSession() {
  if (typeof window === 'undefined') return null;

  const raw = window.sessionStorage.getItem(DASHBOARD_PENDING_INVITATION_KEY);
  if (!raw) return null;

  window.sessionStorage.removeItem(DASHBOARD_PENDING_INVITATION_KEY);

  try {
    const parsed = JSON.parse(raw) as unknown;
    return isPendingInvitationPayload(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

function createThumbnailUrl(fileId?: string) {
  if (!fileId) return null;
  return `https://lh3.googleusercontent.com/d/${encodeURIComponent(fileId)}`;
}

function createPendingInvite(
  pending: DashboardPendingInvitation
): InviteListItem {
  return normalizeInvite({
    folderId: pending.invitationFolderId,
    name: '새 초대장',
    createdTime: pending.createdAt,
    invitationUuid: pending.invitationUuid,
    dataJsonFileId: pending.dataJsonFileId,
    guestUrl: pending.guestUrl,
    published: pending.published ?? false,
    readiness: 'pending',
    isPending: true,
    thumbnailUrl: createThumbnailUrl(pending.thumbnailFileId),
    hasKakaoShareData: false,
  });
}

export function mergePendingInvite(
  invites: InviteListItem[],
  pending: DashboardPendingInvitation,
  patch: Partial<InviteListItem> = {}
) {
  const pendingInvite = {
    ...createPendingInvite(pending),
    ...patch,
    folderId: pending.invitationFolderId,
    invitationUuid: patch.invitationUuid ?? pending.invitationUuid,
    dataJsonFileId: patch.dataJsonFileId ?? pending.dataJsonFileId,
    guestUrl: patch.guestUrl ?? pending.guestUrl,
    thumbnailUrl:
      patch.thumbnailUrl ?? createThumbnailUrl(pending.thumbnailFileId),
  };
  const normalizedPendingInvite = normalizeInvite(pendingInvite);
  const index = invites.findIndex(
    invite => invite.folderId === pending.invitationFolderId
  );

  if (index === -1) {
    return normalizeInvites([normalizedPendingInvite, ...invites]);
  }

  return normalizeInvites(
    invites.map(invite =>
      invite.folderId === pending.invitationFolderId
        ? {
            ...normalizedPendingInvite,
            ...invite,
            dataJsonFileId: invite.dataJsonFileId ?? pending.dataJsonFileId,
            guestUrl: invite.guestUrl ?? pending.guestUrl,
            thumbnailUrl:
              invite.thumbnailUrl ??
              createThumbnailUrl(pending.thumbnailFileId),
            readiness: normalizedPendingInvite.readiness,
            isPending: normalizedPendingInvite.isPending,
          }
        : invite
    )
  );
}

// 서버에서 내려온 guestUrl/meta 상태를 카드 단위 결과 맵으로 변환한다.
export function createInitialInvitationResults(
  invites: InviteListItem[]
): InvitationResultMap {
  return invites.reduce<InvitationResultMap>((acc, invite) => {
    const guestUrl = resolveInviteGuestUrl(invite);
    if (!guestUrl) return acc;

    acc[invite.folderId] = {
      ok: true,
      published: resolveInvitePublished(invite),
      ready: resolveInviteReadiness(invite) === 'ready',
      guestUrl,
    };
    return acc;
  }, {});
}

export function resolveGuestUrl(result: InvitationVisibilityResult | null) {
  if (!result?.guestUrl) return null;
  if (result.guestUrl.startsWith('http')) return result.guestUrl;
  if (typeof window === 'undefined') return result.guestUrl;
  return `${window.location.origin}${result.guestUrl}`;
}

export function resolveVisibilityReadiness(
  nextVisible: boolean,
  isReady: boolean
): InvitationReadiness {
  if (!nextVisible) return 'idle';
  return isReady ? 'ready' : 'checking';
}

export type PendingTransitionInput = {
  pending: DashboardPendingInvitation;
  loadedPendingInvite: InviteListItem;
  readinessPayload: InvitationVisibilityResult | null;
  isGuestReady: boolean;
};

export function resolvePendingTransition({
  pending,
  loadedPendingInvite,
  readinessPayload,
  isGuestReady,
}: PendingTransitionInput) {
  const pendingStartsPublic = pending.published === true;
  // pending은 Drive 목록 전파와 meta.json 전파가 끝나야 완료될 수 있다.
  // 공개로 저장된 초대장은 guest page까지 실제로 읽히는지도 함께 확인한다.
  const hasDashboardReadyMeta = Boolean(
    loadedPendingInvite.dataJsonFileId && loadedPendingInvite.guestUrl
  );
  const dataJsonFileId =
    loadedPendingInvite.dataJsonFileId ?? pending.dataJsonFileId;
  const guestUrl = loadedPendingInvite.guestUrl ?? pending.guestUrl;
  const isComplete =
    hasDashboardReadyMeta && (!pendingStartsPublic || isGuestReady);
  const patch: Partial<InviteListItem> = {
    ...loadedPendingInvite,
    dataJsonFileId,
    guestUrl,
    published: pendingStartsPublic ? true : loadedPendingInvite.published,
    readiness: isComplete
      ? pendingStartsPublic
        ? 'ready'
        : 'idle'
      : pendingStartsPublic && hasDashboardReadyMeta
        ? 'checking'
        : 'pending',
    isPending: !isComplete,
  };

  const result: InvitationVisibilityResult = {
    ok: isComplete,
    published: patch.published,
    ready: pendingStartsPublic ? isGuestReady : undefined,
    // readiness 응답은 Drive 파일 기준 URL일 수 있으므로 이미 확보한 공유 URL을 우선 보존한다.
    guestUrl: patch.guestUrl ?? pending.guestUrl ?? readinessPayload?.guestUrl,
    dataJsonFileId:
      readinessPayload?.dataJsonFileId ??
      patch.dataJsonFileId ??
      pending.dataJsonFileId,
    warning: !hasDashboardReadyMeta
      ? 'meta_not_ready'
      : pendingStartsPublic && !isGuestReady
        ? (readinessPayload?.warning ?? 'guest_not_ready')
        : undefined,
    status: readinessPayload?.status,
    details: readinessPayload?.details,
  };

  return {
    hasDashboardReadyMeta,
    isComplete,
    patch,
    result,
  };
}

// 전파 지연이 제한 횟수 안에 풀리지 않으면 카드 로딩을 끝내고 실패 상태로 고정한다.
export function createPendingTimeoutResult(
  pending: DashboardPendingInvitation
): InvitationVisibilityResult {
  return {
    ok: false,
    published: pending.published === true,
    ready: undefined,
    guestUrl: pending.guestUrl,
    dataJsonFileId: pending.dataJsonFileId,
    warning: 'pending_sync_timeout',
  };
}

// readiness polling 응답은 일부 필드만 내려올 수 있어 기존 결과의 URL/fileId를 보존한다.
export function mergeGuestReadinessResult(
  current: InvitationVisibilityResult,
  next: InvitationVisibilityResult,
  dataJsonFileId: string
): InvitationVisibilityResult {
  return {
    ...current,
    ...next,
    // polling 응답의 /guest/{id}가 기존 /i/{code} 공유 URL을 덮어쓰지 않게 한다.
    guestUrl: current.guestUrl ?? next.guestUrl,
    dataJsonFileId: next.dataJsonFileId ?? dataJsonFileId,
  };
}
