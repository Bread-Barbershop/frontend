import Flower from '@/shared/assets/icons/flower.svg';
import type { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

interface Props {
  className: string;
  titleClassName?: string;
  blockInfo: EditorBlock<'myFamilyWedding'>;
}

export const MyFamilyWeddingPreview = ({
  className,
  titleClassName,
  blockInfo,
  ...rest
}: Props) => {
  const { brideFamily, groomFamily } = blockInfo.props;

  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="MY FAMILY"
      noTitle={true}
      titleClassName={titleClassName}
      childClassName="w-full flex flex-col gap-1"
      {...rest}
    >
      <div className="flex flex-row">
        {brideFamily?.map((member, index) => (
          <p key={index} className="flex">
            {brideFamily.length > 1 && index !== 0 && '•'}
            {member.flower && <Flower />}
            {member.name}
          </p>
        ))}
        의 딸
      </div>
      <div className="flex flex-row">
        {groomFamily?.map((member, index) => (
          <p key={index} className="flex">
            {groomFamily.length > 1 && index !== 0 && '•'}
            {member.flower && <Flower />}
            {member.name}
          </p>
        ))}
        의 아들
      </div>
    </MiddlePreviewWrapper>
  );
};
