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
}

export const MemberPreview = ({ member }: Props) => {
  const { image, relation, name, flower } = member;
  const { fontFamily } = useBodyFontInfo();
  const preview = useResolvedImageSource(
    image && image.length > 0 ? image[0] : null
  );
  return (
    <>
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
