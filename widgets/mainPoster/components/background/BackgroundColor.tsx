import LargeColorPicker from '@/components/molecules/color-picker/LargeColorPicker';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const BackgroundColor = () => {
  const { setBackgroundColor } = useFabricContext();
  return (
    <LargeColorPicker
      className="border-none w-full px-0"
      showHeader={false}
      onChange={e => setBackgroundColor(e.hex)}
    />
  );
};
