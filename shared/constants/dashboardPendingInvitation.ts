export const DASHBOARD_PENDING_INVITATION_KEY =
  'invia.dashboard.pendingInvitation';

export type DashboardPendingInvitation = {
  invitationFolderId: string;
  invitationUuid: string;
  dataJsonFileId: string;
  guestUrl: string;
  thumbnailFileId?: string;
  published?: boolean;
  ready?: boolean;
  createdAt: string;
};
