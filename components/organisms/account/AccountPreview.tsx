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
  const { messageHtml, messageJson, groupList, accountList, title } =
    blockInfo.props;
  const html = messageHtml ?? tiptapJsonToHtmlUniversal(messageJson);

  return (
    <MiddlePreviewWrapper
      className={`${className} relative`}
      titleClassName={titleClassName}
      enTitle="ACCOUNT"
      koTitle={title}
      {...rest}
    >
      <div
        className="text-sm text-text-tertiary"
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="w-64.25 flex flex-col gap-4">
        {groupList.map((group, i) => (
          <GroupPreview key={i} group={group}>
            {isOpenAccount => (
              <AccountsPerGroupPreview
                isOpenAccount={isOpenAccount}
                accountList={accountList[i] ?? []}
              />
            )}
          </GroupPreview>
        ))}
      </div>
    </MiddlePreviewWrapper>
  );
};
