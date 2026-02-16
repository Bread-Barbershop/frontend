/**
 * 오디오 URL의 메타데이터를 읽어 재생 길이(초)를 반환한다.
 */
export const getAudioDurationFromUrl = (url: string) =>
  new Promise<number>((resolve, reject) => {
    const audio = new Audio();

    const cleanup = () => {
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('error', onError);
      audio.src = '';
    };

    const onLoadedMetadata = () => {
      const duration = audio.duration;
      cleanup();

      if (Number.isFinite(duration)) {
        resolve(duration);
        return;
      }

      reject(new Error('Invalid audio duration'));
    };

    const onError = () => {
      cleanup();
      reject(new Error('Failed to load audio metadata'));
    };

    audio.preload = 'metadata';
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('error', onError);
    audio.src = url;
  });
