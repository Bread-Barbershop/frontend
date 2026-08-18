import { JSONContent } from '@tiptap/core';
import { useCallback, useEffect, useState, ChangeEvent } from 'react';
import { useShallow } from 'zustand/shallow';

import { UtilityButton } from '@/components/atoms/button';
import { Divider } from '@/components/atoms/divider/Divider';
import { Label } from '@/components/atoms/label/Label';
import { Checkbox } from '@/components/molecules/checkbox/Checkbox';
import { EditorNoticeList } from '@/components/molecules/editor-notice';
import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { tiptapJsonToHtmlInBrowser } from '@/components/molecules/text-editor/utils/tiptapJsonToHtml';
import { TextField } from '@/components/molecules/text-field';
import { useToast } from '@/shared/hooks/useToast';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';
import { EditorBlock } from '@/shared/types/block';
import { compressImages } from '@/shared/utils/imageCompression';
import { sanitizeEnglishTitleInput } from '@/shared/utils/stringUtils';

import { LeftEditorWrapper } from '../wrapper/LeftEditorWrapper';

import { Information } from './Information';

interface Props {
  blockInfo: EditorBlock<'speakerInformation'>;
  id: string;
}

interface Speaker {
  id: string;
  name: string;
  messageJson: JSONContent | null;
  messageHtml: string | null;
  image: (File | string)[];
}

export const SpeakerInformation = ({ blockInfo, id }: Props) => {
  const { updateBlock, updateImage } = useEditorStore(
    useShallow(state => ({
      updateBlock: state.updateBlock,
      updateImage: state.updateImage,
    }))
  );
  const { warning } = useToast();
  // 연사 id별로 독립적으로 로딩 상태를 추적한다.
  // 단일 pendingUpload 값으로 관리하면 여러 연사의 이미지를 연달아
  // 업로드할 때 나중 업로드가 이전 업로드의 로딩 상태를 덮어써서
  // 이미지가 실제로 들어오기 전에 스피너가 먼저 사라지는 문제가 생긴다.
  const [loadingSpeakers, setLoadingSpeakers] = useState<Map<string, number>>(
    new Map()
  );
  const setSpeakerLoading = (speakerId: string, count: number) => {
    setLoadingSpeakers(prev => {
      const next = new Map(prev);
      if (count > 0) {
        next.set(speakerId, count);
      } else {
        next.delete(speakerId);
      }
      return next;
    });
  };
  const { speakers, title, checkedSubTitle, subTitle } =
    blockInfo.props;

  const handleEditorChange = useCallback(
    (speakerId: string, json: JSONContent, speakers: Speaker[]) => {
      updateBlock(id, {
        speakers: speakers.map(speaker =>
          speaker.id === speakerId
            ? {
                ...speaker,
                messageJson: json,
                messageHtml: tiptapJsonToHtmlInBrowser(json),
              }
            : speaker
        ),
      });
    },
    [id, updateBlock]
  );

  const handleValueChange = (
    key: 'title' | 'subTitle',
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const fallback = key === 'title' ? '연사정보' : 'SPEAKER INFORMATION';
    const value =
      key === 'subTitle'
        ? sanitizeEnglishTitleInput(e.target)
        : e.target.value;

    updateBlock(id, { [key]: value || fallback });
  };

  const handleCheckedChange = (e: ChangeEvent<HTMLInputElement>) => {
    updateBlock(id, { checkedSubTitle: e.target.checked });
  };

  const handleSpeakerNameChange = (
    speakerId: string,
    e: ChangeEvent<HTMLInputElement>
  ) => {
    const newItems = (speakers || []).map(speaker =>
      speaker.id === speakerId ? { ...speaker, name: e.target.value } : speaker
    );
    updateBlock(id, { speakers: newItems });
  };

  const handlePictureChange = async (
    speakerId: string,
    file: (File | string)[]
  ) => {
    const files = file.filter((f): f is File => f instanceof File);
    setSpeakerLoading(speakerId, files.length);
    try {
      const compressedFiles = await compressImages(files);
      const compressed = file.map(
        f => compressedFiles[files.indexOf(f as File)] ?? f
      );

      // await 이후에는 렌더 시점 클로저(speakers)가 stale할 수 있으므로
      // 최신 store 상태를 다시 읽어서 병합한다. 그렇지 않으면 두 연사의
      // 이미지가 동시에 처리될 때 나중에 끝난 쪽이 먼저 끝난 쪽의 결과를
      // 낡은 배열로 덮어써 이미지가 사라진다.
      const latestBlock = useEditorStore.getState()
        .block as EditorBlock<'speakerInformation'>[];
      const latestSpeakers = latestBlock.find(b => b.id === id)?.props
        .speakers ?? [];
      const newSpeakers = latestSpeakers.map(speaker =>
        speaker.id === speakerId ? { ...speaker, image: compressed } : speaker
      );

      updateBlock(id, {
        speakers: newSpeakers,
      });
      updateImage(speakerId, compressed);
    } catch (error) {
      console.error('[SpeakerInformation] 이미지 압축 실패:', error);
      warning('이미지 처리 중 문제가 발생했어요. 다시 시도해주세요.');
    } finally {
      setSpeakerLoading(speakerId, 0);
    }
  };
  const handlePictureDelete = (speakerId: string) => {
    const newSpeakers = (speakers || []).map(speaker =>
      speaker.id === speakerId ? { ...speaker, image: [] } : speaker
    );

    updateBlock(id, {
      speakers: newSpeakers,
    });
    updateImage(speakerId, []);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const handleAddSpeaker = () => {
    const newSpeaker = {
      id: crypto.randomUUID(),
      name: '',
      messageJson: null,
      messageHtml: null,
      image: [],
    };
    const newSpeakers = [...(speakers || []), newSpeaker];
    updateBlock(id, {
      speakers: newSpeakers,
    });
  };

  const handleDeleteSpeaker = (speakerId: string) => {
    const newSpeakers = (speakers || []).filter(
      speaker => speaker.id !== speakerId
    );
    const newImages = newSpeakers.map(s => s.image[0]);

    updateBlock(id, {
      speakers: newSpeakers,
      images: newImages,
    });
    updateImage(speakerId, []);
  };

  useEffect(() => {
    if (!speakers || speakers.length === 0) {
      handleAddSpeaker();
    }
  }, [handleAddSpeaker, speakers]);

  return (
    <LeftEditorWrapper ariaLabel="연사 정보" className="pb-3">
      <NavigationBar
        action={
          <UtilityButton size="md" variant="primary" onClick={handleAddSpeaker}>
            추가
          </UtilityButton>
        }
        direction="right"
      >
        연사정보 편집 페이지
      </NavigationBar>
      <div className="flex flex-col gap-1 w-full">
        <TextField
          label="제목"
          inputProps={{
            placeholder: '연사정보',
            value: title === '연사정보' ? '' : title,
            onChange: e => handleValueChange('title', e),
          }}
          className="w-full py-1.5 text-center"
        />
        {checkedSubTitle && (
          <TextField
            label="영문제목"
            inputProps={{
              placeholder: 'SPEAKER INFORMATION',
              value: subTitle === 'SPEAKER INFORMATION' ? '' : subTitle,
              onChange: e => handleValueChange('subTitle', e),
            }}
            className="w-full py-1.5 text-center"
          />
        )}
      </div>
      {speakers?.map((speaker, index) => (
        <section
          key={`${speaker.id}-${index}`}
          className="w-full flex flex-col gap-1"
        >
          {index !== 0 && <Divider className="w-full" />}
          <Information
            speakerLength={speakers?.length}
            id={speaker.id}
            speaker={speaker}
            onStringChange={(_type, e) =>
              handleSpeakerNameChange(speaker.id, e)
            }
            onEditorChange={json =>
              handleEditorChange(speaker.id, json, speakers || [])
            }
            onPictureChange={file => handlePictureChange(speaker.id, file)}
            onPictureDelete={() => handlePictureDelete(speaker.id)}
            onDelete={() => handleDeleteSpeaker(speaker.id)}
            loadingCount={loadingSpeakers.get(speaker.id) ?? 0}
          />
        </section>
      ))}
      <section className="flex items-center gap-2 w-full py-1.5">
        <Label className="font-semibold">추가기능</Label>

        <Checkbox checked={checkedSubTitle} onChange={handleCheckedChange}>
          <span className="text-[13px]">영문 제목 추가</span>
        </Checkbox>
      </section>
      <EditorNoticeList
        notices={[
          {
            id: 'speaker-animation',
            text: '항목이 2개 이상일 경우, 애니메이션 효과가 적용됩니다.',
          },
        ]}
      />
    </LeftEditorWrapper>
  );
};
