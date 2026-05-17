import { useEffect, useRef, useState } from 'react';
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

import PopupOptions from '../popup/PopupOptions';
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
  const noticeListTriggerRef = useRef<HTMLDivElement>(null);
  const [editorResetKey, setEditorResetKey] = useState(0);

  const { noticeList, title, checkedEnglishTitle, englishTitle } =
    blockInfo.props;

  const handleUpdateBlock = (key: string, value: string | boolean) => {
    updateBlock(id, { [key]: value });
  };

  const handleNoticeChange = (notice: string | null, noticeId: string) => {
    const newNoticeList = (noticeList || []).map(n =>
      n.id === noticeId
        ? {
            ...n,
            notice,
          }
        : n
    );
    updateBlock(id, { noticeList: newNoticeList });
  };

  const handleNoticeListSelect = (content: string, _index?: number) => {
    const newNotice = {
      id: crypto.randomUUID(),
      notice: content,
      content: {
        messageJson: null,
        messageHtml: null,
      },
      image: [] as (File | string)[],
    };

    updateBlock(id, {
      noticeList: [...(noticeList || []), newNotice],
    });
    setEditorResetKey(prev => prev + 1);
    setIsNoticeListOpen(false);
  };

  const handleNoticeEditorChange = (noticeId: string, json: JSONContent) => {
    const newNoticeList = (noticeList || []).map(notice =>
      notice.id === noticeId
        ? {
            ...notice,
            content: {
              messageJson: json,
              messageHtml: tiptapJsonToHtmlInBrowser(json),
            },
          }
        : notice
    );
    updateBlock(id, { noticeList: newNoticeList });
  };

  const handleNoticePictureChange = (
    noticeId: string,
    file: (File | string)[]
  ) => {
    const newNoticeList = (noticeList || []).map(notice =>
      notice.id === noticeId
        ? {
            ...notice,
            image: file,
          }
        : notice
    );

    updateBlock(id, { noticeList: newNoticeList });
    updateImage(noticeId, file);
  };

  const handleNoticePictureDelete = (noticeId: string) => {
    const newNoticeList = (noticeList || []).map(notice =>
      notice.id === noticeId
        ? {
            ...notice,
            image: [],
          }
        : notice
    );

    updateBlock(id, { noticeList: newNoticeList });
    updateImage(noticeId, []);
  };

  const handleDeleteNotice = (noticeId: string) => {
    const newNoticeList = (noticeList || []).filter(
      notice => notice.id !== noticeId
    );
    updateBlock(id, { noticeList: newNoticeList });
    updateImage(noticeId, []);
  };

  useEffect(() => {
    if ((noticeList || []).length === 0) {
      const initNotice = {
        id: crypto.randomUUID(),
        notice: '',
        content: {
          messageJson: null,
          messageHtml: null,
        },
        image: [] as (File | string)[],
      };
      updateBlock(id, { noticeList: [initNotice] });
    }
  }, [id]);

  return (
    <LeftEditorWrapper ariaLabel="공지사항" className="gap-3 pb-3">
      <NavigationBar
        action={
          <div ref={noticeListTriggerRef}>
            <UtilityButton
              size="md"
              variant="primary"
              onClick={() => setIsNoticeListOpen(true)}
            >
              항목추가
            </UtilityButton>
          </div>
        }
        direction="right"
      >
        공지사항 편집 페이지
      </NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '공지사항',
          value: title === '공지사항' ? '' : title,
          onChange: e =>
            handleUpdateBlock('title', e.target.value || '공지사항'),
        }}
        className="w-full text-center"
      />
      {checkedEnglishTitle && (
        <TextField
          label="영문제목"
          inputProps={{
            placeholder: 'INFORMATION',
            value: englishTitle === 'INFORMATION' ? '' : englishTitle,
            onChange: e =>
              handleUpdateBlock(
                'englishTitle',
                e.target.value || 'INFORMATION'
              ),
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

      <div className="flex flex-col gap-2 w-full">
        {(noticeList || []).map((notice, index) => (
          <div key={notice.id} className="flex flex-col gap-1">
            {index !== 0 && <Divider />}
            <NoticeItem
              id={id}
              notice={notice}
              noticeLength={(noticeList || []).length}
              editorResetKey={editorResetKey}
              onNoticeChange={e =>
                handleNoticeChange(e.target.value, notice.id)
              }
              onEditorChange={json => handleNoticeEditorChange(notice.id, json)}
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
        <PopupOptions
          popupTitle="항목 추가"
          options={NOTICE_LIST}
          onSelect={handleNoticeListSelect}
          onClose={() => setIsNoticeListOpen(false)}
          triggerRef={noticeListTriggerRef}
          listClassName="justify-center items-center"
          textClassName="bg-bg-sub rounded-xl flex items-center px-4 h-13"
        />
      )}
    </LeftEditorWrapper>
  );
};
