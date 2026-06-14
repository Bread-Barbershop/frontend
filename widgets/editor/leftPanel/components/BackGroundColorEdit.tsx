import { NavigationBar } from '@/components/molecules/navigation-bar/NavigationBar';
import { useEditorStore } from '@/shared/store/editorStore/useEditorStore';

const BACKGROUND_COLOR = [
  '#FFF6DF',
  '#F9E1D2',
  '#FFF1B8',
  '#F6CDC4',
  '#F8DDE3',
  '#F0E4F5',
  '#E6DDF4',
  '#F8F3EA',
  '#EFE4D6',
  '#DDE8D5',
  '#DDF2EA',
  '#DDEDF7',
  '#D7E3F4',
  '#FFFFFF',
];

function BackGroundColorEdit() {
  const setBackgroundColor = useEditorStore(state => state.setBackgroundColor);
  return (
    <div className="w-full">
      <NavigationBar>배경 편집</NavigationBar>
      <div className="w-full grid grid-cols-7 grid-rows-2 gap-x-[18.5px] gap-y-3">
        {BACKGROUND_COLOR.map((value, index) => (
          <button
            key={value + index}
            type="button"
            style={{ backgroundColor: value }}
            className={` w-8 h-8 rounded-lg border border-[#EAEAEA] cursor-pointer`}
            onClick={() => {
              setBackgroundColor(value);
            }}
          ></button>
        ))}
      </div>
    </div>
  );
}
export default BackGroundColorEdit;
