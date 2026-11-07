import { INVITATION_TEMPLATES } from './catalog';
import { createInvitationTemplate } from './builders';

import type { InvitationTemplateType } from './types';

export { INVITATION_TEMPLATES, createInvitationTemplate };
export type {
  InvitationTemplate,
  InvitationTemplateType,
  PosterCircleElement,
  PosterDesign,
  PosterElement,
  PosterLineElement,
  PosterRectElement,
  PosterTextElement,
  PreparedInvitationTemplate,
} from './types';

export function getInvitationTemplates(type: InvitationTemplateType) {
  return INVITATION_TEMPLATES.filter(template => template.type === type);
}
