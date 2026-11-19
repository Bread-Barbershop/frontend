import type { EditorBlock } from '@/shared/types/block';

import type { SponsorItem } from './SposorshipInfomation.schema';

export interface SponsorEntry {
  id: string;
  name: string;
  logo: File | string | null;
}

type Props = EditorBlock<'sponsorshipInfomation'>['props'];

export function readSponsorEntries({
  images,
  sponsors,
}: Props): SponsorEntry[] {
  const logos = images ?? [];
  if (!sponsors?.length) {
    return logos.map((logo, index) => ({
      id: `legacy-${index}`,
      name: '',
      logo,
    }));
  }
  return sponsors.map(({ id, name, logoIndex }) => ({
    id,
    name,
    logo: logoIndex == null ? null : (logos[logoIndex] ?? null),
  }));
}

// Drive uploads and existing invitations use the block's flat image group.
export function serializeSponsorEntries(entries: SponsorEntry[]) {
  const images: Props['images'] = [];
  const sponsors: SponsorItem[] = entries.map(({ id, name, logo }) => {
    const logoIndex = logo ? images.length : null;
    if (logo) images.push(logo);
    return { id, name, logoIndex };
  });
  return { images, sponsors };
}
