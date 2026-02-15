// 임시로 타입을 따로 선언해서 사용. 추후 타입 재사용 가능한지 체크할 것.
export type GuestBlock = {
  id: string;
  type: string;
  component: string;
  props: unknown;
};
