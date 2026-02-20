import Greeting from './Greeting';
import GreetingPreview from './GreetingPreview';

export const greetingDefinition = {
  viewComponent: GreetingPreview,
  editComponent: Greeting,
  fields: {
    title: {
      default: '인사말',
      required: true,
    },
    message: {
      default: '내용을 입력해 주세요.',
      required: true,
    },
    showSignature: {
      default: true,
      required: false,
    },
    useCustomSignature: {
      default: false,
      required: false,
    },
    signature: {
      default: '신랑 OOO · 신부 OOO',
      required: false,
    },
    image: {
      default: [] as File[],
      required: false,
    },
  },
};
