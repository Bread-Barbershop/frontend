import { HTMLAttributes } from 'react';

import { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { InformationPreview } from './InformationPreview';

interface Props extends HTMLAttributes<HTMLDivElement> {
  blockInfo: EditorBlock<'speakerInformation'>;
  className: string;
  titleClassName: string;
}
export const SpeakerInformationPreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const { title, speakers } = blockInfo.props;
  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="SPEAKER INFORMATION"
      koTitle={title}
      titleClassName={titleClassName}
      {...rest}
    >
      {speakers?.map((speaker, index) => (
        <InformationPreview key={`${speaker.id}-${index}`} speaker={speaker} />
      ))}
    </MiddlePreviewWrapper>
  );
};
