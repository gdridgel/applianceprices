import { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import HomeClient from '@/components/HomeClient'

export const metadata: Metadata = {
  title: 'Compare Appliance Prices - Refrigerators, Washers, TVs & More | Appliance Prices',
  description: 'Compare prices on refrigerators, washers, dryers, dishwashers, TVs and more from Amazon and Home Depot. Find the best deals on major appliances with real-time price tracking.',
  keywords: ['appliance prices', 'refrigerator deals', 'washer prices', 'dryer deals', 'TV prices', 'dishwasher prices', 'compare appliances', 'best appliance deals', 'amazon appliances', 'home depot appliances'],
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Compact like original */}
      <header className="border-b border-slate-700 bg-black sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">
              <span className="text-blue-400">Appliance</span> Prices
            </span>
            <span className="text-slate-400 text-sm hidden sm:block">Smart Shoppers Start Here</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/deals" className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium">
              🔥 Deals
            </Link>
            <Link href="/blog" className="text-slate-400 hover:text-slate-300 text-sm font-medium">
              📚 Guides
            </Link>
            <Link href="/admin" className="text-slate-400 hover:text-slate-300 text-sm">
              Admin
            </Link>
          </nav>
        </div>
      </header>

      {/* Interactive Price Comparison Tool - Client Rendered */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      }>
        <HomeClient />
      </Suspense>

      {/* SEO Content Section - Below the fold, visible to crawlers */}
      <section className="bg-slate-950 px-4 py-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-6">Compare Appliance Prices From Top Retailers</h2>
          <p className="text-slate-400 text-center mb-8">
            Find the best deals on refrigerators, washers, dryers, dishwashers, TVs, and more. 
            We compare prices from Amazon and Home Depot so you dont have to. Our real-time price 
            tracking helps you save money on major appliances from brands like Samsung, LG, Whirlpool, 
            GE, Maytag, Frigidaire, and KitchenAid.
          </p>
          
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            <div className="text-center p-4">
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-semibold mb-1 text-sm">Save Money</h3>
              <p className="text-slate-500 text-xs">Compare prices across retailers instantly</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1 text-sm">Real-Time Prices</h3>
              <p className="text-slate-500 text-xs">Updated daily from Amazon & Home Depot</p>
            </div>
            <div className="text-center p-4">
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-semibold mb-1 text-sm">Top Brands</h3>
              <p className="text-slate-500 text-xs">Samsung, LG, Whirlpool, GE & more</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer with Internal Links for SEO */}
      <footer className="border-t border-slate-800 bg-black">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-sm">
            <div>
              <h3 className="font-semibold text-white mb-3">Kitchen</h3>
              <ul className="space-y-2">
                <li><Link href="/category/refrigerators" className="text-slate-400 hover:text-white">Refrigerators</Link></li>
                <li><Link href="/category/freezers" className="text-slate-400 hover:text-white">Freezers</Link></li>
                <li><Link href="/category/dishwashers" className="text-slate-400 hover:text-white">Dishwashers</Link></li>
                <li><Link href="/category/ranges" className="text-slate-400 hover:text-white">Ranges</Link></li>
                <li><Link href="/category/air-fryers" className="text-slate-400 hover:text-white">Air Fryers</Link></li>
                <li><Link href="/category/ice-makers" className="text-slate-400 hover:text-white">Ice Makers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Laundry</h3>
              <ul className="space-y-2">
                <li><Link href="/category/washers" className="text-slate-400 hover:text-white">Washers</Link></li>
                <li><Link href="/category/dryers" className="text-slate-400 hover:text-white">Dryers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Cooling</h3>
              <ul className="space-y-2">
                <li><Link href="/category/air-conditioners" className="text-slate-400 hover:text-white">Air Conditioners</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Electronics</h3>
              <ul className="space-y-2">
                <li><Link href="/category/televisions" className="text-slate-400 hover:text-white">Televisions</Link></li>
                <li><Link href="/category/cell-phones" className="text-slate-400 hover:text-white">Cell Phones</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Guides</h3>
              <ul className="space-y-2">
                <li><Link href="/blog" className="text-slate-400 hover:text-white">All Guides</Link></li>
                <li><Link href="/blog/best-time-to-buy-appliances" className="text-slate-400 hover:text-white">Best Time to Buy</Link></li>
                <li><Link href="/blog/refrigerator-buying-guide" className="text-slate-400 hover:text-white">Refrigerator Guide</Link></li>
                <li><Link href="/deals" className="text-slate-400 hover:text-white">Todays Deals</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-slate-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>As an Amazon Associate and Home Depot affiliate, we earn from qualifying purchases.</p>
            <p className="mt-2">© 2025 Appliance Prices. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}