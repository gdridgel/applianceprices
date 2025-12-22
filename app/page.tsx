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
      {/* Header - Server Rendered */}
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
          </nav>
        </div>
      </header>

      {/* SEO Hero Section - Server Rendered */}
      <section className="bg-gradient-to-b from-slate-900 to-black px-4 py-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Compare Appliance Prices Instantly
          </h1>
          <p className="text-xl text-slate-300 mb-6">
            Find the best deals on refrigerators, washers, dryers, dishwashers, TVs, and more. 
            We compare prices from Amazon and Home Depot so you don't have to.
          </p>
          <p className="text-slate-400 max-w-2xl mx-auto">
            Stop overpaying for major appliances. Our real-time price comparison tool helps you find 
            the lowest prices on thousands of products from top brands like Samsung, LG, Whirlpool, 
            GE, Maytag, and more.
          </p>
        </div>
      </section>

      {/* Category Quick Links - Server Rendered for SEO */}
      <section className="bg-slate-900/50 px-4 py-8 border-b border-slate-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-lg font-semibold text-center mb-6 text-slate-300">Shop By Category</h2>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/category/refrigerators" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Refrigerators
            </Link>
            <Link href="/category/freezers" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Freezers
            </Link>
            <Link href="/category/dishwashers" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Dishwashers
            </Link>
            <Link href="/category/ranges" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Ranges & Stoves
            </Link>
            <Link href="/category/washers" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Washers
            </Link>
            <Link href="/category/dryers" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Dryers
            </Link>
            <Link href="/category/air-fryers" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Air Fryers
            </Link>
            <Link href="/category/ice-makers" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Ice Makers
            </Link>
            <Link href="/category/air-conditioners" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Air Conditioners
            </Link>
            <Link href="/category/televisions" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Televisions
            </Link>
            <Link href="/category/cell-phones" className="px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-full text-sm transition">
              Cell Phones
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Price Comparison Tool - Client Rendered */}
      <Suspense fallback={
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      }>
        <HomeClient />
      </Suspense>

      {/* Why Choose Us - Server Rendered SEO Content */}
      <section className="bg-slate-900 px-4 py-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Use Appliance Prices?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-3xl mb-3">💰</div>
              <h3 className="font-semibold mb-2">Save Money</h3>
              <p className="text-slate-400 text-sm">
                Compare prices across major retailers instantly. Find the best deals without visiting multiple websites.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">⚡</div>
              <h3 className="font-semibold mb-2">Real-Time Prices</h3>
              <p className="text-slate-400 text-sm">
                Our prices are updated daily from Amazon and Home Depot. Always see the most current deals.
              </p>
            </div>
            <div className="text-center">
              <div className="text-3xl mb-3">🏆</div>
              <h3 className="font-semibold mb-2">Top Brands</h3>
              <p className="text-slate-400 text-sm">
                Compare products from Samsung, LG, Whirlpool, GE, Maytag, Frigidaire, KitchenAid, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Guides - Server Rendered */}
      <section className="px-4 py-12 border-t border-slate-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Appliance Buying Guides</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Link href="/blog/best-time-to-buy-appliances" className="block p-6 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition">
              <h3 className="font-semibold mb-2">Best Time to Buy Appliances in 2025</h3>
              <p className="text-slate-400 text-sm">Discover when major retailers offer the biggest discounts on refrigerators, washers, and more.</p>
            </Link>
            <Link href="/blog/refrigerator-buying-guide" className="block p-6 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition">
              <h3 className="font-semibold mb-2">Refrigerator Buying Guide</h3>
              <p className="text-slate-400 text-sm">French door vs side-by-side, features to look for, and how to choose the right size.</p>
            </Link>
            <Link href="/blog/washer-dryer-buying-guide" className="block p-6 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition">
              <h3 className="font-semibold mb-2">Washer & Dryer Buying Guide</h3>
              <p className="text-slate-400 text-sm">Top load vs front load, gas vs electric dryers, and which features are worth paying for.</p>
            </Link>
            <Link href="/blog/amazon-vs-home-depot-appliances" className="block p-6 bg-slate-900 rounded-lg border border-slate-800 hover:border-slate-700 transition">
              <h3 className="font-semibold mb-2">Amazon vs Home Depot: Where to Buy?</h3>
              <p className="text-slate-400 text-sm">Compare prices, delivery, installation, and return policies between major retailers.</p>
            </Link>
          </div>
          <div className="text-center mt-6">
            <Link href="/blog" className="text-blue-400 hover:text-blue-300">
              View all buying guides →
            </Link>
          </div>
        </div>
      </section>

      {/* SEO Content Section - Server Rendered */}
      <section className="px-4 py-12 border-t border-slate-800 bg-slate-900/30">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-6">Compare Appliance Prices From Top Retailers</h2>
          <div className="prose prose-invert prose-slate max-w-none">
            <p className="text-slate-300 mb-4">
              Finding the best price on major appliances shouldn't require hours of research. Appliance Prices 
              makes it easy to compare prices from Amazon and Home Depot side by side, so you can make informed 
              purchasing decisions and save money.
            </p>
            <p className="text-slate-300 mb-4">
              Whether you're shopping for a new refrigerator, washing machine, dishwasher, or television, our 
              comprehensive database includes thousands of products from leading brands. We track prices daily 
              and highlight the best deals so you never miss a sale.
            </p>
            <h3 className="text-xl font-semibold mt-6 mb-3">Popular Appliance Categories</h3>
            <p className="text-slate-300 mb-4">
              <strong>Kitchen Appliances:</strong> Compare prices on French door refrigerators, side-by-side refrigerators, 
              top freezer models, dishwashers, ranges, and cooking appliances from Samsung, LG, Whirlpool, GE, and Frigidaire.
            </p>
            <p className="text-slate-300 mb-4">
              <strong>Laundry Appliances:</strong> Find deals on top-loading washers, front-loading washers, gas dryers, 
              and electric dryers. Compare Maytag, Whirlpool, LG, and Samsung laundry pairs.
            </p>
            <p className="text-slate-300 mb-4">
              <strong>Electronics:</strong> Shop for OLED TVs, QLED TVs, 4K smart TVs, and the latest smartphones 
              from Samsung, LG, Sony, TCL, and Apple.
            </p>
          </div>
        </div>
      </section>

      {/* Footer - Server Rendered */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Category Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 mb-10">
            <div>
              <h3 className="font-semibold text-white mb-3">Kitchen</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/category/refrigerators" className="text-slate-400 hover:text-white">Refrigerators</Link></li>
                <li><Link href="/category/freezers" className="text-slate-400 hover:text-white">Freezers</Link></li>
                <li><Link href="/category/dishwashers" className="text-slate-400 hover:text-white">Dishwashers</Link></li>
                <li><Link href="/category/ranges" className="text-slate-400 hover:text-white">Ranges & Stoves</Link></li>
                <li><Link href="/category/air-fryers" className="text-slate-400 hover:text-white">Air Fryers</Link></li>
                <li><Link href="/category/ice-makers" className="text-slate-400 hover:text-white">Ice Makers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Laundry</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/category/washers" className="text-slate-400 hover:text-white">Washing Machines</Link></li>
                <li><Link href="/category/dryers" className="text-slate-400 hover:text-white">Dryers</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Cooling</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/category/air-conditioners" className="text-slate-400 hover:text-white">Air Conditioners</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Electronics</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/category/televisions" className="text-slate-400 hover:text-white">Televisions</Link></li>
                <li><Link href="/category/cell-phones" className="text-slate-400 hover:text-white">Cell Phones</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Buying Guides</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/blog/best-time-to-buy-appliances" className="text-slate-400 hover:text-white">Best Time to Buy</Link></li>
                <li><Link href="/blog/refrigerator-buying-guide" className="text-slate-400 hover:text-white">Refrigerator Guide</Link></li>
                <li><Link href="/blog/washer-dryer-buying-guide" className="text-slate-400 hover:text-white">Washer & Dryer Guide</Link></li>
                <li><Link href="/blog/smart-tv-buying-guide" className="text-slate-400 hover:text-white">TV Buying Guide</Link></li>
                <li><Link href="/blog" className="text-blue-400 hover:text-blue-300">All Guides →</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white mb-3">Company</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/deals" className="text-slate-400 hover:text-white">Today's Deals</Link></li>
                <li><Link href="/privacy" className="text-slate-400 hover:text-white">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-slate-400 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-slate-800 pt-8 text-center">
            <p className="text-slate-500 text-sm">
              © {new Date().getFullYear()} Appliance Prices. All rights reserved.
            </p>
            <p className="text-slate-600 text-xs mt-2">
              As an Amazon Associate and Home Depot affiliate, we earn from qualifying purchases.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}