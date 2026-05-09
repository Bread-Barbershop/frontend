import { DriveListResponse } from '@/app/api/drive/_lib/getSaveDataFetch';
import { BgmData } from '@/app/oauthTest/utils/saveInvitationFlow';
import {
  BulkData,
  PersistedEditorBlock,
  ShareUrlState,
} from '@/shared/types/block';

export interface BgmFile {
  bgmInfo: BgmData | null;
  bgmFile: File | null;
}
type UploadTask = {
  id: string;
  file: File;
};
export interface SavedData {
  bulkData: {
    backgroundColor: string;
    titleData: BulkData;
    bodyData: BulkData;
    isZoom: boolean;
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
    backgroundColor: string;
    titleData: BulkData;
    bodyData: BulkData;
    isZoom: boolean;
  };
  blocks: PersistedEditorBlock[]; // singular to match store
  shareUrl?: ShareUrlState;
  mainPoster: string;
  bgm: BgmData;
  invitationImage: UploadTask[];
}

export interface ResponseData {
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
