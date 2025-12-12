'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Star, ExternalLink, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

// ⬇️ PUT YOUR AMAZON AFFILIATE TAG HERE ⬇️
const AFFILIATE_TAG = 'appliances04d-20'

type Appliance = {
  id: string
  asin: string
  title: string
  brand: string
  model: string
  color: string
  type: string
  price: number
  list_price: number
  rating: number
  review_count: number
  image_url: string
  image_urls: string[]
  video_urls: string[]
  product_url: string
  category: string
  width_in: number
  depth_in: number
  height_in: number
  weight_lbs: number
  capacity_cu_ft: number
  energy_star: boolean
  ice_maker: boolean
  water_dispenser: boolean
}

// Check if URL is a video
function isVideoUrl(url: string): boolean {
  if (!url) return false
  const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov']
  const lowerUrl = url.toLowerCase()
  return videoExtensions.some(ext => lowerUrl.includes(ext)) || lowerUrl.includes('video')
}

// Generate JSON-LD structured data for product
function generateProductSchema(product: Appliance) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    description: `${product.brand} ${product.model} ${product.type || product.category}`,
    brand: {
      '@type': 'Brand',
      name: product.brand
    },
    image: product.image_urls?.length > 0 ? product.image_urls : [product.image_url],
    sku: product.asin,
    mpn: product.model,
    offers: {
      '@type': 'Offer',
      url: `https://appliance-prices.com/product/${product.asin}`,
      priceCurrency: 'USD',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: 'Amazon'
      }
    },
    aggregateRating: product.rating ? {
      '@type': 'AggregateRating',
      ratingValue: product.rating,
      bestRating: 5,
      reviewCount: product.review_count || 1
    } : undefined
  }
}

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Appliance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return
      
      setIsLoading(true)
      
      const idParam = params.id as string
      let data = null
      let error = null
      
      // Try ASIN lookup first (ASINs are 10 chars, alphanumeric)
      // Most start with B but not all
      if (/^[A-Z0-9]{10}$/i.test(idParam)) {
        const result = await supabase
          .from('appliances')
          .select('*')
          .eq('asin', idParam.toUpperCase())
          .single()
        data = result.data
        error = result.error
      }
      
      // Fall back to ID lookup if ASIN didn't work or wasn't an ASIN format
      if (!data) {
        const result = await supabase
          .from('appliances')
          .select('*')
          .eq('id', idParam)
          .single()
        data = result.data
        error = result.error
      }
      
      if (!error && data) {
        setProduct(data)
        setSelectedImage(data.image_url)
      }
      setIsLoading(false)
    }
    
    fetchProduct()
  }, [params.id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-slate-400 mb-4">Product not found</div>
        <Link href="/" className="text-blue-400 hover:text-blue-300">← Back to Home</Link>
      </div>
    )
  }

  const discount = product.list_price && product.list_price > product.price
    ? Math.round(((product.list_price - product.price) / product.list_price) * 100)
    : null

  // Separate images and videos
  const allMedia = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : product.image_url 
      ? [product.image_url] 
      : []
  
  const images = allMedia.filter(url => !isVideoUrl(url))
  const videos = [
    ...(product.video_urls || []),
    ...allMedia.filter(url => isVideoUrl(url))
  ]

  return (
    <>
      {/* Product Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(generateProductSchema(product))
        }}
      />
      
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-slate-700 bg-black">
          <div className="px-4 py-4">
            <Link 
              href={product.category === 'Refrigerators' ? '/' : `/?category=${encodeURIComponent(product.category)}`} 
              className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to {product.category}
            </Link>
          </div>
        </header>

      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Media Section */}
          <div>
            <div className="bg-white rounded-lg p-4 mb-4">
              {selectedImage ? (
                isVideoUrl(selectedImage) ? (
                  <video 
                    src={selectedImage}
                    controls
                    className="w-full h-96 object-contain"
                  />
                ) : (
                  <img 
                    src={selectedImage} 
                    alt={product.title}
                    className="w-full h-96 object-contain"
                  />
                )
              ) : (
                <div className="w-full h-96 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                  No Image
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery (images and videos) */}
            {(images.length > 1 || videos.length > 0) && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={`img-${i}`}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-16 h-16 bg-white rounded p-1 border-2 ${selectedImage === img ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
                  </button>
                ))}
                {videos.map((vid, i) => (
                  <button
                    key={`vid-${i}`}
                    onClick={() => setSelectedImage(vid)}
                    className={`flex-shrink-0 w-16 h-16 bg-slate-800 rounded p-1 border-2 flex items-center justify-center ${selectedImage === vid ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <span className="text-white text-xs">▶ Video</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div>
            <div className="mb-2">
              <span className="text-slate-400 text-sm">{product.brand}</span>
            </div>
            
            <h1 className="text-2xl font-bold mb-4">{product.title}</h1>
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
                  <span className="font-semibold">{product.rating.toFixed(1)}</span>
                </div>
                {product.review_count && (
                  <span className="text-slate-400 text-sm">({product.review_count.toLocaleString()} reviews)</span>
                )}
              </div>
            )}
            
            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold text-white">${product.price?.toLocaleString()}</span>
                {product.list_price && product.list_price > product.price && (
                  <>
                    <span className="text-lg text-slate-500 line-through">${product.list_price.toLocaleString()}</span>
                    <span className="text-green-500 font-semibold">-{discount}%</span>
                  </>
                )}
              </div>
            </div>
            
            {/* Buy Button */}
            <a
              href={`https://www.amazon.com/dp/${product.asin}?tag=${AFFILIATE_TAG}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-lg hover:bg-yellow-400 mb-8"
            >
              View on Amazon
              <ExternalLink className="w-4 h-4" />
            </a>
            
            {/* Specs Table */}
            <div className="border border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-800 px-4 py-2 font-semibold">Specifications</div>
              <table className="w-full text-sm">
                <tbody>
                  {product.brand && (
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-400">Brand</td>
                      <td className="px-4 py-2">{product.brand}</td>
                    </tr>
                  )}
                  {product.model && (
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-400">Model</td>
                      <td className="px-4 py-2">{product.model}</td>
                    </tr>
                  )}
                  {product.type && (
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-400">Type</td>
                      <td className="px-4 py-2">{product.type}</td>
                    </tr>
                  )}
                  {product.color && (
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-400">Color</td>
                      <td className="px-4 py-2">{product.color}</td>
                    </tr>
                  )}
                  {product.capacity_cu_ft && (
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-400">Capacity</td>
                      <td className="px-4 py-2">{product.capacity_cu_ft} cu. ft.</td>
                    </tr>
                  )}
                  {(product.width_in || product.depth_in || product.height_in) && (
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-400">Dimensions (W×D×H)</td>
                      <td className="px-4 py-2">
                        {product.width_in || '—'}" × {product.depth_in || '—'}" × {product.height_in || '—'}"
                      </td>
                    </tr>
                  )}
                  {product.weight_lbs && (
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-400">Weight</td>
                      <td className="px-4 py-2">{product.weight_lbs} lbs</td>
                    </tr>
                  )}
                  <tr className="border-t border-slate-700">
                    <td className="px-4 py-2 text-slate-400">Energy Star</td>
                    <td className="px-4 py-2">
                      {product.energy_star ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-slate-500" />}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="px-4 py-2 text-slate-400">Ice Maker</td>
                    <td className="px-4 py-2">
                      {product.ice_maker ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-slate-500" />}
                    </td>
                  </tr>
                  <tr className="border-t border-slate-700">
                    <td className="px-4 py-2 text-slate-400">Water Dispenser</td>
                    <td className="px-4 py-2">
                      {product.water_dispenser ? <Check className="w-4 h-4 text-green-500" /> : <X className="w-4 h-4 text-slate-500" />}
                    </td>
                  </tr>
                  {product.asin && (
                    <tr className="border-t border-slate-700">
                      <td className="px-4 py-2 text-slate-400">ASIN</td>
                      <td className="px-4 py-2">{product.asin}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Affiliate Disclosure */}
      <div className="border-t border-slate-700 mt-8">
        <div className="px-4 py-4 max-w-6xl mx-auto">
          <p className="text-xs text-slate-500">
            As an Amazon Associate we earn from qualifying purchases. Product prices and availability are accurate as of the date/time indicated and are subject to change. Any price and availability information displayed on Amazon at the time of purchase will apply to the purchase of this product.
          </p>
        </div>
      </div>
    </div>
    </>
  )
}