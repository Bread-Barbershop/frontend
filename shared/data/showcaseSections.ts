import type { FaqItem } from '@/components/organisms/faq/Faq.schema';
import type {
  GalleryVariant,
  RatioType,
} from '@/components/organisms/gallery/types/galleryType';
import type { MealMenuStyle } from '@/components/organisms/mealMenu/mealMenuContent';
import type { NoticePresetId } from '@/components/organisms/notice/noticeList';

export type ShowcaseSection =
  | { component: 'greeting' }
  | {
      component: 'calendar';
      title: string;
      template?: `calendarType${1 | 2 | 3 | 4 | 5}`;
    }
  | { component: 'place'; title: string; detail?: string }
  | { component: 'closingComment'; message: string }
  | { component: 'coupleIntroduction'; title: string; story: string }
  | { component: 'picture'; title: string; image: string; caption?: string }
  | {
      component: 'gallery';
      title: string;
      images: string[];
      template: GalleryVariant;
      ratio: RatioType;
    }
  | {
      component: 'interview';
      title: string;
      question: string;
      answer: string;
      image: string;
    }
  | {
      component: 'timeline';
      title: string;
      items: { time: string; title: string; description?: string }[];
    }
  | {
      component: 'mealMenu';
      title: string;
      subtitle: string;
      style: MealMenuStyle;
      courses: { name: string; dishes: string[] }[];
    }
  | {
      component: 'dressCode';
      title: string;
      colors: string[];
      guidelines: string[];
    }
  | { component: 'wreath'; title: string; declineMessage: string }
  | { component: 'faq'; title: string; items: FaqItem[] }
  | {
      component: 'notice';
      title: string;
      heading: string;
      message: string;
      preset: NoticePresetId;
      image?: string;
    }
  | {
      component: 'transportation';
      title: string;
      subwayStation?: string;
      subwayExit?: string;
      subwayWalk?: string;
      shuttleStop?: string;
      shuttleInterval?: string;
      parkingHours?: string;
      alternativeParking?: string;
    }
  | {
      component: 'afterParty';
      title: string;
      venue: string;
      dateTime: string;
      description: string;
    }
  | {
      component: 'speakerInformation';
      title: string;
      name: string;
      bio: string;
      image: string;
    }
  | {
      component: 'organizerInformation';
      title: string;
      organizer: string;
      message: string;
      image: string;
    }
  | { component: 'sponsorshipInfomation'; title: string; images: string[] }
  | {
      component: 'myChild';
      title: string;
      name: string;
      birthday: string;
      message: string;
      image: string;
    }
  | {
      component: 'myFamily';
      title: string;
      members: { relation: string; name: string }[];
      message: string;
    };
