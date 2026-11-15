import {
  SHOWCASE_CATEGORY_LABELS,
  SHOWCASE_INVITATIONS,
} from '../showcaseInvitations';

import { createCollectionPoster } from './collectionPosters';

import type { InvitationTemplate } from './types';

export const INVITATION_TEMPLATES: InvitationTemplate[] =
  SHOWCASE_INVITATIONS.map(design => ({
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
    poster: createCollectionPoster(design),
    blockTypes:
      design.type === 'seminar'
        ? [
            'greeting',
            'timeline',
            'speakerInformation',
            'picture',
            'calendar',
            'place',
            'transportation',
            'dressCode',
            'closingComment',
          ]
        : design.type === 'firstBirthday'
          ? [
              'greeting',
              'myChild',
              'gallery',
              'calendar',
              'interview',
              'timeline',
              'picture',
              'place',
              'transportation',
              'dressCode',
              'closingComment',
            ]
          : design.type === 'birthday'
            ? [
                'greeting',
                'picture',
                'calendar',
                'interview',
                'timeline',
                'gallery',
                'place',
                'dressCode',
                'closingComment',
              ]
            : [
                'greeting',
                'coupleIntroduction',
                'picture',
                'calendar',
                'gallery',
                'interview',
                'timeline',
                'place',
                'transportation',
                'dressCode',
                'closingComment',
              ],
  }));
