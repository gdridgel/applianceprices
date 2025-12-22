import { Metadata } from 'next'
import Link from 'next/link'
import HomeClient from '@/components/HomeClient'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.appliance-prices.com'),
  title: 'Compare Appliance Prices - Refrigerators, Washers, TVs & More | Appliance Prices',
  description: 'Compare prices on refrigerators, washers, dryers, dishwashers, TVs and more from Amazon. Find the best deals on major appliances with real-time price tracking.',
  keywords: ['appliance prices', 'refrigerator deals', 'washer prices', 'dryer deals', 'TV prices', 'dishwasher prices', 'compare appliances', 'best appliance deals', 'amazon appliances'],
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
      {/* Compact Header */}
      <header className="border-b border-slate-700 bg-black sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-xl font-bold">
              <span className="text-blue-400">Appliance</span> Prices
            </span>
            <span className="text-slate-400 text-xs hidden sm:block">Smart Shoppers Start Here</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/deals" className="text-green-400 hover:text-green-300 text-sm font-medium">
              Deals
            </Link>
            <Link href="/blog" className="text-slate-400 hover:text-slate-300 text-sm">
              Guides
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content - Client Component with Data Table */}
      <HomeClient />

      {/* SEO Content - Below the fold, invisible to users but crawlable */}
      <section className="bg-slate-950 px-4 py-8 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-xl font-bold text-center mb-4">Compare Appliance Prices From Top Retailers</h1>
          <p className="text-slate-400 text-sm text-center mb-6">
            Find the best deals on refrigerators, washers, dryers, dishwashers, TVs, and more. 
            Compare prices from Amazon with real-time price tracking. Save money on appliances 
            from Samsung, LG, Whirlpool, GE, Maytag, Frigidaire, and KitchenAid.
          </p>
          
          {/* Category links for SEO - using query params that work with HomeClient */}
          <div className="flex flex-wrap justify-center gap-2 mb-6">
            <Link href="/?category=Refrigerators" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Refrigerators</Link>
            <Link href="/?category=Freezers" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Freezers</Link>
            <Link href="/?category=Dishwashers" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Dishwashers</Link>
            <Link href="/?category=Ranges" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Ranges</Link>
            <Link href="/?category=Washers" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Washers</Link>
            <Link href="/?category=Dryers" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Dryers</Link>
            <Link href="/?category=Air%20Fryers" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Air Fryers</Link>
            <Link href="/?category=Ice%20Makers" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Ice Makers</Link>
            <Link href="/?category=Air%20Conditioners" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Air Conditioners</Link>
            <Link href="/?category=Televisions" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">TVs</Link>
            <Link href="/?category=Cell%20Phones" className="px-3 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs">Cell Phones</Link>
          </div>

          <div className="grid md:grid-cols-3 gap-4 text-center text-xs">
            <div>
              <div className="text-lg mb-1">💰</div>
              <h3 className="font-semibold">Save Money</h3>
              <p className="text-slate-500">Compare prices instantly</p>
            </div>
            <div>
              <div className="text-lg mb-1">⚡</div>
              <h3 className="font-semibold">Real-Time Prices</h3>
              <p className="text-slate-500">Updated daily</p>
            </div>
            <div>
              <div className="text-lg mb-1">🏆</div>
              <h3 className="font-semibold">Top Brands</h3>
              <p className="text-slate-500">Samsung, LG, Whirlpool & more</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-black px-4 py-6">
        <div className="max-w-4xl mx-auto text-center text-xs text-slate-500">
          <div className="flex flex-wrap justify-center gap-4 mb-4">
            <Link href="/blog" className="hover:text-white">Buying Guides</Link>
            <Link href="/deals" className="hover:text-white">Deals</Link>
            <Link href="/privacy" className="hover:text-white">Privacy</Link>
            <Link href="/terms" className="hover:text-white">Terms</Link>
          </div>
          <p>As an Amazon Associate we earn from qualifying purchases.</p>
          <p className="mt-1">© 2025 Appliance Prices</p>
        </div>
      </footer>
    </div>
  )
}