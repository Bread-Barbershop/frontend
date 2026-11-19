import { Fragment } from 'react';

import Flower from '@/shared/assets/icons/flower.svg';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import type { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { DEFAULT_FAMILY_SUFFIX } from './MyFamilyWedding.schema';

interface Props {
  className: string;
  titleClassName?: string;
  blockInfo: EditorBlock<'myFamilyWedding'>;
}

function FamilyLine({
  members,
  suffix,
}: {
  members: EditorBlock<'myFamilyWedding'>['props']['groomFamily'];
  suffix: string;
}) {
  const namedMembers = members?.filter(
    member => typeof member?.name === 'string' && member.name.trim()
  );
  if (!namedMembers?.length) return null;

  return (
    <p className="max-w-full break-words whitespace-pre-wrap text-sm">
      {namedMembers.map((member, index) => (
        <Fragment key={index}>
          {index > 0 && '·'}
          {member.flower && (
            <Flower
              role="img"
              aria-label="추모 꽃"
              className="inline-block align-middle"
            />
          )}
          {member.name.trim()}
        </Fragment>
      ))}
      {suffix}
    </p>
  );
}

export const MyFamilyWeddingPreview = ({
  className,
  titleClassName,
  blockInfo,
  ...rest
}: Props) => {
  const { brideFamily, groomFamily, brideFamilySuffix, groomFamilySuffix } =
    blockInfo.props;
  const { fontFamily } = useBodyFontInfo();

  return (
    <MiddlePreviewWrapper
      className={className}
      subTitle="MY FAMILY"
      noTitle={true}
      titleClassName={titleClassName}
      childClassName="w-full flex flex-col gap-1"
      style={{ fontFamily }}
      {...rest}
    >
      <FamilyLine
        members={groomFamily}
        suffix={groomFamilySuffix ?? DEFAULT_FAMILY_SUFFIX.groom}
      />
      <FamilyLine
        members={brideFamily}
        suffix={brideFamilySuffix ?? DEFAULT_FAMILY_SUFFIX.bride}
      />
    </MiddlePreviewWrapper>
  );
};
