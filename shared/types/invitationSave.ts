import type { ScrollAnimationSettings } from '@/components/molecules/scroll-fade-in/animationConfig';
import type { InvitationPrivacy } from '@/features/invitation/privacy/settings';
import type { BackgroundTextureSettings } from '@/shared/data/backgroundTextures';
import type {
  BulkData,
  PersistedEditorBlock,
  ShareUrlState,
} from '@/shared/types/block';
import type { InvitationEffectsSettings } from '@/shared/utils/invitationEffects';

import type { GuestRenderHints } from './renderHints';
import type {
  SerializedImageProps,
  SerializedObjectProps,
  SerializedTextboxProps,
} from 'fabric';


export type UploadTask = {
  id: string;
  file: File;
};

export type BgmData = {
  selectedBgmId: string | null;
  isLoop: boolean;
  volume: number;
  userBgmTitle: string | null;
  userBgmDuration: string | null;
  userBgmFileId: string | null;
};

export type MainPosterData = {
  version: string;
  objects: (
    | SerializedTextboxProps
    | SerializedImageProps
    | SerializedObjectProps
  )[];
  background?: string;
  thumbnailFileId?: string;
};

export type BulkJson = {
  backgroundColor: string;
  backgroundTexture?: BackgroundTextureSettings;
  titleData: BulkData;
  bodyData: BulkData;
  isZoom: boolean;
  invitationPrivacy?: InvitationPrivacy;
  scrollAnimation: ScrollAnimationSettings;
  invitationEffects?: InvitationEffectsSettings;
};

export type InvitationPayload = {
  bulkData: BulkJson;
  blocks: PersistedEditorBlock[];
  shareUrl: ShareUrlState;
  bgm: BgmData;
  mainPoster: MainPosterData;
  invitationImage: UploadTask[];
  renderHints?: GuestRenderHints;
};

export type InvitationThumbnail = {
  name: string;
  mimeType: string;
  dataUrl: string;
  width: number;
  height: number;
  createdAt: string;
};
