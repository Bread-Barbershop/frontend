import showcase0 from '@/shared/assets/images/showcase/showcase-0.png';
import showcase1 from '@/shared/assets/images/showcase/showcase-1.png';
import showcase10 from '@/shared/assets/images/showcase/showcase-10.png';
import showcase11 from '@/shared/assets/images/showcase/showcase-11.png';
import showcase12 from '@/shared/assets/images/showcase/showcase-12.png';
import showcase13 from '@/shared/assets/images/showcase/showcase-13.png';
import showcase14 from '@/shared/assets/images/showcase/showcase-14.png';
import showcase15 from '@/shared/assets/images/showcase/showcase-15.png';
import showcase16 from '@/shared/assets/images/showcase/showcase-16.png';
import showcase17 from '@/shared/assets/images/showcase/showcase-17.png';
import showcase18 from '@/shared/assets/images/showcase/showcase-18.png';
import showcase19 from '@/shared/assets/images/showcase/showcase-19.png';
import showcase2 from '@/shared/assets/images/showcase/showcase-2.png';
import showcase20 from '@/shared/assets/images/showcase/showcase-20.png';
import showcase21 from '@/shared/assets/images/showcase/showcase-21.png';
import showcase22 from '@/shared/assets/images/showcase/showcase-22.png';
import showcase3 from '@/shared/assets/images/showcase/showcase-3.png';
import showcase4 from '@/shared/assets/images/showcase/showcase-4.png';
import showcase5 from '@/shared/assets/images/showcase/showcase-5.png';
import showcase6 from '@/shared/assets/images/showcase/showcase-6.png';
import showcase7 from '@/shared/assets/images/showcase/showcase-7.png';
import showcase8 from '@/shared/assets/images/showcase/showcase-8.png';
import showcase9 from '@/shared/assets/images/showcase/showcase-9.png';

export const showcaseItems = [
  { id: 'showcase-0', image: showcase0, alt: 'Showcase image 0' },
  { id: 'showcase-1', image: showcase1, alt: 'Showcase image 1' },
  { id: 'showcase-2', image: showcase2, alt: 'Showcase image 2' },
  { id: 'showcase-3', image: showcase3, alt: 'Showcase image 3' },
  { id: 'showcase-4', image: showcase4, alt: 'Showcase image 4' },
  { id: 'showcase-5', image: showcase5, alt: 'Showcase image 5' },
  { id: 'showcase-6', image: showcase6, alt: 'Showcase image 6' },
  { id: 'showcase-7', image: showcase7, alt: 'Showcase image 7' },
  { id: 'showcase-8', image: showcase8, alt: 'Showcase image 8' },
  { id: 'showcase-9', image: showcase9, alt: 'Showcase image 9' },
  { id: 'showcase-10', image: showcase10, alt: 'Showcase image 10' },
  { id: 'showcase-11', image: showcase11, alt: 'Showcase image 11' },
  { id: 'showcase-12', image: showcase12, alt: 'Showcase image 12' },
  { id: 'showcase-13', image: showcase13, alt: 'Showcase image 13' },
  { id: 'showcase-14', image: showcase14, alt: 'Showcase image 14' },
  { id: 'showcase-15', image: showcase15, alt: 'Showcase image 15' },
  { id: 'showcase-16', image: showcase16, alt: 'Showcase image 16' },
  { id: 'showcase-17', image: showcase17, alt: 'Showcase image 17' },
  { id: 'showcase-18', image: showcase18, alt: 'Showcase image 18' },
  { id: 'showcase-19', image: showcase19, alt: 'Showcase image 19' },
  { id: 'showcase-20', image: showcase20, alt: 'Showcase image 20' },
  { id: 'showcase-21', image: showcase21, alt: 'Showcase image 21' },
  { id: 'showcase-22', image: showcase22, alt: 'Showcase image 22' },
];

export function getShuffledShowcaseItems() {
  const shuffledItems = [...showcaseItems];

  for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledItems[index], shuffledItems[randomIndex]] = [
      shuffledItems[randomIndex],
      shuffledItems[index],
    ];
  }

  return shuffledItems;
}

