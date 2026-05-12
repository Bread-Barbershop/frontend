import { useShallow } from 'zustand/react/shallow';

import { Button } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider/Divider';
import { Label } from '@/components/atoms/label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { Picture } from '@/components/molecules/picture/Picture';
import { TextField } from '@/components/molecules/text-field';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

interface Props {
  blockInfo: EditorBlock<'video'>;
  id: string;
}

const ratioOptions = ['1:1', '3:4', '4:3', '9:16', '16:9'];

export const Video = ({ blockInfo, id }: Props) => {
  const { title, videoUrl, checkThumbnail, checkedEnglishTitle, englishTitle } =
    blockInfo.props;
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const handleUpdateBlock = (key: string, value: string | number | boolean) => {
    updateBlock(id, { [key]: value });
  };
  const handlePictureChange = (file: (File | string)[]) => {
    updateBlock(id, { image: file });
    updateImage(id, file);
  };
  const handlePictureDelete = () => {
    updateBlock(id, { image: [] });
    updateImage(id, []);
  };
  return (
    <LeftEditorWrapper className="gap-4 pb-3" ariaLabel="동영상">
      <NavigationBar className="-mb-2">동영상 편집 페이지</NavigationBar>
      <TextField
        label="제목"
        inputProps={{
          placeholder: '제목을 입력해 주세요.',
          onChange: e =>
            handleUpdateBlock(
              'title',
              e.target.value || '제목을 입력해 주세요.'
            ),
          value: title === '제목을 입력해 주세요.' ? '' : title,
        }}
        className="w-full text-center"
      />
      {checkedEnglishTitle && (
        <TextField
          label="영문제목"
          inputProps={{
            placeholder: 'VIDEO',
            value: englishTitle === 'VIDEO' ? '' : englishTitle,
            onChange: e =>
              handleUpdateBlock('englishTitle', e.target.value || 'VIDEO'),
          }}
          className="text-center w-full"
        />
      )}
      <Divider className="w-full" />
      <TextField
        label="URL"
        inputProps={{
          placeholder: 'https://www.youtube.com/',
          onChange: e => handleUpdateBlock('videoUrl', e.target.value),
          value: videoUrl,
        }}
        className="w-full text-center"
      />
      <section className="flex gap-2 w-full">
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
      <section className="flex gap-2 w-full">
        <Label className="text-center font-semibold">추가기능</Label>
        <Checkbox
          className="text-[13px]"
          checked={checkThumbnail}
          onChange={e => {
            const checked = e.target.checked;
            handleUpdateBlock('checkThumbnail', checked);
          }}
        >
          썸네일 이미지 추가
        </Checkbox>
        <Checkbox
          className="text-[13px]"
          checked={checkedEnglishTitle}
          onChange={e =>
            handleUpdateBlock('checkedEnglishTitle', e.target.checked)
          }
        >
          영문 제목 추가
        </Checkbox>
      </section>
      {checkThumbnail && (
        <Picture
          label="썸네일"
          className="w-full"
          multiple={false}
          value={blockInfo.props.image}
          onChange={file => handlePictureChange(file)}
          onDelete={handlePictureDelete}
        />
      )}
    </LeftEditorWrapper>
  );
};
