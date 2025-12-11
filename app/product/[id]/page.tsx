'use client'

import React, { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Star, ExternalLink, Check, X } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

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

export default function ProductPage() {
  const params = useParams()
  const [product, setProduct] = useState<Appliance | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return
      
      setIsLoading(true)
      const { data, error } = await supabase
        .from('appliances')
        .select('*')
        .eq('id', params.id)
        .single()
      
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

  const images = product.image_urls && product.image_urls.length > 0 
    ? product.image_urls 
    : product.image_url 
      ? [product.image_url] 
      : []

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black">
        <div className="px-4 py-4">
          <Link href="/" className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
            <ArrowLeft className="w-4 h-4" />
            Back to {product.category}
          </Link>
        </div>
      </header>

      <div className="px-4 py-8 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Image Section */}
          <div>
            <div className="bg-white rounded-lg p-4 mb-4">
              {selectedImage ? (
                <img 
                  src={selectedImage} 
                  alt={product.title}
                  className="w-full h-96 object-contain"
                />
              ) : (
                <div className="w-full h-96 bg-slate-200 rounded flex items-center justify-center text-slate-400">
                  No Image
                </div>
              )}
            </div>
            
            {/* Thumbnail Gallery */}
            {images.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedImage(img)}
                    className={`flex-shrink-0 w-16 h-16 bg-white rounded p-1 border-2 ${selectedImage === img ? 'border-blue-500' : 'border-transparent'}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-contain" />
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
              href={product.product_url}
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
  )
}