import * as fabric from 'fabric';
import Image from 'next/image';

// import { Selector } from '@/components/molecules/selector';
import alignCenter from '@/shared/assets/icons/alignCenter.svg';
import alignLeft from '@/shared/assets/icons/alignLeft.svg';
import alignRight from '@/shared/assets/icons/alignRight.svg';

// type alignOption = {
//   label: React.ReactNode;
//   value: string;
//   style: { textAlign: 'left' | 'center' | 'right' };
// };
type alignOptionMobile = {
  label: string;
  value: string;
  style: { textAlign: 'left' | 'center' | 'right' };
};

interface Props {
  canvas: fabric.Canvas | null;
  applyRichStyle: (styleObj: object, canvas: fabric.Canvas) => void;
}
function TextAlign({ canvas, applyRichStyle }: Props) {
  // const [selectedAlign, setSelectedAlign] = useState<{
  //   label: React.ReactNode;
  //   value: string;
  //   style: { textAlign: 'left' | 'center' | 'right' };
  // }>();
  const alignOptionsMobile: alignOptionMobile[] = [
    {
      label: alignLeft,
      value: 'left',
      style: { textAlign: 'left' },
    },
    {
      label: alignCenter,
      value: 'center',
      style: { textAlign: 'center' },
    },
    {
      label: alignRight,
      value: 'right',
      style: { textAlign: 'right' },
    },
  ];
  // const alignOptions: alignOption[] = [
  //   {
  //     label: <Image src={alignLeft} alt="left" width={14} height={14} />,
  //     value: 'left',
  //     style: { textAlign: 'left' },
  //   },
  //   {
  //     label: <Image src={alignCenter} alt="center" width={14} height={14} />,
  //     value: 'center',
  //     style: { textAlign: 'center' },
  //   },
  //   {
  //     label: <Image src={alignRight} alt="right" width={14} height={14} />,
  //     value: 'right',
  //     style: { textAlign: 'right' },
  //   },
  // ];

  if (!canvas) return;
  return (
    <section>
      {/* <div className="hidden md:flex">
        <Selector
          placeholder="16px"
          options={alignOptions}
          className="bg-bg-base flex items-center justify-center"
          onSelect={option => {
            const alignOption = option as alignOption;
            applyRichStyle(alignOption.style, canvas);
            setSelectedAlign(alignOption);
          }}
          selected={selectedAlign ?? alignOptions[0]}
        />
      </div>
      <div className="md:hidden flex flex-row gap-5"> */}
      <div className="flex flex-row gap-5">
        {alignOptionsMobile.map(align => {
          const { label, value, style } = align;
          return (
            <button
              key={value}
              type="button"
              onClick={() => applyRichStyle({ ...style }, canvas)}
              className="w-8 h-8 flex p-2.25 justify-center items-center bg-bg-base text-text-primary enabled:hover:bg-btn-hover enabled:active:bg-btn-pressed disabled:text-btn-disabled rounded-sm"
            >
              <Image src={label} alt={value} width={16} height={12} />
            </button>
          );
        })}
      </div>
    </section>
  );
}
export default TextAlign;
