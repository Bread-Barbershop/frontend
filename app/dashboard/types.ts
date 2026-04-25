export type InviteListItem = {
  folderId: string;
  name: string;
  createdTime?: string;
  invitationUuid?: string;
  publishedUrl?: string | null;
};

export type KakaoShareData = {
  title: string;
  description: string;
  imageFileId?: string;
  showLocationButton: boolean;
  showShareButton: boolean;
  invitationUrl?: string;
  locationInfo?: {
    lat: number;
    lng: number;
    placeName: string;
  };
};

export type LoadInvitationResponse = {
  workspaceFolderId: string | null;
  invites: InviteListItem[];
  nextPageToken: string | null;
};

export type PublishResult = {
  ok: boolean;
  guestUrl?: string;
  dataJsonFileId?: string;
  ignored?: string;
  error?: string;
  status?: number;
  details?: unknown;
};

export type DeleteInvitationResponse = {
  success: boolean;
  message?: string;
  error?: unknown;
};
