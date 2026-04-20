import { useEffect, useMemo, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
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

interface NoticeType {
  id: string;
  notice: string;
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

  const { noticeList, title, checkedEnglishTitle, englishTitle } =
    blockInfo.props;

  const handleUpdateBlock = (key: string, value: string | boolean) => {
    updateBlock(id, { [key]: value });
  };

  const handleNoticeListSelect = (content: JSONContent, _index?: number) => {
    const contentCopy = JSON.parse(JSON.stringify(content)) as JSONContent;
    let firstText = '';

    if (contentCopy.content && contentCopy.content.length > 0) {
      const firstNode = contentCopy.content[0];
      firstText = firstNode.content?.[0]?.text || '';

      contentCopy.content.shift();

      while (
        contentCopy.content.length > 0 &&
        contentCopy.content[0].type === 'paragraph' &&
        (!contentCopy.content[0].content ||
          contentCopy.content[0].content.length === 0)
      ) {
        contentCopy.content.shift();
      }
    }

    const newNotice = {
      id: crypto.randomUUID(),
      notice: firstText,
      messageJson: contentCopy,
      messageHtml: tiptapJsonToHtmlInBrowser(contentCopy),
      image: [],
    };

    const newNoticeList = [...(noticeList || []), newNotice];
    updateBlock(id, {
      noticeList: newNoticeList,
      images: newNoticeList.map(s => s.image[0]),
    });
    setEditorResetKey(prev => prev + 1);
    setIsNoticeListOpen(false);
  };

  const handleNoticeChange = (noticeId: string, notice: string) => {
    const newNoticeList = (noticeList || []).map(prevNotice =>
      prevNotice.id === noticeId ? { ...prevNotice, notice } : prevNotice
    );
    updateBlock(id, { noticeList: newNoticeList });
  };

  const handleNoticeEditorChange = useMemo(
    () =>
      debounce(
        (noticeId: string, json: JSONContent, noticeList: NoticeType[]) => {
          updateBlock(id, {
            noticeList: noticeList.map(notice =>
              notice.id === noticeId
                ? {
                    ...notice,
                    messageJson: json,
                    messageHtml: tiptapJsonToHtmlInBrowser(json),
                  }
                : notice
            ),
          });
        },
        300
      ),
    [id, updateBlock]
  );

  useEffect(() => {
    return () => {
      handleNoticeEditorChange.cancel();
    };
  }, [handleNoticeEditorChange]);

  const handleNoticePictureChange = (
    noticeId: string,
    file: (File | string)[]
  ) => {
    const newNoticeList = (noticeList || []).map(notice =>
      notice.id === noticeId ? { ...notice, image: file } : notice
    );
    const allImages = newNoticeList.map(s => s.image[0]);

    updateBlock(id, {
      noticeList: newNoticeList,
      images: allImages,
    });
    updateImage(
      id,
      allImages.filter((f): f is File | string => !!f)
    );
  };

  const handleNoticePictureDelete = (noticeId: string) => {
    const newNoticeList = (noticeList || []).map(notice =>
      notice.id === noticeId ? { ...notice, image: [] } : notice
    );
    const allImages = newNoticeList.map(s => s.image[0]);

    updateBlock(id, {
      noticeList: newNoticeList,
      images: allImages,
    });
    updateImage(
      id,
      allImages.filter((f): f is File | string => !!f)
    );
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAddNotice = () => {
    const newNotice = {
      id: crypto.randomUUID(),
      notice: '',
      messageJson: null,
      messageHtml: null,
      image: [],
    };
    const newNoticeList = [...(noticeList || []), newNotice];
    updateBlock(id, {
      noticeList: newNoticeList,
      images: newNoticeList.map(s => s.image[0]),
    });
  };

  const handleDeleteNotice = (noticeId: string) => {
    const newNoticeList = (noticeList || []).filter(
      notice => notice.id !== noticeId
    );
    const newImages = newNoticeList.map(s => s.image[0]);

    updateBlock(id, {
      noticeList: newNoticeList,
      images: newImages,
    });
    updateImage(
      id,
      newImages.filter((f): f is File | string => !!f)
    );
  };

  useEffect(() => {
    if (!noticeList || noticeList.length === 0) {
      handleAddNotice();
    }
  }, [handleAddNotice, noticeList]);

  return (
    <LeftEditorWrapper ariaLabel="공지사항">
      <NavigationBar
        action={
          <UtilityButton
            size="md"
            variant="primary"
            onClick={() => setIsNoticeListOpen(true)}
          >
            항목추가
          </UtilityButton>
        }
        direction="right"
      >
        공지사항
      </NavigationBar>
      <div className="flex flex-col gap-3 w-full">
        <TextField
          label="제목"
          inputProps={{
            placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
            value: title,
            onChange: e => handleUpdateBlock('title', e.target.value),
          }}
          className="text-center"
        />
        {checkedEnglishTitle && (
          <TextField
            label="영문제목"
            inputProps={{
              placeholder: '입력하지 않을 시 기본 문구로 작성됩니다.',
              value: englishTitle,
              onChange: e => handleUpdateBlock('englishTitle', e.target.value),
            }}
            className="text-center w-full pt-1"
          />
        )}
        <section className="flex flex-row gap-2 items-center w-full">
          <Label className="font-semibold">추가기능</Label>
          <Checkbox
            onChange={e =>
              handleUpdateBlock('checkedEnglishTitle', e.target.checked)
            }
            checked={checkedEnglishTitle}
          >
            영문 제목 추가
          </Checkbox>
        </section>
        {(noticeList || []).map((notice, index) => (
          <div key={notice.id} className="flex flex-col">
            {index !== 0 && <Divider />}
            <NoticeItem
              id={id}
              notice={notice}
              noticeLength={noticeList?.length || 0}
              editorResetKey={editorResetKey}
              onNoticeChange={e =>
                handleNoticeChange(notice.id, e.target.value)
              }
              onEditorChange={json =>
                handleNoticeEditorChange(notice.id, json, noticeList || [])
              }
              onPictureChange={file =>
                handleNoticePictureChange(notice.id, file)
              }
              onPictureDelete={() => handleNoticePictureDelete(notice.id)}
              onDelete={() => handleDeleteNotice(notice.id)}
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
