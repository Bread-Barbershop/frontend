import LargeColorPicker from '@/components/molecules/color-picker/LargeColorPicker';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const BackgroundColor = () => {
  const { backgroundColor, updateBackgroundColor } = useFabricContext();

  return (
    <LargeColorPicker
      value={backgroundColor}
      className="border-none w-full px-0"
      showHeader={false}
      onChange={e => {
        updateBackgroundColor(e.hex);
      }}
    />
  );
};
