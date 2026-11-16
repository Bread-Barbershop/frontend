import type { WreathProvider } from '../types/provider';

/**
 * The partner landing page is public; query parameter prefill is intentionally
 * not assumed until the vendor documents its order-link contract.
 */
export const theWreathProvider: WreathProvider = {
  id: 'the-wreath',
  name: '더화환',
  generateOrderUrl: () => 'https://xn--9m1bt77dma.com/wedding-gift',
};
