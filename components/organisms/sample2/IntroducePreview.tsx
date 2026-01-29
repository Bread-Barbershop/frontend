import { EditorBlock } from '@/widgets/editor/store/useEditorStore';

interface Props {
  blockInfo: EditorBlock<'introduce'>;
  className: string;
}

function IntroducePreview({ blockInfo, className, ...rest }: Props) {
  return (
    <div className={`flex flex-col gap-6 px-5 py-8 ${className}`} {...rest}>
      <div className="flex flex-col items-center">
        <p className="text-text-wedding font-semibold text-[13px]">
          INTRODUCTION
        </p>
        <p className="text-text-wedding font-semibold text-2xl">
          {blockInfo.props.title?.content}
        </p>
      </div>
      <div className="flex gap-4.5 justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="flex-center w-[158.5px] h-[159.5px] bg-border-neutral rounded-3xl">
            사진을 추가해 주세요
          </div>
          <p>{blockInfo.props.groom}</p>
        </div>
        <div className="flex flex-col items-center gap-4">
          <div className="flex-center w-[158.5px] h-[159.5px] bg-border-neutral rounded-3xl">
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
