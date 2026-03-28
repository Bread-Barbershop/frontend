import { Plus } from 'lucide-react';
import { ChangeEvent, useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { debounce } from '@/shared/utils/debounce';

import { PopupOptionsJSON } from '../popup/PopupOptionsJSON';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { NoticeItem } from './NoticeItem';
import { NOTICE_LIST } from './noticeList';

import type { JSONContent } from '@tiptap/react';

interface Props {
  blockInfo: EditorBlock<'notice'>;
  id: string;
}

interface Item {
  id: string;
  messageJson: JSONContent | null;
  messageHtml: string | null;
  image: (File | string)[];
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

  const { items, title } = blockInfo.props;

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

    const newItems = [...(items || []), newItem];
    updateBlock(id, {
      items: newItems,
      images: newItems.map(s => s.image[0]),
    });
    setEditorResetKey(prev => prev + 1);
    setIsNoticeListOpen(false);
  };

  const handleItemEditorChange = useMemo(
    () =>
      debounce((itemId: string, json: JSONContent, items: Item[]) => {
        updateBlock(id, {
          items: items.map(item =>
            item.id === itemId
              ? {
                  ...item,
                  messageJson: json,
                  messageHtml: tiptapJsonToHtmlInBrowser(json),
                }
              : item
          ),
        });
      }, 300),
    [id, updateBlock]
  );

  useEffect(() => {
    return () => {
      handleItemEditorChange.cancel();
    };
  }, [handleItemEditorChange]);

  const handleItemPictureChange = (itemId: string, file: (File | string)[]) => {
    const newItems = (items || []).map(item =>
      item.id === itemId ? { ...item, image: file } : item
    );
    const allImages = newItems.map(s => s.image[0]);

    updateBlock(id, {
      items: newItems,
      images: allImages,
    });
    updateImage(
      id,
      allImages.filter((f): f is File | string => !!f)
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAddItem = () => {
    const newItem = {
      id: crypto.randomUUID(),
      messageJson: null,
      messageHtml: null,
      image: [],
    };
    const newItems = [...(items || []), newItem];
    updateBlock(id, {
      items: newItems,
      images: newItems.map(s => s.image[0]),
    });
  };

  const handleItemDelete = (itemId: string) => {
    const newItems = (items || []).filter(item => item.id !== itemId);
    const newImages = newItems.map(s => s.image[0]);

    updateBlock(id, {
      items: newItems,
      images: newImages,
    });
    updateImage(
      id,
      newImages.filter((f): f is File | string => !!f)
    );
  };

  useEffect(() => {
    if (!items || items.length === 0) {
      handleAddItem();
    }
  }, [handleAddItem, items]);

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
            value: title,
            onChange: handleTitleChange,
          }}
          className="text-center"
        />
        {(items || []).map((item, index) => (
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
              onEditorChange={json =>
                handleItemEditorChange(item.id, json, items || [])
              }
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
