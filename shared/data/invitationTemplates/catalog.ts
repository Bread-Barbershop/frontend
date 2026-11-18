import {
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_INVITATIONS,
} from '../showcaseInvitations';
import { getShowcaseOriginalTemplate } from '../showcaseOriginalTemplates';
import { getShowcaseBlockTypes } from '../showcasePresentation';

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
      tags: [SHOWCASE_CATEGORY_LABELS[design.type], '사진·문구 편집 가능'],
      colors: {
        background: design.palette[0],
        accent: design.palette[1],
        text: design.palette[2],
      },
      poster: { width: 375, height: 812 },
      posterImage: original.thumbnailUrl,
      posterJsonUrl: original.jsonUrl,
      fontFamilies: original.fontFamilies,
      blockTypes: getShowcaseBlockTypes(design),
    };
  });
