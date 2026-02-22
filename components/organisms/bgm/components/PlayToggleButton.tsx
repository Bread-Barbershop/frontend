import Image from 'next/image';

interface PlayToggleButtonProps {
  isPlaying: boolean;
  onToggle: () => void;
}

export const PlayToggleButton = ({ isPlaying, onToggle }: PlayToggleButtonProps) => {
  return (
    <button type="button" className="shrink-0" onClick={onToggle}>
      {isPlaying ? (
        <Image
          src="/assets/icons/pause.svg"
          alt="정지"
          width={32}
          height={32}
        />
      ) : (
        <Image src="/assets/icons/play.svg" alt="재생" width={32} height={32} />
      )}
    </button>
  );
};