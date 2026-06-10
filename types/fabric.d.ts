import 'fabric';

declare module 'fabric' {
  interface ImageSlotMeta {
    key: string;
    label?: string;
    replaceable?: boolean;
    aspectMode?: 'cover' | 'contain';
    required?: boolean;
    order?: number;
    filled?: boolean;
  }

  interface FabricObjectProps {
    id?: string;
    targetId?: string;
    slot?: ImageSlotMeta;
  }

  interface FabricObject {
    id?: string;
    targetId?: string;
    slot?: ImageSlotMeta;
  }
}
