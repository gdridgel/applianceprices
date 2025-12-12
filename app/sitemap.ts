import './globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  metadataBase: new URL('https://appliance-prices.com'),
  title: {
    default: 'Appliance Prices - Compare Refrigerators, Washers, TVs & More',
    template: '%s | Appliance Prices'
  },
  description: 'Compare prices on refrigerators, washers, dryers, dishwashers, TVs and more. Find the best deals on major appliances from Amazon with real-time price tracking.',
  keywords: ['appliance prices', 'refrigerator deals', 'washer prices', 'dryer deals', 'TV prices', 'dishwasher prices', 'compare appliances', 'best appliance deals', 'amazon appliances'],
  authors: [{ name: 'Appliance Prices' }],
  creator: 'Appliance Prices',
  publisher: 'Appliance Prices',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://appliance-prices.com',
    siteName: 'Appliance Prices',
    title: 'Appliance Prices - Compare Refrigerators, Washers, TVs & More',
    description: 'Compare prices on refrigerators, washers, dryers, dishwashers, TVs and more. Find the best deals on major appliances.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Appliance Prices - Compare and Save',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Appliance Prices - Compare Refrigerators, Washers, TVs & More',
    description: 'Compare prices on major appliances. Find the best deals from Amazon.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://appliance-prices.com',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#000000" />
        
        {/* JSON-LD Structured Data - Website */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Appliance Prices',
              url: 'https://appliance-prices.com',
              description: 'Compare prices on refrigerators, washers, dryers, dishwashers, TVs and more.',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://appliance-prices.com/?search={search_term_string}'
                },
                'query-input': 'required name=search_term_string'
              }
            })
          }}
        />
        
        {/* JSON-LD Structured Data - Organization */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Appliance Prices',
              url: 'https://appliance-prices.com',
              logo: 'https://appliance-prices.com/logo.png',
              sameAs: []
            })
          }}
        />
      </head>
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  )
}