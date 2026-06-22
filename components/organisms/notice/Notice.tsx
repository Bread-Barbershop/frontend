import { useEffect, useRef, useState } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import PopupOptions from '../popup/PopupOptions';
import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { NoticeItem } from './NoticeItem';
import { createNoticeItem, NOTICE_LIST } from './noticeList';

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
  const noticeItemRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const pendingScrollNoticeIdRef = useRef<string | null>(null);
  const [editorResetKey, setEditorResetKey] = useState(0);

  const { noticeList, title, checkedEnglishTitle, englishTitle } =
    blockInfo.props;

  const handleUpdateBlock = (key: string, value: string | boolean) => {
    updateBlock(id, { [key]: value });
  };

  const handleNoticeChange = (notice: string, noticeId: string) => {
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
    const nextNotice = createNoticeItem(content);

    updateBlock(id, {
      noticeList: [...(noticeList || []), nextNotice],
    });
    pendingScrollNoticeIdRef.current = nextNotice.id;
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
      updateBlock(id, { noticeList: [createNoticeItem()] });
    }
  }, [id]);

  useEffect(() => {
    const pendingNoticeId = pendingScrollNoticeIdRef.current;
    if (!pendingNoticeId) return;

    const target = noticeItemRefs.current[pendingNoticeId];
    if (!target) return;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    pendingScrollNoticeIdRef.current = null;
  }, [noticeList]);

  return (
    <LeftEditorWrapper ariaLabel="공지사항" className="pb-3">
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
        className="w-full py-1.5 text-center"
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
                sanitizeEnglishTitleInput(e.target) || 'INFORMATION'
              ),
          }}
          className="w-full py-1.5 text-center"
        />
      )}
      <section className="flex flex-row gap-2 items-center w-full py-1.5">
        <Label className="font-semibold">추가기능</Label>
        <Checkbox
          onChange={e =>
            handleUpdateBlock('checkedEnglishTitle', e.target.checked)
          }
          checked={checkedEnglishTitle}
        >
          <span className="text-[13px]">영문 제목 추가</span>
        </Checkbox>
      </section>

      <div className="flex flex-col gap-1 w-full">
        {(noticeList || []).map((notice, index) => (
          <div
            key={notice.id}
            ref={element => {
              noticeItemRefs.current[notice.id] = element;
            }}
            className="flex flex-col gap-1"
          >
            {index !== 0 && <Divider className="w-full" />}
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
      <EditorNoticeList
        notices={[
          {
            id: 'notice-default-image',
            text: '배너사진을 추가하지 않으실 경우, 기본 이미지로 제공됩니다.',
            colorClass: 'text-[#1F72EF]',
          },
          {
            id: 'notice-animation',
            text: '항목이 2개 이상일 경우, 애니메이션 효과가 적용됩니다.',
          },
        ]}
      />

      {isNoticeListOpen && (
        <PopupOptions
          popupTitle="항목 추가"
          options={NOTICE_LIST}
          onSelect={handleNoticeListSelect}
          onClose={() => setIsNoticeListOpen(false)}
          triggerRef={noticeListTriggerRef}
        />
      )}
    </LeftEditorWrapper>
  );
};
