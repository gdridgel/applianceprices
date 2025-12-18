import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/cgi-sys/',
          '/cgi-bin/',
          '/*.cgi',
        ],
      },
    ],
    sitemap: 'https://appliance-prices.com/sitemap.xml',
  }
}