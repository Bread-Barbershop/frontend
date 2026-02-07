import { useMemo } from 'react';

import { EditorBlock } from '@/widgets/editor/store/useEditorStore';

interface Props {
  blockInfo: EditorBlock<'gallery'>;
  className: string;
}

function GalleryPreview({ blockInfo, className }: Props) {
  const preview = useMemo(() => {
    return (blockInfo.props.pictureList ?? []).map(file =>
      URL.createObjectURL(file)
    );
  }, [blockInfo.props.pictureList]);
  console.log('preview', preview);
  console.log('blockInfo', blockInfo);
  return (
    <div className={`w-full ${className}`}>
      <div className="flex flex-col gap-6 py-8 px-5">
        <div className="flex-center flex-col gap-1">
          <p className="text-text-wedding text-[13px] font-semibold">GALLERY</p>
          <p className="text-text-wedding text-[20px] font-semibold">
            {blockInfo.props.title}
          </p>
        </div>
        <div className="w-75 h-31.5 bg-border-neutral flex-center">
          {preview &&
            preview.map((file, index) => <img key={index} src={file} />)}
        </div>
      </div>
    </div>
  );
}
export default GalleryPreview;
