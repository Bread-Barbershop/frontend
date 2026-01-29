import { UtilityButton } from '@/components/atoms/button';
import { componentCls } from '@/shared/samples/componentSample';
interface Props {
  active: string;
  tabClick: (english: string) => void;
  closeClick: () => void;
}
function TabArea({ active, tabClick, closeClick }: Props) {
  return (
    <div className="flex justify-between items-center px-5">
      <ul className="flex">
        {componentCls.map((items, index) => (
          <li
            key={index}
            className={`w-19 h-11 flex-center font-semibold text-sm ${active === items.english ? 'text-text-primary border-b' : 'text-text-secondary border-0'}`}
            onClick={() => tabClick(items.english)}
          >
            {items.korea}
          </li>
        ))}
      </ul>
      <UtilityButton
        variant={'danger'}
        className="font-semibold text-sm"
        onClick={closeClick}
      >
        닫기
      </UtilityButton>
    </div>
  );
}
export default TabArea;
