import Introduce from './Introduce';
import IntroducePreview from './IntroducePreview';

export const introduceDefinition = {
  viewComponent: IntroducePreview,
  editComponent: Introduce,
  fields: {
    groom: {
      default: '신랑',
      required: true,
    },
    bride: {
      default: '신부',
      required: true,
    },
    additionalContents: {
      default: '내용을 입력해주세요.',
      required: false,
    },
    addProfile: {
      default: '',
      required: false,
    },
    title: {
      default: () => {},
      required: false,
    },
    switch: {
      default: true,
      required: false,
    },
  },
};
