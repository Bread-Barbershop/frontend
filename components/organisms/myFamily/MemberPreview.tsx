import { Image } from '@/components/atoms/image';
import { useResolvedImageSource } from '@/shared/hooks/useResolvedImageSource';

interface Props {
  member: {
    relation: string;
    name: string;
    image: (File | string)[];
  };
}

export const MemberPreview = ({ member }: Props) => {
  const { image, relation, name } = member;
  const preview = useResolvedImageSource(
    image && image.length > 0 ? image[0] : null
  );
  return (
    <>
      {preview && (
        <div className="w-[158.5px] h-[158.5px] rounded-6 overflow-hidden">
          <Image src={preview} alt="가족 사진" fill className="object-cover" />
        </div>
      )}
      <p className="text-[16px] font-semibold text-center">
        {relation} {name}
      </p>
    </>
  );
};
