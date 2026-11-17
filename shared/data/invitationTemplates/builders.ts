import type { EditorBlock } from '@/shared/types/block';

import { buildShowcaseInvitation } from '../buildShowcaseInvitation';
import { getShowcaseInvitation } from '../showcaseInvitations';

import { INVITATION_TEMPLATES } from './catalog';
import { loadOriginalPosterJson } from './originalPosterLoader';

import type { PreparedInvitationTemplate } from './types';

function createUuid(): string {
  const cryptoApi = globalThis.crypto;
  if (typeof cryptoApi?.randomUUID === 'function') {
    return cryptoApi.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, char => {
    const random = Math.floor(Math.random() * 16);
    const value = char === 'x' ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

function renewBlockIds(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(renewBlockIds);
  if (!value || typeof value !== 'object') return value;

  return Object.fromEntries(
    Object.entries(value).map(([key, child]) => [
      key,
      key === 'id' ? createUuid() : renewBlockIds(child),
    ])
  );
}

export async function createInvitationTemplate(
  id: string
): Promise<PreparedInvitationTemplate> {
  const template = INVITATION_TEMPLATES.find(item => item.id === id);
  if (!template) throw new Error('Unknown template: ' + id);

  const design = getShowcaseInvitation(id);
  if (!design) throw new Error('Invitation design not found: ' + id);

  const posterJsonPromise = loadOriginalPosterJson(template.posterJsonUrl);
  const { blocks, bulkData } = buildShowcaseInvitation(design);
  const posterJson = await posterJsonPromise;

  return {
    blocks: renewBlockIds(blocks) as EditorBlock[],
    backgroundColor: bulkData.backgroundColor,
    titleData: bulkData.titleData,
    bodyData: bulkData.bodyData,
    posterJson,
  };
}
