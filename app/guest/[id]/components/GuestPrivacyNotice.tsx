import { LockKeyhole } from 'lucide-react';

const labels = {
  photo: '사진',
  video: '영상',
  poster: '메인 포스터',
  location: '장소 정보',
};

export function GuestPrivacyNotice({ kind }: { kind: keyof typeof labels }) {
  return (
    <div className="relative isolate grid min-h-28 place-items-center overflow-hidden bg-stone-100 px-4 py-6 text-center">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-8 -z-10 bg-[radial-gradient(ellipse_at_25%_30%,#ead3cb,transparent_65%),radial-gradient(ellipse_at_75%_70%,#d9e1d7,transparent_65%)] blur-xl"
      />
      <div className="flex flex-col items-center gap-2 rounded-lg bg-white/85 px-4 py-3 text-stone-700">
        <LockKeyhole aria-hidden="true" size={18} />
        <p className="text-sm font-semibold">{labels[kind]} 비공개</p>
        <p className="text-xs">행사일 이후 비공개된 정보예요.</p>
      </div>
    </div>
  );
}
