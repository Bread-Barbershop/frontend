import LargeColorPicker from '@/components/molecules/color-picker/LargeColorPicker';
import { useFabricContext } from '@/widgets/mainPoster/context/FabricContext';

export const BackgroundColor = () => {
  const { backgroundColor, updateBackgroundColor } = useFabricContext();

  return (
    <LargeColorPicker
      value={backgroundColor}
      className="border-none pl-1 pr-0.5"
      showHeader={false}
      onChange={e => {
        updateBackgroundColor(e);
      }}
    />
  );
};
