import { Image } from '@/components/atoms/image';
import Flower from '@/shared/assets/icons/flower.svg';
import { useBodyFontInfo } from '@/shared/hooks/useBodyFontInfo';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

interface Props {
  member: {
    relation: string;
    name: string;
    image: (File | string)[];
    flower: boolean;
  };
  isGuestPage?: boolean;
}

export const MemberPreview = ({ member, isGuestPage = false }: Props) => {
  const { image, relation, name, flower } = member;
  const { fontFamily } = useBodyFontInfo();
  const preview = useResolvedImageSource(
    image && image.length > 0 ? image[0] : null
  );
  return (
    <>
      {!preview && !isGuestPage && (
        <div className="w-[158.5px] h-[158.5px] rounded-3xl overflow-hidden flex-center bg-border-neutral">
          <p className="text-text-secondary text-sm">사진을 추가해주세요.</p>
        </div>
      )}
      {preview && (
        <div className="w-[158.5px] h-[158.5px] rounded-3xl overflow-hidden">
          <Image src={preview} alt="가족 사진" fill className="object-cover" />
        </div>
      )}
      <p
        className="flex items-center gap-1 text-[16px] font-semibold text-center"
        style={{ fontFamily }}
      >
        {relation} {flower ? <Flower /> : ''} {name}
      </p>
    </>
  );
};
