export interface WreathOrderPayload {
  weddingHallName: string;
  weddingHallAddress?: string;
  weddingDate: string;
  groomName?: string;
  brideName?: string;
  partnerCode?: string;
}

export interface WreathProvider {
  id: string;
  name: string;
  generateOrderUrl: (payload: WreathOrderPayload) => string;
}
