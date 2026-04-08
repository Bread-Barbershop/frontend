import ColorPicker from '@/components/molecules/preview-text-editor/components/ColorPicker';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const BackgroundColor = () => {
  const { setBackgroundColor } = useFabricContext();
  return <ColorPicker onChange={e => setBackgroundColor(e)} />;
};
