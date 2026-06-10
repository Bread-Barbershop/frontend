'use client';

import Clarity from '@microsoft/clarity';
import { useEffect } from 'react';

export default function ClarityInit() {
  useEffect(() => {
    Clarity.init('x4vx8bf0a8');
  }, []);

  return null;
}
/*

// 사용자 식별 (로그인 시)
Clarity.identify('user-123', { plan: 'pro' });

// 커스텀 태그
Clarity.setTag('page_type', 'product');

// 커스텀 이벤트
Clarity.event('add_to_cart');

// 쿠키 동의 처리
Clarity.consent();

*/
