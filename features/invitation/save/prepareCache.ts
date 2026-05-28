export type PreparedInvitationSave = {
  workspaceFolderId: string;
  invitationFolderId: string;
  invitationUuid: string;
  dataJsonFileId: string;
  imageFolderId: string;
  audioFolderId: string;
  accessToken: string;
  expiresAt: number;
  meta?: unknown;
};

// 에디터 페이지가 살아 있는 동안만 유지되는 저장 준비 메타데이터 캐시다.
// 새로고침, 탭 종료, 다른 브라우저 세션으로는 이어지지 않는다.
const preparedByInvitationUuid = new Map<string, PreparedInvitationSave>();

// 같은 초대장에 대해 prepare 요청이 동시에 여러 번 나가지 않도록 진행 중인
// Promise를 공유한다. 저장 버튼 연타나 빠른 재시도 상황에서 중복 요청을 막는다.
const inFlightPrepareByKey = new Map<
  string,
  Promise<PreparedInvitationSave>
>();

// 만료 직전 토큰을 유효하다고 판단하면 upload/commit 중 401이 날 가능성이 높다.
// 그래서 실제 expiresAt보다 1분 이르게 만료된 것으로 보고 token만 갱신한다.
const TOKEN_EXPIRY_BUFFER_MS = 60_000;

// 신규 초대장은 첫 prepare가 끝나기 전까지 invitationUuid가 없을 수 있다.
// 이 임시 key로 "신규 생성 prepare"도 in-flight dedupe 대상에 포함한다.
const NEW_INVITATION_KEY = '__new_invitation__';

export function normalizeExpiresAt(expiresAt: string | number): number {
  const numeric =
    typeof expiresAt === 'string' ? Number(expiresAt) : expiresAt;

  return Number.isFinite(numeric) ? numeric : 0;
}

export function isPreparedTokenValid(
  prepared: PreparedInvitationSave,
  now = Date.now()
) {
  return prepared.expiresAt - TOKEN_EXPIRY_BUFFER_MS > now;
}

export function getPreparedInvitation(invitationUuid?: string) {
  // uuid가 없는 첫 저장은 아직 캐시를 조회할 안정적인 key가 없다.
  if (!invitationUuid) return null;
  return preparedByInvitationUuid.get(invitationUuid) ?? null;
}

export function hasPreparedInvitation(invitationUuid?: string) {
  return Boolean(getPreparedInvitation(invitationUuid));
}

export function setPreparedInvitation(prepared: PreparedInvitationSave) {
  preparedByInvitationUuid.set(prepared.invitationUuid, prepared);
  return prepared;
}

export function updatePreparedAccessToken(params: {
  invitationUuid: string;
  accessToken: string;
  expiresAt: string | number;
}) {
  const current = preparedByInvitationUuid.get(params.invitationUuid);
  if (!current) return null;

  // folder/file id는 그대로 두고 token 정보만 교체한다.
  // token 만료 때문에 Drive 구조 prepare를 다시 호출하지 않기 위한 경로다.
  const next = {
    ...current,
    accessToken: params.accessToken,
    expiresAt: normalizeExpiresAt(params.expiresAt),
  };

  preparedByInvitationUuid.set(params.invitationUuid, next);
  return next;
}

export function invalidatePreparedInvitation(invitationUuid?: string) {
  // 403/404처럼 캐시된 folder/file id가 더 이상 믿을 수 없을 때 호출한다.
  if (!invitationUuid) return;
  preparedByInvitationUuid.delete(invitationUuid);
}

export async function runPrepareOnce(params: {
  invitationUuid?: string;
  run: () => Promise<PreparedInvitationSave>;
}) {
  const key = params.invitationUuid || NEW_INVITATION_KEY;
  const current = inFlightPrepareByKey.get(key);
  if (current) return current;

  // prepare 성공 시에는 응답으로 확정된 invitationUuid를 기준으로 캐시한다.
  // 신규 생성처럼 임시 key로 시작한 요청도 이후 반복 저장에서는 uuid로 조회된다.
  const promise = params.run().then(prepared => {
    setPreparedInvitation(prepared);
    if (key !== prepared.invitationUuid) {
      inFlightPrepareByKey.delete(prepared.invitationUuid);
    }
    return prepared;
  });

  inFlightPrepareByKey.set(key, promise);

  try {
    return await promise;
  } finally {
    inFlightPrepareByKey.delete(key);
  }
}
