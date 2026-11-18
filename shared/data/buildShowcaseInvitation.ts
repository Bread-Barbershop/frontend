import { DEFAULT_SCROLL_ANIMATION } from '@/components/molecules/scroll-fade-in/animationConfig';

import { buildShowcaseSection } from './buildShowcaseSection';

import type { ShowcaseInvitation } from './showcaseInvitations';

export function buildShowcaseInvitation(design: ShowcaseInvitation) {
  const [backgroundColor, accent, text] = design.palette;
  const blocks = design.sections.map((section, index) =>
    buildShowcaseSection(design, section, index)
  );

  return {
    blocks,
    bulkData: {
      sectionStyle: design.sectionStyle,
      backgroundColor,
      titleData: {
        font: design.font,
        fontSize: '22px',
        fontWeight: design.type === 'seminar' ? '700' : '500',
        color: accent,
        isDefault: false,
      },
      bodyData: {
        font: 'SUIT',
        fontSize: '14px',
        fontWeight: '400',
        color: text,
        isDefault: false,
      },
      isZoom: false,
      scrollAnimation: DEFAULT_SCROLL_ANIMATION,
    },
  };
}
