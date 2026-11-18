import type { ScrollAnimationSettings } from '@/components/molecules/scroll-fade-in/animationConfig';
import type { InvitationPrivacy, InvitationPrivacyField } from '@/features/invitation/privacy/settings';
import type { SectionStyle } from '@/shared/data/sectionStyles';
import { BulkData } from '@/shared/types/block';
import type { GuestRenderHints } from '@/shared/types/renderHints';

import type {
  SerializedImageProps,
  SerializedObjectProps,
  SerializedTextboxProps,
} from 'fabric';

// 임시로 타입을 따로 선언해서 사용. 추후 타입 재사용 가능한지 체크할 것.

export type GuestBlock = {
  id: string;
  type: string;
  component: string;
  props: unknown;
  privacyPlaceholder?: 'photo' | 'video' | 'location';
  privacyMediaHidden?: boolean;
};

export type GuestBgm = {
  selectedBgmId: string | null;
  isLoop: boolean;
  volume: number;
  userBgmTitle: string | null;
  userBgmDuration: string | null;
  userBgmFileId: string | null;
};

export type GuestPayload = {
  bulkData: BulkJson;
  blocks: GuestBlock[];
  shareUrl?: {
    title: string;
    description: string;
    images: string[];
    urlTitle: string;
    urlDescription: string;
    urlImage: string[];
    showLocationButton: boolean;
    locationInfo?: {
      lat: number;
      lng: number;
      placeName: string;
    };
  };
  bgm: GuestBgm;
  mainPoster: GuestMainPosterData;
  renderHints?: GuestRenderHints;
  activePrivacyFields?: InvitationPrivacyField[];
};

export type BulkJson = {
  sectionStyle?: SectionStyle;
  backgroundColor: string;
  titleData: BulkData;
  bodyData: BulkData;
  isZoom: boolean;
  invitationPrivacy?: InvitationPrivacy;
  scrollAnimation: ScrollAnimationSettings;
};

export type GuestMainPosterData = {
  version: string;
  objects: (
    | SerializedTextboxProps
    | SerializedImageProps
    | SerializedObjectProps
  )[];
  background?: string;
  thumbnailFileId?: string;
};
