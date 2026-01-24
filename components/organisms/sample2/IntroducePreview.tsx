import { EditorBlock } from '@/features/editor/store/useEditorStore';

interface Props {
  blockInfo: EditorBlock<'introduce'>;
}

function IntroducePreview({ blockInfo }: Props) {
  return (
    <div className="flex flex-col gap-6 px-5 py-8">
      <div className="flex flex-col items-center">
        <p className="text-[#FA7564] font-semibold text-[13px]">INTRODUCTION</p>
        <p className="text-[#FA7564] font-semibold text-2xl">
          {blockInfo.props.title}
        </p>
      </div>
      <div className="flex gap-4.5">
        <div className="flex flex-col items-center gap-4">
          <div className="w-[158.5px] h-[159.5px] bg-[#EAEAEA] rounded-3xl flex items-center justify-center">
            사진을 추가해 주세요
          </div>
          <p>{blockInfo.props.groom}</p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="w-[158.5px] h-[159.5px] bg-[#EAEAEA] rounded-3xl flex items-center justify-center">
            사진을 추가해 주세요
          </div>
          <p>{blockInfo.props.bride}</p>
        </div>
      </div>
      <div className="flex justify-center">
        <p>{blockInfo.props.additionalContents}</p>
      </div>
    </div>
  );
}
export default IntroducePreview;
