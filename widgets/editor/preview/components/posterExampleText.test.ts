import { readFileSync } from 'node:fs';
import path from 'node:path';

import { INVITATION_TEMPLATES } from '@/shared/data/invitationTemplates/catalog';

import { getPosterExampleText } from './posterExampleText';

it.each(INVITATION_TEMPLATES)(
  '$name 원본 표지에서 확인할 행사 문구를 찾는다',
  template => {
    const source = path.join(process.cwd(), 'public', template.posterJsonUrl);
    const poster = JSON.parse(readFileSync(source, 'utf8'));
    expect(getPosterExampleText(poster.objects).length).toBeGreaterThan(0);
  }
);
