export type PreparedInvitationSave = {
  workspaceFolderId: string;
  invitationFolderId: string;
  invitationUuid: string;
  dataJsonFileId: string;
  imageFolderId: string;
  audioFolderId: string;
  meta?: unknown;
};
const preparedByInvitationUuid = new Map<string, PreparedInvitationSave>();
const inFlightPrepareByKey = new Map<string, Promise<PreparedInvitationSave>>();
export function getPreparedInvitation(id?: string) {
  return id ? (preparedByInvitationUuid.get(id) ?? null) : null;
}
export function hasPreparedInvitation(id?: string) {
  return Boolean(getPreparedInvitation(id));
}
export function setPreparedInvitation(prepared: PreparedInvitationSave) {
  preparedByInvitationUuid.set(prepared.invitationUuid, prepared);
  return prepared;
}
export function invalidatePreparedInvitation(id?: string) {
  if (id) preparedByInvitationUuid.delete(id);
}
export function clearPreparedInvitations() {
  preparedByInvitationUuid.clear();
  inFlightPrepareByKey.clear();
}
export async function runPrepareOnce(params: {
  invitationUuid?: string;
  run: () => Promise<PreparedInvitationSave>;
}) {
  const key = params.invitationUuid || '__new_invitation__';
  const current = inFlightPrepareByKey.get(key);
  if (current) return current;
  const promise = params.run().then(setPreparedInvitation);
  inFlightPrepareByKey.set(key, promise);
  try {
    return await promise;
  } finally {
    inFlightPrepareByKey.delete(key);
  }
}
