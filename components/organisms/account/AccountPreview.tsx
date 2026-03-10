import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { AccountsPerGroupPreview } from './preview/AccountsPerGroupPreview';
import { GroupPreview } from './preview/GroupPreview';

interface Props {
  blockInfo: EditorBlock<'account'>;
  titleClassName: string;
  className?: string;
}

export const AccountPreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const html =
    blockInfo.props.messageHtml ??
    tiptapJsonToHtmlUniversal(blockInfo.props.messageJson);

  return (
    <MiddlePreviewWrapper
      className={`${className} relative`}
      titleClassName={titleClassName}
      enTitle="ACCOUNT"
      koTitle={blockInfo.props.title}
      {...rest}
    >
      <div
        className="text-sm text-text-tertiary"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="w-64.25 flex flex-col gap-4">
        {blockInfo.props.groupList.map((group, i) => (
          <GroupPreview key={i} group={group} i={i}>
            {isOpenAccount => (
              <AccountsPerGroupPreview
                isOpenAccount={isOpenAccount}
                accountList={blockInfo.props.accountList[i]}
              />
            )}
          </GroupPreview>
        ))}
      </div>
    </MiddlePreviewWrapper>
  );
};
