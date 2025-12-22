import { Metadata } from 'next'
import Link from 'next/link'
import HomeClient from '@/components/HomeClient'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.appliance-prices.com'),
  title: 'Compare Appliance Prices - Refrigerators, Washers, TVs & More | Appliance Prices',
  description: 'Compare prices on refrigerators, washers, dryers, dishwashers, TVs and more from Amazon and Home Depot. Find the best deals on major appliances with real-time price tracking.',
  keywords: ['appliance prices', 'refrigerator deals', 'washer prices', 'dryer deals', 'TV prices', 'dishwasher prices', 'compare appliances', 'best appliance deals', 'amazon appliances', 'home depot appliances'],
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
      {/* Header - Server Rendered */}
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

      {/* Hero Section - Server Rendered for SEO */}
      <section className="bg-gradient-to-b from-slate-900 to-black px-4 py-8 text-center">
        <h1 className="text-3xl md:text-4xl font-bold mb-3">
          Compare Appliance Prices Instantly
        </h1>
        <p className="text-lg text-slate-300 max-w-2xl mx-auto mb-4">
          Find the best deals on refrigerators, washers, dryers, dishwashers, TVs, and more. 
          We compare prices from Amazon and Home Depot so you dont have to.
        </p>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Real-time price tracking on thousands of products from Samsung, LG, Whirlpool, GE, Maytag, and more.
        </p>
      </section>

      {/* Category Quick Links - Server Rendered for SEO */}
      <section className="bg-slate-900/50 px-4 py-6 border-b border-slate-800">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-sm font-semibold text-center mb-4 text-slate-400 uppercase tracking-wide">Shop By Category</h2>
          <div className="flex flex-wrap justify-center gap-2">
            <Link href="/category/refrigerators" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Refrigerators
            </Link>
            <Link href="/category/freezers" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Freezers
            </Link>
            <Link href="/category/dishwashers" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Dishwashers
            </Link>
            <Link href="/category/ranges" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Ranges
            </Link>
            <Link href="/category/washers" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Washers
            </Link>
            <Link href="/category/dryers" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Dryers
            </Link>
            <Link href="/category/air-fryers" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Air Fryers
            </Link>
            <Link href="/category/ice-makers" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Ice Makers
            </Link>
            <Link href="/category/air-conditioners" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Air Conditioners
            </Link>
            <Link href="/category/televisions" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              TVs
            </Link>
            <Link href="/category/cell-phones" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 rounded-full text-xs transition">
              Cell Phones
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Price Comparison Tool - Client Rendered (no Suspense wrapper) */}
      <HomeClient />

      {/* Buying Guides Section - Server Rendered for SEO */}
      <section className="bg-slate-950 px-4 py-10 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl font-bold text-center mb-6">Appliance Buying Guides</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <Link href="/blog/best-time-to-buy-appliances" className="block p-4 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-600 transition">
              <h3 className="font-semibold mb-1 text-sm">Best Time to Buy Appliances in 2025</h3>
              <p className="text-slate-400 text-xs">Discover when retailers offer the biggest discounts on major appliances.</p>
            </Link>
            <Link href="/blog/refrigerator-buying-guide" className="block p-4 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-600 transition">
              <h3 className="font-semibold mb-1 text-sm">Refrigerator Buying Guide</h3>
              <p className="text-slate-400 text-xs">French door vs side-by-side, features to look for, and sizing tips.</p>
            </Link>
            <Link href="/blog/washer-dryer-buying-guide" className="block p-4 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-600 transition">
              <h3 className="font-semibold mb-1 text-sm">Washer and Dryer Buying Guide</h3>
              <p className="text-slate-400 text-xs">Top load vs front load, gas vs electric, and features worth paying for.</p>
            </Link>
            <Link href="/blog/amazon-vs-home-depot-appliances" className="block p-4 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-600 transition">
              <h3 className="font-semibold mb-1 text-sm">Amazon vs Home Depot: Where to Buy?</h3>
              <p className="text-slate-400 text-xs">Compare prices, delivery, installation, and return policies.</p>
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content - Server Rendered */}
      <section className="px-4 py-10 border-t border-slate-800">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-lg font-bold mb-4">Why Use Appliance Prices?</h2>
          <div className="grid md:grid-cols-3 gap-6 text-sm">
            <div>
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-semibold mb-1">Save Money</h3>
              <p className="text-slate-400 text-xs">Compare prices across retailers instantly without visiting multiple sites.</p>
            </div>
            <div>
              <div className="text-2xl mb-2">⚡</div>
              <h3 className="font-semibold mb-1">Real-Time Prices</h3>
              <p className="text-slate-400 text-xs">Prices updated daily from Amazon and Home Depot.</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🏆</div>
              <h3 className="font-semibold mb-1">Top Brands</h3>
              <p className="text-slate-400 text-xs">Samsung, LG, Whirlpool, GE, Maytag, Frigidaire, and more.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Server Rendered with Internal Links for SEO */}
      <footer className="border-t border-slate-800 bg-black">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6 text-xs">
            <div>
              <h3 className="font-semibold text-white mb-2">Kitchen</h3>
              <ul className="space-y-1">
                <li><Link href="/category/refrigerators" className="text-slate-400 hover:text-white">Refrigerators</Link></li>
                <li><Link href="/category/freezers" className="text-slate-400 hover:text-white">Freezers</Link></li>
                <li><Link href="/category/dishwashers" className="text-slate-400 hover:text-white">Dishwashers</Link></li>
                <li><Link href="/category/ranges" className="text-slate-400 hover:text-white">Ranges</Link></li>
                <li><Link href="/category/air-fryers" className="text-slate-400 hover:text-white">Air Fryers</Link></li>
                <li><Link href="/category/ice-makers" className="text-slate-400 hover:text-white">Ice Makers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Laundry</h3>
              <ul className="space-y-1">
                <li><Link href="/category/washers" className="text-slate-400 hover:text-white">Washers</Link></li>
                <li><Link href="/category/dryers" className="text-slate-400 hover:text-white">Dryers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Cooling</h3>
              <ul className="space-y-1">
                <li><Link href="/category/air-conditioners" className="text-slate-400 hover:text-white">Air Conditioners</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Electronics</h3>
              <ul className="space-y-1">
                <li><Link href="/category/televisions" className="text-slate-400 hover:text-white">Televisions</Link></li>
                <li><Link href="/category/cell-phones" className="text-slate-400 hover:text-white">Cell Phones</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Resources</h3>
              <ul className="space-y-1">
                <li><Link href="/blog" className="text-slate-400 hover:text-white">Buying Guides</Link></li>
                <li><Link href="/deals" className="text-slate-400 hover:text-white">Todays Deals</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Company</h3>
              <ul className="space-y-1">
                <li><Link href="/privacy" className="text-slate-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-xs text-slate-500">
            <p>As an Amazon Associate and Home Depot affiliate, we earn from qualifying purchases.</p>
            <p className="mt-1">© 2025 Appliance Prices. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}