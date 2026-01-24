import { EditorBlock } from '@/features/editor/store/useEditorStore';

interface Props {
  blockInfo: EditorBlock<'weddingDay'>;
}

function WeddingPreview({ blockInfo }: Props) {
  console.log('blockInfo', blockInfo);
  return (
    <div className="w-full flex flex-col items-center gap-8">
      <div className="flex flex-col items-center">
        <p className="text-[#FA7564] text-[13px] font-semibold">
          THE WEDDING CEREMONY
        </p>
        <h2 className="text-[#FA7564] text-sm font-extrabold">예식 일시</h2>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-[13px]">{blockInfo.props.weddingDay}</p>
        <p className="text-[13px]">{blockInfo.props.weddingTime}</p>
      </div>
    </div>
  );
}
export default WeddingPreview;
