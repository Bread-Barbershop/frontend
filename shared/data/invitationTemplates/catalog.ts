import {
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_INVITATIONS,
} from '../showcaseInvitations';
import { getShowcaseOriginalTemplate } from '../showcaseOriginalTemplates';

import type { InvitationTemplate } from './types';

export const INVITATION_TEMPLATES: InvitationTemplate[] =
  SHOWCASE_INVITATIONS.map(design => {
    const original = getShowcaseOriginalTemplate(design.id);
    if (!original) throw new Error(`Missing original template: ${design.id}`);
    return {
      id: design.id,
      type: design.type,
      name: design.name,
      eyebrow: design.eyebrow,
      description: design.description,
      largePrint: design.largePrint === true,
      tags: [
        SHOWCASE_CATEGORY_LABELS[design.type],
        ...(design.largePrint ? ['큰 글씨'] : []),
        '사진·문구 편집 가능',
      ],
      colors: {
        background: design.palette[0],
        accent: design.palette[1],
        text: design.palette[2],
      },
      poster: { width: 375, height: 812 },
      posterImage: original.thumbnailUrl,
      posterJsonUrl: original.jsonUrl,
      fontFamilies: original.fontFamilies,
      blockTypes: design.sections.map(section => section.component),
    };
  });

export function getInvitationTemplates(type: string, largePrintOnly = false) {
  return INVITATION_TEMPLATES.filter(
    template =>
      (type === 'all' || template.type === type) &&
      (!largePrintOnly || template.largePrint)
  );
}
