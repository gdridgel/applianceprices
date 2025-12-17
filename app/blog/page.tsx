import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Appliance Buying Guides & Tips | Appliance Prices Blog',
  description: 'Expert guides on buying refrigerators, washers, dryers, TVs and more. Learn when to buy, what features matter, and how to find the best deals.',
  keywords: ['appliance buying guide', 'best time to buy appliances', 'appliance deals', 'refrigerator buying tips', 'washer dryer guide'],
  openGraph: {
    title: 'Appliance Buying Guides & Tips',
    description: 'Expert guides on buying refrigerators, washers, dryers, TVs and more.',
    url: 'https://appliance-prices.com/blog',
    type: 'website'
  },
  alternates: {
    canonical: 'https://appliance-prices.com/blog'
  }
}

// Blog posts data - in production, this would come from a CMS or database
const blogPosts = [
  {
    slug: 'best-time-to-buy-appliances',
    title: 'Best Time to Buy Appliances in 2025: Complete Guide',
    excerpt: 'Discover the best times of year to buy major appliances and save hundreds. From holiday sales to seasonal clearances, we cover it all.',
    date: '2025-01-15',
    category: 'Buying Guides',
    readTime: '8 min read'
  },
  {
    slug: 'refrigerator-buying-guide',
    title: 'Refrigerator Buying Guide: How to Choose the Right Fridge',
    excerpt: 'Everything you need to know about buying a refrigerator. Compare French door vs side-by-side, understand features, and find the right size.',
    date: '2025-01-10',
    category: 'Buying Guides',
    readTime: '12 min read'
  },
  {
    slug: 'amazon-vs-home-depot-appliances',
    title: 'Amazon vs Home Depot: Where to Buy Appliances?',
    excerpt: 'We compare prices, delivery options, installation services, and return policies to help you decide where to buy your next appliance.',
    date: '2025-01-05',
    category: 'Comparisons',
    readTime: '6 min read'
  },
  {
    slug: 'energy-star-appliances-worth-it',
    title: 'Are Energy Star Appliances Worth the Extra Cost?',
    excerpt: 'We break down the energy savings, upfront costs, and payback period for Energy Star certified appliances.',
    date: '2025-01-01',
    category: 'Tips',
    readTime: '5 min read'
  },
  {
    slug: 'washer-dryer-buying-guide',
    title: 'Washer & Dryer Buying Guide: Top Load vs Front Load',
    excerpt: 'Compare top load and front load washers, gas vs electric dryers, and learn which features actually matter.',
    date: '2024-12-28',
    category: 'Buying Guides',
    readTime: '10 min read'
  },
  {
    slug: 'smart-tv-buying-guide',
    title: 'Smart TV Buying Guide: OLED vs QLED vs LED Explained',
    excerpt: 'Understand the differences between TV technologies, screen sizes, and smart features to find your perfect TV.',
    date: '2024-12-20',
    category: 'Buying Guides',
    readTime: '9 min read'
  }
]

export default function BlogPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold hover:text-blue-400 transition">
            Appliance Prices
          </Link>
          <nav className="flex items-center gap-6">
            <Link href="/" className="text-slate-400 hover:text-white transition">Compare Prices</Link>
            <Link href="/deals" className="text-slate-400 hover:text-white transition">Deals</Link>
            <Link href="/blog" className="text-white font-medium">Blog</Link>
          </nav>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Appliance Buying Guides & Tips</h1>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Expert advice to help you choose the right appliances and find the best deals.
          </p>
        </div>

        {/* Blog Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {blogPosts.map(post => (
            <article key={post.slug} className="bg-slate-900 rounded-lg border border-slate-800 overflow-hidden hover:border-slate-700 transition">
              <Link href={`/blog/${post.slug}`}>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                    <span className="bg-blue-600/20 text-blue-400 px-2 py-1 rounded">{post.category}</span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-semibold mb-3 hover:text-blue-400 transition line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="text-slate-400 line-clamp-3 mb-4">
                    {post.excerpt}
                  </p>
                  <div className="text-sm text-slate-500">
                    {new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </div>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* SEO Content */}
        <section className="mt-16 prose prose-invert max-w-none">
          <h2 className="text-2xl font-bold mb-4">Why Read Our Appliance Guides?</h2>
          <p className="text-slate-400">
            Buying major appliances is a significant investment. Our expert guides help you understand the features that matter, 
            compare prices across retailers, and find the best times to buy. Whether you're shopping for a new refrigerator, 
            washer and dryer set, or smart TV, we provide unbiased information to help you make informed decisions.
          </p>
          <p className="text-slate-400">
            We track prices from Amazon, Home Depot, and other major retailers to identify the best deals. Our buying guides 
            are regularly updated with the latest models, features, and pricing information.
          </p>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 mt-16">
        <div className="max-w-6xl mx-auto px-4 py-8 text-center text-slate-500">
          <p>© {new Date().getFullYear()} Appliance Prices. All rights reserved.</p>
          <p className="text-sm mt-2">
            As an Amazon Associate and Home Depot affiliate, we earn from qualifying purchases.
          </p>
        </div>
      </footer>
    </div>
  )
}
