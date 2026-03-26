import { LeftEditorWrapper } from '@/components/organisms/wrapper/LeftEditorWrapper';

import BackGroundEdit from './BackGroundEdit';
import BodyEdit from './BodyEdit';
import TitleEdit from './TitleEdit';

function BulkEdit() {
  return (
    <div className="w-full bg-white rounded-b-lg shadow-edit border border-t-0 border-black/5 transition-all duration-300 ease-in-out">
      <LeftEditorWrapper className="w-full">
        <TitleEdit />
        <BodyEdit />
        <BackGroundEdit />
      </LeftEditorWrapper>
    </div>
  );
}

export default BulkEdit;
