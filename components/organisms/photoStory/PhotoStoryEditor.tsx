'use client';

import { arrayMove } from '@dnd-kit/sortable';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useMemo } from 'react';

import { UtilityButton } from '@/components/atoms/button';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture';
import { TextField } from '@/components/molecules/text-field/TextField';
import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import type { EditorBlock } from '@/shared/types/block';
import { compressImage } from '@/shared/utils/imageCompression';

import {
  createPhotoStoryPage,
  readPhotoStoryPages,
  type PhotoStoryPage,
} from './PhotoStory.schema';

interface Props {
  id: string;
  blockInfo: EditorBlock<'photoStory'>;
}

export function PhotoStoryEditor({ id, blockInfo }: Props) {
  const { title } = blockInfo.props;
  const pages = useMemo(
    () => readPhotoStoryPages(blockInfo.props.pages),
    [blockInfo.props.pages]
  );
  const updateBlock = useEditorStore(state => state.updateBlock);
  const updateImage = useEditorStore(state => state.updateImage);
  const setPages = (next: PhotoStoryPage[]) =>
    updateBlock<'photoStory'>(id, { pages: next });

  function changePage(pageId: string, changes: Partial<PhotoStoryPage>) {
    setPages(
      pages.map(page => (page.id === pageId ? { ...page, ...changes } : page))
    );
  }

  function setPhoto(
    pageId: string,
    image: PhotoStoryPage['image'],
    expected?: File
  ) {
    const block = useEditorStore
      .getState()
      .block.find(
        (block): block is EditorBlock<'photoStory'> =>
          block.id === id && block.component === 'photoStory'
      );
    const latest = readPhotoStoryPages(block?.props.pages);
    const current = latest.find(page => page.id === pageId);
    if (!current || (expected && current.image[0] !== expected)) return;
    setPages(
      latest.map(page => (page.id === pageId ? { ...page, image } : page))
    );
    updateImage(pageId, image);
  }

  async function changePhoto(pageId: string, image: PhotoStoryPage['image']) {
    setPhoto(pageId, image);
    const original = image[0];
    if (!(original instanceof File)) return;
    const compressed = await compressImage(original);
    if (compressed !== original) setPhoto(pageId, [compressed], original);
  }

  return (
    <LeftEditorWrapper ariaLabel="한 장 이야기">
      <NavigationBar
        direction="right"
        action={
          <UtilityButton
            size="md"
            onClick={() => setPages([...pages, createPhotoStoryPage()])}
          >
            장 추가
          </UtilityButton>
        }
      >
        한 장 이야기 편집
      </NavigationBar>
      <TextField
        label="제목"
        className="w-full py-1.5"
        inputProps={{
          value: title,
          placeholder: '한 장 이야기',
          onChange: event =>
            updateBlock<'photoStory'>(id, { title: event.target.value }),
        }}
      />
      {pages.map((page, index) => (
        <fieldset
          key={page.id}
          aria-label={`${index + 1}번째 장`}
          className="flex w-full min-w-0 flex-col gap-2 border-t border-border-divider py-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">{index + 1}번째 장</span>
            <div className="flex items-center gap-1">
              <UtilityButton
                aria-label={`${index + 1}번째 장 앞으로`}
                disabled={index === 0}
                onClick={() => setPages(arrayMove(pages, index, index - 1))}
              >
                <ChevronUp size={16} />
              </UtilityButton>
              <UtilityButton
                aria-label={`${index + 1}번째 장 뒤로`}
                disabled={index === pages.length - 1}
                onClick={() => setPages(arrayMove(pages, index, index + 1))}
              >
                <ChevronDown size={16} />
              </UtilityButton>
              <UtilityButton
                variant="danger"
                aria-label={`${index + 1}번째 장 삭제`}
                onClick={() => {
                  setPages(pages.filter(item => item.id !== page.id));
                  updateImage(page.id, []);
                }}
              >
                삭제
              </UtilityButton>
            </div>
          </div>
          <Picture
            label="사진"
            multiple={false}
            value={page.image}
            onChange={files => changePhoto(page.id, files.slice(0, 1))}
            onDelete={() => changePhoto(page.id, [])}
          />
          <TextField
            label="날짜"
            inputProps={{
              type: 'date',
              value: page.date,
              onChange: event =>
                changePage(page.id, { date: event.target.value }),
            }}
          />
          <TextField
            label="장 제목"
            inputProps={{
              value: page.heading,
              placeholder: '기억하고 싶은 순간',
              onChange: event =>
                changePage(page.id, { heading: event.target.value }),
            }}
          />
          <TextField
            label="짧은 글"
            inputProps={{
              value: page.caption,
              placeholder: '사진에 담긴 이야기를 적어 주세요.',
              onChange: event =>
                changePage(page.id, { caption: event.target.value }),
            }}
          />
        </fieldset>
      ))}
    </LeftEditorWrapper>
  );
}
