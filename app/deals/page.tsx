'use client'

import React, { useState, useEffect } from 'react'
import { allCategories } from '@/lib/categoryConfig'
import { TrendingDown, Percent, Star, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

// ⬇️ PUT YOUR AMAZON AFFILIATE TAG HERE ⬇️
const AFFILIATE_TAG = 'appliances04d-20'

// Category IDs for Keepa
const CATEGORY_IDS: Record<string, number> = {
  'Refrigerators': 3741361,
  'Freezers': 3741331,
  'Dishwashers': 3741271,
  'Ranges': 3741411,
  'Washers': 13397491,
  'Dryers': 13397481,
  'Air Fryers': 289913,
  'Ice Makers': 2686378011,
  'Window AC': 1193678,
  'Televisions': 172659
}

type Deal = {
  asin: string
  title: string
  currentPrice: number | null
  previousPrice: number | null
  dropPercent: number | null
  dropAmount: number | null
  salesRank: number | null
  rating: number | null
  reviewCount: number | null
  image: string | null
}

// Build Amazon image URL from ASIN if no image provided
function getImageUrl(image: string | null, asin: string): string {
  if (image) return image
  // Fallback to Amazon product image
  return `https://images-na.ssl-images-amazon.com/images/P/${asin}.jpg`
}

// Image component with hover zoom
function ProductImage({ src, alt, asin }: { src: string | null, alt: string, asin: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const imageUrl = getImageUrl(src, asin)
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a href={`https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`} target="_blank" rel="noopener noreferrer">
        <img 
          src={imageUrl} 
          alt={alt}
          className="w-20 h-20 object-contain cursor-pointer bg-white rounded"
          onError={(e) => {
            // If image fails, show placeholder
            (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 80 80"><rect fill="%23374151" width="80" height="80"/><text fill="%239CA3AF" x="50%" y="50%" text-anchor="middle" dy=".3em" font-size="10">No Image</text></svg>'
          }}
        />
      </a>
      {isHovered && (
        <div className="fixed z-[9999] bg-white p-2 rounded-lg shadow-2xl border border-slate-600" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <img src={imageUrl} alt={alt} className="w-64 h-64 object-contain" />
        </div>
      )}
    </div>
  )
}

export default function DealsPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [minDiscount, setMinDiscount] = useState(20)
  const [dateRange, setDateRange] = useState(1) // 0=day, 1=week, 2=month
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchDeals = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      // Build category IDs array
      let categoryIds: number[] = []
      if (selectedCategory === 'all') {
        categoryIds = Object.values(CATEGORY_IDS)
      } else if (CATEGORY_IDS[selectedCategory]) {
        categoryIds = [CATEGORY_IDS[selectedCategory]]
      }

      const response = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'browse-deals',
          categoryIds,
          minDiscount,
          minPrice: 5000,    // $50 minimum
          maxPrice: 1000000, // $10,000 maximum
          dateRange,
          minRating: 30      // 3+ stars
        })
      })

      const data = await response.json()
      
      if (data.success) {
        setDeals(data.deals || [])
        setLastUpdated(new Date())
      } else {
        setError(data.error || 'Failed to fetch deals')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch deals')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDeals()
  }, [selectedCategory, minDiscount, dateRange])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-600 rounded-lg">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Price Drops</h1>
              <p className="text-xs text-slate-400">Products with recent price reductions</p>
            </div>
          </div>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to Products</Link>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Filters */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap gap-4 items-end">
            {/* Category Filter */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
              >
                <option value="all">All Categories</option>
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Min Discount Filter */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Min Discount</label>
              <select
                value={minDiscount}
                onChange={(e) => setMinDiscount(parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
              >
                <option value={10}>10% off</option>
                <option value={20}>20% off</option>
                <option value={30}>30% off</option>
                <option value={40}>40% off</option>
                <option value={50}>50% off</option>
              </select>
            </div>

            {/* Time Range Filter */}
            <div>
              <label className="block text-xs text-slate-400 mb-1">Price Drop Within</label>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
              >
                <option value={0}>Last 24 hours</option>
                <option value={1}>Last week</option>
                <option value={2}>Last month</option>
                <option value={3}>Last 3 months</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={fetchDeals}
              disabled={isLoading}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
              Refresh
            </button>

            {/* Last Updated */}
            {lastUpdated && (
              <span className="text-xs text-slate-500">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-lg p-4 mb-6 text-red-300">
            {error}
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-slate-400 text-sm">
          {isLoading ? 'Searching for deals...' : `Found ${deals.length} deals`}
        </div>

        {/* Deals Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : deals.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No deals found. Try adjusting your filters.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deals.map((deal) => (
              <div key={deal.asin} className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-slate-500 transition">
                {/* Image */}
                <div className="flex justify-center mb-3">
                  <ProductImage src={deal.image} alt={deal.title || ''} asin={deal.asin} />
                </div>

                {/* Discount Badge - only show if valid number */}
                {deal.dropPercent && !isNaN(deal.dropPercent) && deal.dropPercent > 0 && (
                  <div className="flex justify-center mb-2">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-600 rounded text-sm font-bold">
                      <Percent className="w-3 h-3" />
                      {Math.round(Math.abs(deal.dropPercent))}% OFF
                    </span>
                  </div>
                )}

                {/* Title */}
                <h3 className="text-sm text-slate-300 line-clamp-2 mb-2 min-h-[40px]">
                  {deal.title || 'Unknown Product'}
                </h3>

                {/* Prices */}
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-xl font-bold text-white">
                    {deal.currentPrice ? `$${deal.currentPrice.toLocaleString()}` : '—'}
                  </span>
                  {deal.previousPrice && deal.currentPrice && deal.previousPrice > deal.currentPrice && (
                    <span className="text-sm text-slate-500 line-through">
                      ${deal.previousPrice.toLocaleString()}
                    </span>
                  )}
                </div>

                {/* Savings */}
                {deal.dropAmount && deal.dropAmount > 0 && (
                  <div className="text-green-400 text-sm mb-2">
                    You save: ${deal.dropAmount.toLocaleString()}
                  </div>
                )}

                {/* Rating */}
                {deal.rating && (
                  <div className="flex items-center gap-1 text-sm text-slate-400 mb-3">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    {deal.rating.toFixed(1)}
                    {deal.reviewCount && (
                      <span>({deal.reviewCount.toLocaleString()})</span>
                    )}
                  </div>
                )}

                {/* View on Amazon Button */}
                <a
                  href={`https://www.amazon.com/dp/${deal.asin}?tag=${appliances04d-20}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-yellow-500 text-black font-semibold rounded hover:bg-yellow-400 text-sm"
                >
                  View on Amazon
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        )}

        {/* Affiliate Disclosure */}
        <div className="mt-8 pt-4 border-t border-slate-700">
          <p className="text-xs text-slate-500 text-center">
            As an Amazon Associate we earn from qualifying purchases. Prices and availability are subject to change.
          </p>
        </div>
      </div>
    </div>
  )
}