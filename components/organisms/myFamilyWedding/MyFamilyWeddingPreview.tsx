import Flower from '@/shared/assets/icons/flower.svg';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
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
  const blocks = useEditorStore(state => state.block);

  const coupleBlock = blocks.find(b => b.component === 'coupleIntroduction') as
    | EditorBlock<'coupleIntroduction'>
    | undefined;
  const groomName = coupleBlock?.props?.groom || '';
  const brideName = coupleBlock?.props?.bride || '';

  return (
    <MiddlePreviewWrapper
      className={className}
      enTitle="MY FAMILY"
      noTitle={true}
      titleClassName={titleClassName}
      childClassName="w-full flex flex-col gap-1"
      {...rest}
    >
      <div className="flex flex-row items-center gap-1">
        {brideFamily?.map((member, index) => (
          <p key={index} className="flex items-center">
            {brideFamily.length > 1 && index !== 0 && '•'}
            {member.flower && <Flower />}
            {member.name}
          </p>
        ))}
        <span>의 딸 {brideName}</span>
      </div>
      <div className="flex flex-row items-center gap-1">
        {groomFamily?.map((member, index) => (
          <p key={index} className="flex items-center">
            {groomFamily.length > 1 && index !== 0 && '•'}
            {member.flower && <Flower />}
            {member.name}
          </p>
        ))}
        <span>의 아들 {groomName}</span>
      </div>
    </MiddlePreviewWrapper>
  );
};
