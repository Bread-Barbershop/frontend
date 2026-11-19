import Image from 'next/image';

import type { InvitationTemplate } from '@/shared/data/invitationTemplates';

interface Props {
  template: InvitationTemplate;
  sizes?: string;
  fit?: 'cover' | 'contain';
}

export default function InvitationTemplatePoster({
  template,
  sizes = '(max-width: 430px) 100vw, 430px',
  fit = 'cover',
}: Props) {
  return (
    <Image
      src={template.posterImage}
      alt={`${template.name} 포스터 미리보기`}
      width={template.poster.width}
      height={template.poster.height}
      sizes={sizes}
      className={`block h-full w-full ${fit === 'contain' ? 'object-contain' : 'object-cover'}`}
    />
  );
}
