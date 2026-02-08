import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { componentCls } from '@/shared/samples/componentSample';

import { EditorBlock } from '../../store/useEditorStore';

interface Props {
  id: string;
  blockInfo: EditorBlock;
  className: string;
}

function SortableItems({ id, blockInfo, className }: Props) {
  const { setNodeRef, attributes, listeners, transform, transition } =
    useSortable({ id });
  const array = componentCls.find(items => items.english === blockInfo.type);
  const componentName = array?.list.find(
    item => item.component === blockInfo.component
  );

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };
  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`text-sm font-normal rounded-sm flex-center w-24 h-6 cursor-grab ${className}`}
    >
      {componentName?.contents}
    </li>
  );
}
export default SortableItems;
