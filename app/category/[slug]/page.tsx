import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'
import { Star } from 'lucide-react'

// Server-side Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Category SEO data
const categoryData: Record<string, {
  name: string
  title: string
  description: string
  keywords: string[]
  h1: string
  intro: string
}> = {
  'refrigerators': {
    name: 'Refrigerators',
    title: 'Refrigerator Prices - Compare French Door, Side-by-Side & More',
    description: 'Compare refrigerator prices from Samsung, LG, Whirlpool, GE and more. Find the best deals on French door, side-by-side, top freezer, and bottom freezer refrigerators.',
    keywords: ['refrigerator prices', 'french door refrigerator', 'samsung refrigerator', 'lg refrigerator', 'best refrigerator deals'],
    h1: 'Compare Refrigerator Prices',
    intro: 'Find the best prices on refrigerators from top brands. Compare French door, side-by-side, top freezer, and bottom freezer models from Samsung, LG, Whirlpool, GE, and more.'
  },
  'freezers': {
    name: 'Freezers',
    title: 'Freezer Prices - Compare Chest, Upright & Garage Ready Freezers',
    description: 'Compare freezer prices on chest freezers, upright freezers, and garage-ready models. Find the best deals from top brands.',
    keywords: ['freezer prices', 'chest freezer', 'upright freezer', 'garage freezer', 'deep freezer'],
    h1: 'Compare Freezer Prices',
    intro: 'Find the best prices on chest freezers, upright freezers, and garage-ready models. Compare capacity, dimensions, and features.'
  },
  'dishwashers': {
    name: 'Dishwashers',
    title: 'Dishwasher Prices - Compare Built-In & Portable Dishwashers',
    description: 'Compare dishwasher prices from Bosch, Samsung, LG, KitchenAid and more. Find deals on built-in, portable, and countertop dishwashers.',
    keywords: ['dishwasher prices', 'bosch dishwasher', 'samsung dishwasher', 'quiet dishwasher', 'best dishwasher deals'],
    h1: 'Compare Dishwasher Prices',
    intro: 'Find the best prices on dishwashers from top brands like Bosch, Samsung, LG, and KitchenAid. Compare noise levels, features, and energy ratings.'
  },
  'ranges': {
    name: 'Ranges',
    title: 'Range & Stove Prices - Compare Gas, Electric & Induction Ranges',
    description: 'Compare range and stove prices on gas, electric, induction, and dual fuel models. Find deals from Samsung, GE, LG and more.',
    keywords: ['range prices', 'gas range', 'electric stove', 'induction range', 'best range deals'],
    h1: 'Compare Range & Stove Prices',
    intro: 'Find the best prices on gas ranges, electric ranges, induction cooktops, and dual fuel models from top brands.'
  },
  'washers': {
    name: 'Washers',
    title: 'Washing Machine Prices - Compare Top Load & Front Load Washers',
    description: 'Compare washing machine prices on top load and front load washers from Samsung, LG, Maytag, Whirlpool and more.',
    keywords: ['washing machine prices', 'front load washer', 'top load washer', 'samsung washer', 'lg washer'],
    h1: 'Compare Washing Machine Prices',
    intro: 'Find the best prices on washing machines. Compare top load and front load washers from Samsung, LG, Maytag, Whirlpool, and more.'
  },
  'dryers': {
    name: 'Dryers',
    title: 'Dryer Prices - Compare Electric, Gas & Heat Pump Dryers',
    description: 'Compare dryer prices on electric, gas, and heat pump models from Samsung, LG, Maytag, Whirlpool and more.',
    keywords: ['dryer prices', 'electric dryer', 'gas dryer', 'heat pump dryer', 'best dryer deals'],
    h1: 'Compare Dryer Prices',
    intro: 'Find the best prices on electric dryers, gas dryers, and energy-efficient heat pump models from top brands.'
  },
  'air-fryers': {
    name: 'Air Fryers',
    title: 'Air Fryer Prices - Compare Ninja, Cosori, Instant & More',
    description: 'Compare air fryer prices from Ninja, Cosori, Instant, and Philips. Find deals on basket, oven, and dual-zone air fryers.',
    keywords: ['air fryer prices', 'ninja air fryer', 'cosori air fryer', 'best air fryer deals'],
    h1: 'Compare Air Fryer Prices',
    intro: 'Find the best prices on air fryers from Ninja, Cosori, Instant, Philips, and more. Compare basket, oven, and dual-zone models.'
  },
  'ice-makers': {
    name: 'Ice Makers',
    title: 'Ice Maker Prices - Compare Countertop & Portable Ice Machines',
    description: 'Compare ice maker prices on countertop, portable, and under-counter models. Find deals on nugget ice makers.',
    keywords: ['ice maker prices', 'countertop ice maker', 'nugget ice maker', 'portable ice machine'],
    h1: 'Compare Ice Maker Prices',
    intro: 'Find the best prices on countertop ice makers, portable ice machines, and nugget ice makers from top brands.'
  },
  'air-conditioners': {
    name: 'Air Conditioners',
    title: 'Air Conditioner Prices - Compare Window, Portable & Mini Split AC',
    description: 'Compare air conditioner prices on window units, portable ACs, and mini-split systems. Find the best BTU for your space.',
    keywords: ['air conditioner prices', 'window ac', 'portable air conditioner', 'mini split ac'],
    h1: 'Compare Air Conditioner Prices',
    intro: 'Find the best prices on window air conditioners, portable ACs, and mini-split systems. Compare BTU ratings and energy efficiency.'
  },
  'televisions': {
    name: 'Televisions',
    title: 'TV Prices - Compare OLED, QLED, 4K & Smart TVs',
    description: 'Compare TV prices on OLED, QLED, 4K, and smart TVs from Samsung, LG, Sony, TCL. Find deals on all screen sizes.',
    keywords: ['tv prices', 'oled tv', 'qled tv', '4k tv deals', 'samsung tv', 'lg tv'],
    h1: 'Compare TV Prices',
    intro: 'Find the best prices on OLED, QLED, 4K, and smart TVs from Samsung, LG, Sony, TCL, and more.'
  },
  'cell-phones': {
    name: 'Cell Phones',
    title: 'Cell Phone Prices - Compare iPhone, Samsung Galaxy & More',
    description: 'Compare cell phone prices on iPhone, Samsung Galaxy, Google Pixel and more. Find deals on unlocked smartphones.',
    keywords: ['cell phone prices', 'iphone deals', 'samsung galaxy', 'pixel phone', 'unlocked phones'],
    h1: 'Compare Cell Phone Prices',
    intro: 'Find the best prices on smartphones including iPhone, Samsung Galaxy, Google Pixel, and more.'
  }
}

type Appliance = {
  id: string
  asin: string
  title: string
  brand: string
  model: string
  type: string
  price: number
  list_price: number
  rating: number
  image_url: string
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const category = categoryData[slug]
  
  if (!category) {
    return { title: 'Category Not Found' }
  }
  
  return {
    title: category.title,
    description: category.description,
    keywords: category.keywords,
    openGraph: {
      title: category.title,
      description: category.description,
      url: 'https://www.appliance-prices.com/category/' + slug,
      type: 'website'
    },
    alternates: {
      canonical: 'https://www.appliance-prices.com/category/' + slug
    }
  }
}

export async function generateStaticParams() {
  return Object.keys(categoryData).map(function(slug) { 
    return { slug: slug } 
  })
}

// Server-side data fetching
async function getProducts(categoryName: string): Promise<Appliance[]> {
  var result = await supabase
    .from('appliances')
    .select('id, asin, title, brand, model, type, price, list_price, rating, image_url')
    .eq('category', categoryName)
    .gte('price', 50)
    .not('price', 'is', null)
    .order('price', { ascending: true })
    .limit(50)
  
  if (result.error) {
    console.error('Error fetching products:', result.error)
    return []
  }
  
  return result.data || []
}

function formatPrice(price: number | null): string {
  if (!price) return '—'
  return '$' + price.toFixed(0)
}

function getDiscount(price: number, listPrice: number | null): number | null {
  if (!listPrice || listPrice <= price) return null
  return Math.round(((listPrice - price) / listPrice) * 100)
}

export default async function CategoryPage({ params }: Props) {
  var resolvedParams = await params
  var slug = resolvedParams.slug
  var category = categoryData[slug]
  
  if (!category) {
    notFound()
  }
  
  // Fetch products SERVER-SIDE
  var products = await getProducts(category.name)
  
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black sticky top-0 z-50">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-xl font-bold">
              <span className="text-blue-400">Appliance</span> Prices
            </span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/deals" className="text-green-400 hover:text-green-300 text-sm font-medium">Deals</Link>
            <Link href="/blog" className="text-slate-400 hover:text-slate-300 text-sm">Guides</Link>
          </nav>
        </div>
      </header>

      {/* Breadcrumb */}
      <nav className="px-4 py-2 text-xs text-slate-400">
        <Link href="/" className="hover:text-white">Home</Link>
        <span className="mx-2">/</span>
        <span className="text-white">{category.name}</span>
      </nav>

      {/* H1 and Intro */}
      <section className="px-4 py-4">
        <h1 className="text-2xl font-bold mb-2">{category.h1}</h1>
        <p className="text-slate-400 text-sm max-w-3xl">{category.intro}</p>
        <p className="text-slate-500 text-xs mt-2">{products.length} products found</p>
      </section>

      {/* Product Table - Server Rendered */}
      <section className="px-4 pb-8">
        <div className="border border-slate-700 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800">
                <tr>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400">Image</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400">Price</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400">Brand</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400">Model</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400">Type</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400">Rating</th>
                  <th className="px-2 py-2 text-left text-xs font-semibold text-slate-400"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {products.map(function(item, idx) {
                  var discount = getDiscount(item.price, item.list_price)
                  var affiliateUrl = 'https://www.amazon.com/dp/' + item.asin + '?tag=appliances04d-20'
                  
                  return (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-900/30'}>
                      <td className="px-2 py-2">
                        {item.image_url ? (
                          <img 
                            src={item.image_url} 
                            alt={item.title || item.brand + ' ' + item.model}
                            className="w-12 h-12 object-contain bg-white rounded"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-12 h-12 bg-slate-700 rounded" />
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <div className="font-bold text-green-400">{formatPrice(item.price)}</div>
                        {discount && <div className="text-xs text-green-500">-{discount}%</div>}
                      </td>
                      <td className="px-2 py-2 text-xs">{item.brand || '—'}</td>
                      <td className="px-2 py-2">
                        <Link 
                          href={'/product/' + item.asin}
                          className="text-xs text-blue-400 hover:underline block max-w-[150px] truncate"
                        >
                          {item.model || (item.title ? item.title.substring(0, 40) : '—')}
                        </Link>
                      </td>
                      <td className="px-2 py-2 text-xs">{item.type || '—'}</td>
                      <td className="px-2 py-2">
                        {item.rating ? (
                          <div className="flex items-center gap-0.5 text-xs">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            <span>{item.rating.toFixed(1)}</span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <a 
                          href={affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-medium rounded inline-block"
                        >
                          View
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
        
        {/* Link to interactive version */}
        <div className="mt-4 text-center">
          <Link 
            href={'/?category=' + encodeURIComponent(category.name)}
            className="text-blue-400 hover:text-blue-300 text-sm"
          >
            View all {category.name} with filters →
          </Link>
        </div>
      </section>

      {/* SEO Content */}
      <section className="px-4 py-8 border-t border-slate-800 bg-slate-950">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-lg font-bold mb-3">About {category.name}</h2>
          <p className="text-slate-400 text-sm mb-4">{category.description}</p>
          <p className="text-slate-500 text-xs">
            Prices updated daily. As an Amazon Associate we earn from qualifying purchases.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 px-4 py-6 text-center text-xs text-slate-500">
        <div className="flex flex-wrap justify-center gap-4 mb-3">
          <Link href="/" className="hover:text-white">Home</Link>
          <Link href="/blog" className="hover:text-white">Guides</Link>
          <Link href="/deals" className="hover:text-white">Deals</Link>
          <Link href="/privacy" className="hover:text-white">Privacy</Link>
          <Link href="/terms" className="hover:text-white">Terms</Link>
        </div>
        <p>© 2025 Appliance Prices</p>
      </footer>
    </div>
  )
}