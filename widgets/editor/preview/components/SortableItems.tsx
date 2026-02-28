import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { componentCls } from '@/shared/data/componentsInfo/componentInfo';
import { EditorBlock } from '@/shared/types/block';
import { cn } from '@/shared/utils/cn';

interface Props {
  id: string;
  blockInfo: EditorBlock;
  className?: string;
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
      className={cn('flex-center  px-3 py-2 cursor-pointer', className)}
    >
      {componentName?.contents}
    </li>
  );
}

export default SortableItems;
