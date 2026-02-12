export interface BgmItem {
  id: string;
  title: string;
  duration: string;
  src: string;
}

export const BGM_LIST: BgmItem[] = [
  {
    id: 'quiet-step-to-forever',
    title: 'A Quiet Step to Forever',
    duration: '03:52',
    src: '/audios/a-quiet-step-to-forever.mp3',
  },
  {
    id: 'before-the-first-light',
    title: 'Before the First Light',
    duration: '02:12',
    src: '/audios/before-the-first-light.mp3',
  },
  {
    id: 'honey-in-blue',
    title: 'Honey in Blue',
    duration: '01:40',
    src: '/audio/honey-in-blue.mp3',
  },
  {
    id: 'in-the-arms-of-a-violin',
    title: 'In the Arms of a Violin',
    duration: '02:17',
    src: '/audio/in-the-arms-of-a-violin.mp3',
  },
  {
    id: 'memory-in-motion',
    title: 'Memory in Motion',
    duration: '02:06',
    src: '/audio/memory-in-motion.mp3',
  },
  {
    id: 'slow-burn-tonight',
    title: 'Slow Burn Tonight',
    duration: '01:42',
    src: '/audio/slow-burn-tonight.mp3',
  },
  {
    id: 'softly-we-begin',
    title: 'Softly, We Begin',
    duration: '02:02',
    src: '/audio/softly-we-begin.mp3',
  },
  {
    id: 'toward-tomorrow',
    title: 'Toward Tomorrow',
    duration: '02:54',
    src: '/audio/toward-tomorrow.mp3',
  },
];
