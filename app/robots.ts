import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/dashboard/', '/editor/'],
      },
    ],
    sitemap: 'https://invia.co.kr/sitemap.xml',
  };
}
