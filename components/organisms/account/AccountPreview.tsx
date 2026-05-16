import { previewTextClassName } from '@/components/molecules/text-editor/utils/previewTextClassName';
import { tiptapJsonToHtmlUniversal } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { EditorBlock } from '@/shared/types/block';

import { MiddlePreviewWrapper } from '../wrapper/MiddlePreviewWrapper';

import { AccountsPerGroupPreview } from './preview/AccountsPerGroupPreview';
import { GroupPreview } from './preview/GroupPreview';

interface Props {
  blockInfo: EditorBlock<'account'>;
  titleClassName?: string;
  className?: string;
}

export const AccountPreview = ({
  blockInfo,
  className,
  titleClassName,
  ...rest
}: Props) => {
  const {
    messageHtml,
    messageJson,
    groupList,
    accountList,
    title,
    checkedEnglishTitle,
    englishTitle,
  } = blockInfo.props;
  const html = messageHtml ?? tiptapJsonToHtmlUniversal(messageJson);

  return (
    <MiddlePreviewWrapper
      className={`${className} relative`}
      titleClassName={titleClassName}
      checkedEnglishTitle={checkedEnglishTitle}
      enTitle={englishTitle}
      enTitleDefault="ACCOUNT"
      koTitle={title}
      koTitleDefault="마음 보내실 곳"
      {...rest}
    >
      <div
        className={`text-sm text-text-tertiary ${previewTextClassName}`}
        dangerouslySetInnerHTML={{ __html: html }}
      />

      <div className="w-70 flex flex-col items-center gap-6">
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
