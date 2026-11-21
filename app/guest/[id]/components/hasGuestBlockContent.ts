import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { getInterviewCard } from '@/components/organisms/interview/interviewContent';
import type { EditorBlock } from '@/shared/types/block';

import type { GuestBlock } from '../types/guestTypes';

type Profile = Pick<
  EditorBlock<'myChild'>['props'],
  'messageHtml' | 'messageJson' | 'image'
>;

function hasProfileContent(profile: Profile) {
  if (profile.image?.[0]) return true;
  const html =
    profile.messageHtml ?? tiptapJsonToHtmlUniversal(profile.messageJson);
  return Boolean(html.replace(/<[^>]*>|&(?:nbsp|#160|#xa0);/gi, '').trim());
}

export function hasGuestBlockContent(block: GuestBlock) {
  if (block.privacyPlaceholder || block.privacyMediaHidden) return true;
  switch (block.component) {
    case 'organizerInformation': {
      const props = block.props as EditorBlock<'organizerInformation'>['props'];
      return Boolean(props.organizer?.trim() || hasProfileContent(props));
    }
    case 'speakerInformation': {
      const props = block.props as EditorBlock<'speakerInformation'>['props'];
      return Boolean(
        props.speakers?.some(
          speaker =>
            speaker && (speaker.name?.trim() || hasProfileContent(speaker))
        )
      );
    }
    case 'myChild': {
      const props = block.props as EditorBlock<'myChild'>['props'];
      return Boolean(
        props.name?.trim() ||
        props.nickname?.trim() ||
        props.birthday?.trim() ||
        hasProfileContent(props)
      );
    }
    case 'interview': {
      const props = block.props as EditorBlock<'interview'>['props'];
      return Boolean(props.questions?.some(getInterviewCard));
    }
    default:
      return true;
  }
}
