import { DriveListResponse } from '@/app/api/drive/_lib/getSaveDataFetch';
import { BgmData } from '@/app/oauthTest/utils/saveInvitationFlow';
import { EditorBlock } from '@/shared/types/block';

export interface BgmFile {
  bgmInfo: BgmData | null;
  bgmFile: File | null;
}

export interface SavedData {
  blocks: EditorBlock[];
  mainPoster: string;
  bgm: BgmFile;
  imageFolderId: string;
  audioFolderId: string;
}

export interface JsonData {
  blocks: EditorBlock[]; // singular to match store
  mainPoster: string;
  bgm: BgmData;
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

export interface AudioFile {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
}
export interface AudioResponse {
  audio: AudioFile[];
  success: boolean;
  error?: string;
}

export interface ImageFile {
  id: string;
  name: string;
  dataUrl: string;
  mimeType: string;
}
export interface ImageResponse {
  images: ImageFile[];
  success: boolean;
  error?: string;
}
