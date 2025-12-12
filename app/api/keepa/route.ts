'use client'

import React, { useState, useEffect } from 'react'
import { TrendingDown, Percent, Star, ExternalLink, Loader2, RefreshCw } from 'lucide-react'
import Link from 'next/link'

const AFFILIATE_TAG = 'appliances04d-20'

// Categories list
const CATEGORIES = [
  'All Categories',
  'Refrigerators',
  'Freezers',
  'Dishwashers',
  'Ranges',
  'Washers',
  'Dryers',
  'Air Fryers',
  'Ice Makers',
  'Window AC',
  'Televisions'
]

type Deal = {
  id: string
  asin: string
  title: string
  brand: string
  price: number
  list_price: number
  discount: number
  savings: number
  rating: number | null
  review_count: number | null
  image_url: string | null
  category: string
  type: string | null
}

// Image component with hover zoom
function ProductImage({ src, alt, asin }: { src: string | null, alt: string, asin: string }) {
  const [isHovered, setIsHovered] = useState(false)
  const imageUrl = src || `https://images-na.ssl-images-amazon.com/images/P/${asin}.jpg`
  
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
          className="w-24 h-24 object-contain cursor-pointer bg-white rounded"
          onError={(e) => {
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
  const [selectedCategory, setSelectedCategory] = useState<string>('All Categories')
  const [minDiscount, setMinDiscount] = useState(10)
  const [deals, setDeals] = useState<Deal[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchDeals = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'database-deals',
          category: selectedCategory === 'All Categories' ? 'all' : selectedCategory,
          minDiscount,
          limit: 200
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
  }, [selectedCategory, minDiscount])

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black sticky top-0 z-40">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">
              <span className="text-blue-400">Appliance</span> Prices
            </span>
            <span className="text-slate-400 text-sm hidden sm:block">Smart Shoppers Start Here</span>
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-green-400">
              <TrendingDown className="w-5 h-5" />
              <span className="font-medium">Deals</span>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Filters */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Category Filter */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Category</label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Min Discount Filter */}
            <div>
              <label className="text-xs text-slate-400 block mb-1">Min Discount</label>
              <select
                value={minDiscount}
                onChange={(e) => setMinDiscount(parseInt(e.target.value))}
                className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm"
              >
                <option value={5}>5%+</option>
                <option value={10}>10%+</option>
                <option value={15}>15%+</option>
                <option value={20}>20%+</option>
                <option value={25}>25%+</option>
                <option value={30}>30%+</option>
                <option value={40}>40%+</option>
                <option value={50}>50%+</option>
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-end">
              <button
                onClick={fetchDeals}
                disabled={isLoading}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                Refresh
              </button>
            </div>

            {/* Last Updated */}
            {lastUpdated && (
              <span className="text-xs text-slate-500 self-end pb-2">
                Updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-green-900/30 border border-green-700/50 rounded-lg p-4 mb-6">
          <p className="text-green-300 text-sm">
            💰 Showing products where the current price is below the list price. 
            These are instant savings available right now on Amazon!
          </p>
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
            No deals found. Try lowering the minimum discount.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {deals.map((deal) => (
              <a 
                key={deal.id} 
                href={`https://www.amazon.com/dp/${deal.asin}?tag=${AFFILIATE_TAG}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:border-green-500 transition block"
              >
                {/* Discount Badge */}
                <div className="flex justify-between items-start mb-3">
                  <span className="bg-green-600 text-white text-sm font-bold px-2 py-1 rounded">
                    {deal.discount}% OFF
                  </span>
                  <span className="text-xs text-slate-500">{deal.category}</span>
                </div>

                {/* Image */}
                <div className="flex justify-center mb-3">
                  <ProductImage src={deal.image_url} alt={deal.title || ''} asin={deal.asin} />
                </div>

                {/* Brand & Title */}
                <div className="mb-3">
                  {deal.brand && (
                    <p className="text-xs text-slate-500 uppercase">{deal.brand}</p>
                  )}
                  <h3 className="text-sm text-slate-200 line-clamp-2" title={deal.title}>
                    {deal.title}
                  </h3>
                </div>

                {/* Price */}
                <div className="mb-2">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-green-400">
                      ${deal.price?.toFixed(2)}
                    </span>
                    <span className="text-sm text-slate-500 line-through">
                      ${deal.list_price?.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-xs text-green-500">
                    Save ${deal.savings}
                  </p>
                </div>

                {/* Rating */}
                {deal.rating && (
                  <div className="flex items-center gap-1 text-xs text-slate-400">
                    <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                    <span>{deal.rating}</span>
                    {deal.review_count && (
                      <span className="text-slate-500">({deal.review_count.toLocaleString()})</span>
                    )}
                  </div>
                )}

                {/* Type */}
                {deal.type && (
                  <p className="text-xs text-slate-500 mt-1">{deal.type}</p>
                )}
              </a>
            ))}
          </div>
        )}

        {/* Affiliate Disclosure */}
        <div className="mt-8 pt-4 border-t border-slate-800">
          <p className="text-xs text-slate-500 text-center">
            As an Amazon Associate we earn from qualifying purchases. Prices and availability subject to change.
          </p>
        </div>
      </div>
    </div>
  )
}