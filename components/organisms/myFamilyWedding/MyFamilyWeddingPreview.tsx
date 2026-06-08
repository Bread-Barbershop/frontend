import Flower from '@/shared/assets/icons/flower.svg';
import { useBodyFontFamily } from '@/shared/hooks/useBodyFontFamily';
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
  const bodyFontFamily = useBodyFontFamily();

  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="MY FAMILY"
      noTitle={true}
      titleClassName={titleClassName}
      childClassName="w-full flex flex-col gap-1"
      {...rest}
    >
      <div
        className="flex flex-row items-center gap-1"
        style={{ fontFamily: bodyFontFamily }}
      >
        {brideFamily?.map((member, index) => (
          <p key={index} className="flex items-center">
            {brideFamily.length > 1 && index !== 0 && '•'}
            {member.flower && <Flower />}
            {member.name}
          </p>
        ))}
        <span>의 딸</span>
      </div>
      <div
        className="flex flex-row items-center gap-1"
        style={{ fontFamily: bodyFontFamily }}
      >
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
