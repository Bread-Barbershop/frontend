import { Plus } from 'lucide-react';
import { ChangeEvent, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';

import { PopupOptionsJSON } from '../popup/PopupOptionsJSON';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { NoticeItem } from './NoticeItem';
import { NOTICE_LIST } from './noticeList';

import type { JSONContent } from '@tiptap/react';

interface Props {
  blockInfo: EditorBlock<'notice'>;
  id: string;
}
export const Notice = ({ blockInfo, id }: Props) => {
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const [isNoticeListOpen, setIsNoticeListOpen] = useState(false);
  const [editorResetKey, setEditorResetKey] = useState(0);

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { title: e.target.value });
  };

  const handleNoticeListSelect = (content: JSONContent, _index?: number) => {
    const newItem = {
      id: crypto.randomUUID(),
      messageJson: content,
      messageHtml: tiptapJsonToHtmlInBrowser(content),
      image: [],
    };

    updateBlock(id, {
      items: [...(blockInfo.props.items || []), newItem],
    });
    setEditorResetKey(prev => prev + 1);
    setIsNoticeListOpen(false);
  };

  const handleItemEditorChange = (itemId: string, json: JSONContent) => {
    const newItems = (blockInfo.props.items || []).map(item =>
      item.id === itemId
        ? {
            ...item,
            messageJson: json,
            messageHtml: tiptapJsonToHtmlInBrowser(json),
          }
        : item
    );
    updateBlock(id, { items: newItems });
  };

  const handleItemPictureChange = (itemId: string, file: (File | string)[]) => {
    const newItems = (blockInfo.props.items || []).map(item =>
      item.id === itemId ? { ...item, image: file } : item
    );
    updateBlock(id, { items: newItems });
    updateImage(id, file);
  };

  const handleItemDelete = (itemId: string) => {
    const newItems = (blockInfo.props.items || []).filter(
      item => item.id !== itemId
    );
    updateBlock(id, { items: newItems });
  };

  return (
    <LeftEditorWrapper ariaLabel="공지사항">
      <NavigationBar
        action={
          <UtilityButton
            size="md"
            variant="primary"
            onClick={() => setIsNoticeListOpen(true)}
          >
            <Plus size={16} />
            항목추가
          </UtilityButton>
        }
        direction="right"
      >
        공지사항
      </NavigationBar>
      <div className="flex flex-col gap-6 w-full">
        <TextField
          label="제목"
          inputProps={{
            placeholder: '제목을 입력해 주세요',
            value: blockInfo.props.title,
            onChange: handleTitleChange,
          }}
          className="text-center"
        />
        {(blockInfo.props.items || []).map((item, index) => (
          <div key={item.id} className="flex flex-col">
            {index !== 0 && (
              <div className="flex flex-col items-center gap-1">
                <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
                <div className="w-0.5 h-1 rounded-sm bg-text-secondary" />
              </div>
            )}
            <NoticeItem
              id={id}
              item={item}
              noticeLength={blockInfo.props.items?.length || 0}
              editorResetKey={editorResetKey}
              onEditorChange={json => handleItemEditorChange(item.id, json)}
              onPictureChange={file => handleItemPictureChange(item.id, file)}
              onDelete={() => handleItemDelete(item.id)}
            />
          </div>
        ))}
      </div>

      {isNoticeListOpen && (
        <PopupOptionsJSON
          popupTitle="항목 추가"
          options={NOTICE_LIST}
          onSelect={handleNoticeListSelect}
          onClose={() => setIsNoticeListOpen(false)}
        />
      )}
    </LeftEditorWrapper>
  );
};
