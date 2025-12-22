import { Metadata } from 'next'
import Link from 'next/link'
import HomeClient from '@/components/HomeClient'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.appliance-prices.com'),
  title: 'Compare Appliance Prices - Refrigerators, Washers, TVs & More | Appliance Prices',
  description: 'Compare prices on refrigerators, washers, dryers, dishwashers, TVs and more from Amazon. Find the best deals on major appliances with real-time price tracking.',
  keywords: ['appliance prices', 'refrigerator deals', 'washer prices', 'dryer deals', 'TV prices', 'dishwasher prices', 'compare appliances', 'best appliance deals'],
  alternates: {
    canonical: 'https://www.appliance-prices.com',
  },
  openGraph: {
    title: 'Compare Appliance Prices - Refrigerators, Washers, TVs & More',
    description: 'Compare prices on refrigerators, washers, dryers, dishwashers, TVs and more. Find the best deals on major appliances.',
    url: 'https://www.appliance-prices.com',
    siteName: 'Appliance Prices',
    type: 'website',
  },
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-xl font-bold">
              <span className="text-blue-400">Appliance</span> Prices
            </span>
            <span className="text-slate-400 text-xs hidden sm:block">Smart Shoppers Start Here</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/deals" className="text-green-400 hover:text-green-300 text-sm font-medium">Deals</Link>
            <Link href="/blog" className="text-slate-400 hover:text-slate-300 text-sm">Guides</Link>
          </nav>
        </div>
      </header>

      {/* Interactive Tool - Client Side */}
      <HomeClient />

      {/* SEO Section - Links to SSR Category Pages */}
      <section className="px-4 py-8 border-t border-slate-800 bg-slate-950">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-center mb-2">Compare Appliance Prices From Top Retailers</h1>
          <p className="text-slate-400 text-sm text-center mb-6">
            Find the best deals on major appliances. Compare prices, features, and specifications 
            from brands like Samsung, LG, Whirlpool, GE, and more.
          </p>
          
          {/* Category Links - Point to SSR pages for crawlers */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Link href="/category/refrigerators" className="block p-3 bg-slate-900 rounded border border-slate-800 hover:border-slate-600 text-center">
              <div className="text-lg mb-1">🧊</div>
              <div className="text-sm font-medium">Refrigerators</div>
            </Link>
            <Link href="/category/washers" className="block p-3 bg-slate-900 rounded border border-slate-800 hover:border-slate-600 text-center">
              <div className="text-lg mb-1">🫧</div>
              <div className="text-sm font-medium">Washers</div>
            </Link>
            <Link href="/category/dryers" className="block p-3 bg-slate-900 rounded border border-slate-800 hover:border-slate-600 text-center">
              <div className="text-lg mb-1">💨</div>
              <div className="text-sm font-medium">Dryers</div>
            </Link>
            <Link href="/category/dishwashers" className="block p-3 bg-slate-900 rounded border border-slate-800 hover:border-slate-600 text-center">
              <div className="text-lg mb-1">🍽️</div>
              <div className="text-sm font-medium">Dishwashers</div>
            </Link>
            <Link href="/category/televisions" className="block p-3 bg-slate-900 rounded border border-slate-800 hover:border-slate-600 text-center">
              <div className="text-lg mb-1">📺</div>
              <div className="text-sm font-medium">TVs</div>
            </Link>
            <Link href="/category/air-conditioners" className="block p-3 bg-slate-900 rounded border border-slate-800 hover:border-slate-600 text-center">
              <div className="text-lg mb-1">❄️</div>
              <div className="text-sm font-medium">Air Conditioners</div>
            </Link>
            <Link href="/category/air-fryers" className="block p-3 bg-slate-900 rounded border border-slate-800 hover:border-slate-600 text-center">
              <div className="text-lg mb-1">🍟</div>
              <div className="text-sm font-medium">Air Fryers</div>
            </Link>
            <Link href="/category/ranges" className="block p-3 bg-slate-900 rounded border border-slate-800 hover:border-slate-600 text-center">
              <div className="text-lg mb-1">🔥</div>
              <div className="text-sm font-medium">Ranges</div>
            </Link>
          </div>
          
          <div className="text-center">
            <Link href="/category/refrigerators" className="text-blue-400 hover:text-blue-300 text-sm">
              Browse all categories →
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-6 border-t border-slate-800">
        <div className="max-w-3xl mx-auto grid md:grid-cols-3 gap-4 text-center text-xs">
          <div>
            <div className="text-lg mb-1">💰</div>
            <h3 className="font-semibold">Save Money</h3>
            <p className="text-slate-500">Compare prices instantly</p>
          </div>
          <div>
            <div className="text-lg mb-1">⚡</div>
            <h3 className="font-semibold">Real-Time Prices</h3>
            <p className="text-slate-500">Updated daily from Amazon</p>
          </div>
          <div>
            <div className="text-lg mb-1">🏆</div>
            <h3 className="font-semibold">Top Brands</h3>
            <p className="text-slate-500">Samsung, LG, Whirlpool & more</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
        <div className="flex flex-wrap justify-center gap-4 mb-3">
          <Link href="/category/refrigerators" className="hover:text-white">Refrigerators</Link>
          <Link href="/category/washers" className="hover:text-white">Washers</Link>
          <Link href="/category/televisions" className="hover:text-white">TVs</Link>
          <Link href="/blog" className="hover:text-white">Guides</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
        </div>
        <p>As an Amazon Associate we earn from qualifying purchases.</p>
        <p className="mt-1">© 2025 Appliance Prices</p>
      </footer>
    </div>
  )
}