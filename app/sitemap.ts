import type { MetadataRoute } from 'next';

const siteUrl = 'https://invia.co.kr';

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/faq`,
      lastModified,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/policy`,
      lastModified,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
  ];
}
