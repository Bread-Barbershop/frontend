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
    src: '/audio/A Quiet Step to Forever.mp3',
  },
  {
    id: 'before-the-first-light',
    title: 'Before the First Light',
    duration: '02:12',
    src: '/audio/Before the First Light.mp3',
  },
  {
    id: 'honey-in-blue',
    title: 'Honey in Blue',
    duration: '01:40',
    src: '/audio/Honey in Blue.mp3',
  },
  {
    id: 'in-the-arms-of-a-violin',
    title: 'In the Arms of a Violin',
    duration: '02:17',
    src: '/audio/In the Arms of a Violin.mp3',
  },
  {
    id: 'memory-in-motion',
    title: 'Memory in Motion',
    duration: '02:06',
    src: '/audio/Memory in Motion.mp3',
  },
  {
    id: 'slow-burn-tonight',
    title: 'Slow Burn Tonight',
    duration: '01:42',
    src: '/audio/Slow Burn Tonight.mp3',
  },
  {
    id: 'softly-we-begin',
    title: 'Softly, We Begin',
    duration: '02:02',
    src: '/audio/Softly, We Begin.mp3',
  },
  {
    id: 'toward-tomorrow',
    title: 'Toward Tomorrow',
    duration: '02:54',
    src: '/audio/Toward Tomorrow.mp3',
  },
];
