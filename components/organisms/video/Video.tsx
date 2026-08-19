import { useState } from 'react';
import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/atoms/button';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextField } from '@/components/molecules/text-field';
import { useToast } from '@/shared/hooks/useToast';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';
import { compressImages } from '@/shared/utils/imageCompression';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

interface Props {
  blockInfo: EditorBlock<'video'>;
  id: string;
}

const ratioOptions = ['1:1', '3:4', '4:3', '9:16', '16:9'];

export const Video = ({ blockInfo, id }: Props) => {
  const { title, videoUrl, checkThumbnail, checkedSubTitle, subTitle } =
    blockInfo.props;
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const { warning } = useToast();
  const [loadingCount, setLoadingCount] = useState(0);
  const handleUpdateBlock = (key: string, value: string | number | boolean) => {
    updateBlock(id, { [key]: value });
  };
  const handlePictureChange = async (file: (File | string)[]) => {
    const files = file.filter((f): f is File => f instanceof File);
    setLoadingCount(files.length);
    try {
      const compressedFiles = await compressImages(files);
      const compressed = file.map(
        f => compressedFiles[files.indexOf(f as File)] ?? f
      );
      updateBlock(id, { image: compressed });
      updateImage(id, compressed);
    } catch (error) {
      console.error('[Video] 이미지 압축 실패:', error);
      warning('이미지 처리 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setLoadingCount(0);
    }
  };
  const handlePictureDelete = () => {
    updateBlock(id, { image: [] });
    updateImage(id, []);
  };
  return (
    <LeftEditorWrapper className="pb-3" ariaLabel="동영상">
      <NavigationBar className="-mb-2">동영상 편집 페이지</NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '동영상',
          onChange: e => handleUpdateBlock('title', e.target.value || '동영상'),
          value: title === '동영상' ? '' : title,
        }}
        className="w-full py-1.5 text-center"
      />
      {checkedSubTitle && (
        <TextField
          label="영문제목"
          inputProps={{
            placeholder: 'VIDEO',
            value: subTitle === 'VIDEO' ? '' : subTitle,
            onChange: e =>
              handleUpdateBlock(
                'subTitle',
                sanitizeEnglishTitleInput(e.target) || 'VIDEO'
              ),
          }}
          className="w-full py-1.5 text-center"
        />
      )}

      <TextField
        label="URL"
        inputProps={{
          placeholder: 'https://www.youtube.com/',
          onChange: e => handleUpdateBlock('videoUrl', e.target.value),
          value: videoUrl,
        }}
        className="w-full py-1.5 text-center"
      />
      <section className="flex gap-2 w-full py-1.5">
        <Label className="text-center font-semibold">비율</Label>
        <div className="flex w-full justify-between">
          {ratioOptions.map(ratio => (
            <Button
              key={ratio}
              variant="bordered"
              type="button"
              className={cn(
                ratio === blockInfo.props.ratio && 'border-primary',
                'w-12'
              )}
              onClick={() => handleUpdateBlock('ratio', ratio)}
            >
              {ratio}
            </Button>
          ))}
        </div>
      </section>
      <section className="flex gap-2 w-full py-1.5">
        <Label className="text-center font-semibold">추가기능</Label>
        <Checkbox
          checked={checkThumbnail}
          onChange={e => {
            const checked = e.target.checked;
            handleUpdateBlock('checkThumbnail', checked);
          }}
        >
          <span className="text-[13px]">썸네일 이미지 추가</span>
        </Checkbox>
        <Checkbox
          checked={checkedSubTitle}
          onChange={e =>
            handleUpdateBlock('checkedSubTitle', e.target.checked)
          }
        >
          <span className="text-[13px]">영문 제목 추가</span>
        </Checkbox>
      </section>
      {checkThumbnail && (
        <Picture
          label="썸네일"
          className="w-full py-1.5"
          multiple={false}
          value={blockInfo.props.image}
          onChange={file => handlePictureChange(file)}
          onDelete={handlePictureDelete}
          loadingCount={loadingCount}
        />
      )}
      <EditorNoticeList
        notices={[
          {
            id: 'video-youtube-url',
            text: 'URL은 Youtube 링크만 사용 가능합니다.',
          },
        ]}
      />
    </LeftEditorWrapper>
  );
};
