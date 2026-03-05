import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

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
    <div className={cn('w-full relative', className)} {...rest}>
      <div className="flex flex-col items-center gap-6 py-8 px-5">
        <div className="flex-center flex-col gap-1">
          <p className={cn(`text-text-wedding sub-title`, titleClassName)}>
            ACCOUNT
          </p>
          <p className={cn(`text-text-wedding main-title`, titleClassName)}>
            {blockInfo.props.title}
          </p>
          <div
            className="text-sm text-text-tertiary"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        </div>
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
      </div>
    </div>
  );
};
