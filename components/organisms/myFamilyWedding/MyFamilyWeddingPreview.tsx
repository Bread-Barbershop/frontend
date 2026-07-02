import Flower from '@/shared/assets/icons/flower.svg';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
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
  const { fontFamily } = useBodyFontInfo();

  return (
    <MiddlePreviewWrapper
      className={className}
      subTitle="MY FAMILY"
      noTitle={true}
      titleClassName={titleClassName}
      childClassName="w-full flex flex-col gap-1"
      {...rest}
    >
      <div className="flex flex-row items-center gap-1" style={{ fontFamily }}>
        {brideFamily?.map((member, index) => (
          <p key={index} className="flex items-center">
            {brideFamily.length > 1 && index !== 0 && '•'}
            {member.flower && <Flower />}
            {member.name}
          </p>
        ))}
        <span>의 딸</span>
      </div>
      <div className="flex flex-row items-center gap-1" style={{ fontFamily }}>
        {groomFamily?.map((member, index) => (
          <p key={index} className="flex items-center">
            {groomFamily.length > 1 && index !== 0 && '•'}
            {member.flower && <Flower />}
            {member.name}
          </p>
        ))}
        <span>의 아들</span>
      </div>
    </MiddlePreviewWrapper>
  );
};
