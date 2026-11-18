import { DriveListResponse } from '@/app/api/drive/_lib/getSaveDataFetch';
import type { ScrollAnimationSettings } from '@/components/molecules/scroll-fade-in/animationConfig';
import type { InvitationPrivacy } from '@/features/invitation/privacy/settings';
import type { BackgroundTextureSettings } from '@/shared/data/backgroundTextures';
import type { SectionStyle } from '@/shared/data/sectionStyles';
import {
  BulkData,
  PersistedEditorBlock,
  ShareUrlState,
} from '@/shared/types/block';
import type { BgmData } from '@/shared/types/invitationSave';
import type { InvitationEffectsSettings } from '@/shared/utils/invitationEffects';

export interface BgmFile {
  bgmInfo: BgmData | null;
  bgmFile: File | null;
}
type UploadTask = {
  id: string;
  file: File;
};
export interface SavedData {
  audienceName?: string;
  bulkData: {
    sectionStyle?: SectionStyle;
    backgroundColor: string;
    backgroundTexture?: BackgroundTextureSettings;
    titleData: BulkData;
    bodyData: BulkData;
    isZoom: boolean;
    invitationPrivacy?: InvitationPrivacy;
    scrollAnimation: ScrollAnimationSettings;
    invitationEffects?: InvitationEffectsSettings;
  };
  blocks: PersistedEditorBlock[];
  mainPoster: string;
  bgm: BgmFile;
  shareUrl: ShareUrlState;
  imageFolderId: string;
  audioFolderId: string;
  invitationImage: UploadTask[];
}

export interface JsonData {
  bulkData: {
    sectionStyle?: SectionStyle;
    backgroundColor: string;
    backgroundTexture?: BackgroundTextureSettings;
    titleData: BulkData;
    bodyData: BulkData;
    isZoom: boolean;
    invitationPrivacy?: InvitationPrivacy;
    scrollAnimation: ScrollAnimationSettings;
    invitationEffects?: InvitationEffectsSettings;
  };
  blocks: PersistedEditorBlock[]; // singular to match store
  shareUrl?: ShareUrlState;
  mainPoster: string;
  bgm: BgmData;
  invitationImage: UploadTask[];
}

export interface ResponseData {
  audienceName?: string;
  config: JsonData;
  images: DriveListResponse;
  audios: DriveListResponse;
  imageFolderId: string;
  audioFolderId: string;
}

export interface UpdateInvitationResponse extends ResponseData {
  success: boolean;
  error?: string;
}

export interface FileInfo {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
}
export interface AudioResponse {
  audio: FileInfo[];
  success: boolean;
  error?: string;
}

export interface ImageResponse {
  images: FileInfo[];
  success: boolean;
  error?: string;
}
