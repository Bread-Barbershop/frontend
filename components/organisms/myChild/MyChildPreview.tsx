import { Image } from '@/components/atoms/image';
import { PreviewBody } from '@/components/atoms/preview-body/PreviewBody';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';
import type { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

interface Props {
  className: string;
  titleClassName?: string;
  blockInfo: EditorBlock<'myChild'>;
  isGuestPage?: boolean;
}

export const MyChildPreview = ({
  className,
  titleClassName,
  blockInfo,
  isGuestPage = false,
  ...rest
}: Props) => {
  const {
    title,
    name,
    nickname,
    birthday,
    image,
    checkedSubTitle,
    subTitle,
  } = blockInfo.props;
  const { fontFamily } = useBodyFontInfo();

  const html =
    blockInfo.props.messageHtml ??
    tiptapJsonToHtmlUniversal(blockInfo.props.messageJson);

  const preview = useResolvedImageSource(
    image && image.length > 0 ? image[0] : null
  );
  return (
    <MiddlePreviewWrapper
      className={className}
      checkedSubTitle={checkedSubTitle}
      subTitle={subTitle}
      subTitleDefault="MY CHILD"
      mainTitle={title}
      mainTitleDefault={`${name}의 첫번째 생일`}
      titleClassName={titleClassName}
      childClassName="w-full flex flex-col gap-6"
      {...rest}
    >
      {!preview && !isGuestPage && (
        <div className="relative w-full aspect-square overflow-hidden rounded-3xl flex-center bg-border-neutral">
          <p className="text-text-secondary text-sm">사진을 추가해주세요.</p>
        </div>
      )}
      {preview && (
        <div className="relative w-full aspect-square overflow-hidden rounded-3xl">
          <Image src={preview} alt="아기 사진" fill className="object-cover" />
        </div>
      )}
      <section
        className="grid grid-cols-[1fr_2fr_1fr] w-full items-center gap-10 text-text-primary"
        style={{ fontFamily }}
      >
        <p className="col-start-2 text-[16px]">
          {name}
          {nickname && <span className="text-[16px]">({nickname})</span>}
        </p>
        <p className="col-start-3">{birthday}</p>
      </section>
      <PreviewBody html={html} />
    </MiddlePreviewWrapper>
  );
};
