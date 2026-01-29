import { EditorBlock } from '@/widgets/editor/store/useEditorStore';

interface Props {
  blockInfo: EditorBlock<'weddingDay'>;
  className: string;
}

function WeddingPreview({ blockInfo, className, ...rest }: Props) {
  console.log('blockInfo', blockInfo);
  return (
    <div
      className={`w-full flex flex-col items-center gap-8 py-8 px-5 ${className}`}
      {...rest}
    >
      <div className="flex flex-col items-center">
        <p className="text-text-wedding text-[13px] font-semibold">
          THE WEDDING CEREMONY
        </p>
        <h2 className="text-text-wedding text-sm font-extrabold">예식 일시</h2>
      </div>
      <div className="flex flex-col items-center">
        <p className="text-[13px]">{blockInfo.props.weddingDay}</p>
        <p className="text-[13px]">{blockInfo.props.weddingTime}</p>
      </div>
    </div>
  );
}
export default WeddingPreview;
