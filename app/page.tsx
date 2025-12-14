'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { categoryConfig, allCategories } from '@/lib/categoryConfig'
import { Star, Filter, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

// ⬇️ PUT YOUR AMAZON AFFILIATE TAG HERE ⬇️
const AFFILIATE_TAG = 'appliances04d-20'

// Helper to add affiliate tag to Amazon URLs
function getAffiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`
}

// Default words that indicate a product is a part/accessory, not a full appliance
const DEFAULT_FILTER_WORDS = [
  'filter', 'light', 'cord', 'capacitor', 'hinge', 'valve', 'thermostat', 
  'spring', 'light bulb', 'hose', 'clamp', 'drain hose', 'heater', 'damper', 
  'cover', 'sensor', 'tube light', 'replacement', 'overload', 'assembly', 
  'switch', 'circuit', 'board', 'gasket', 'motherboard', 'timer', 'seal',
  'compressor', 'fan motor', 'door handle', 'shelf', 'drawer', 'bin',
  'ice tray', 'water line', 'defrost', 'relay', 'start device'
]

const MINIMUM_PRICE = 50.00

// Check if a product title indicates it's a part/accessory
function isPartOrAccessory(title: string, filterWords: string[]): boolean {
  if (!title) return false
  const lowerTitle = title.toLowerCase()
  return filterWords.some(word => lowerTitle.includes(word.toLowerCase()))
}

// Image component with hover zoom
function ProductImage({ src, alt, link }: { src: string | null, alt: string, link: string }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Link href={link}>
        {src ? (
          <img 
            src={src} 
            alt={alt}
            className="w-16 h-16 object-contain cursor-pointer bg-white rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-slate-700 rounded" />
        )}
      </Link>
      {isHovered && src && (
        <div className="fixed z-[9999] bg-white p-2 rounded-lg shadow-2xl border border-slate-600" style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          <img src={src} alt={alt} className="w-64 h-64 object-contain" />
        </div>
      )}
    </div>
  )
}

type Appliance = {
  id: string
  [key: string]: any
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    }>
      <HomeContent />
    </Suspense>
  )
}

function HomeContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  
  // Get category from URL or default to Refrigerators
  const urlCategory = searchParams.get('category')
  const initialCategory = urlCategory && allCategories.includes(urlCategory) ? urlCategory : 'Refrigerators'
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterWords, setFilterWords] = useState<string[]>(DEFAULT_FILTER_WORDS)
  
  const config = categoryConfig[selectedCategory]

  const [filters, setFilters] = useState({
    types: [] as string[],
    brands: [] as string[],
    colors: [] as string[],
  })

  // Load filter words from Supabase on mount
  useEffect(() => {
    async function loadFilterWords() {
      const { data } = await supabase
        .from('filter_words')
        .select('word')
        .order('word')
      if (data && data.length > 0) {
        setFilterWords(data.map(d => d.word))
      }
    }
    loadFilterWords()
  }, [])

  // Sync URL with category changes
  useEffect(() => {
    if (urlCategory !== selectedCategory) {
      const newUrl = selectedCategory === 'Refrigerators' 
        ? '/' 
        : `/?category=${encodeURIComponent(selectedCategory)}`
      router.replace(newUrl, { scroll: false })
    }
  }, [selectedCategory, urlCategory, router])

  // Update category if URL changes (browser back/forward)
  useEffect(() => {
    if (urlCategory && allCategories.includes(urlCategory) && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory)
      setFilters({ types: [], brands: [], colors: [] })
    }
  }, [urlCategory])

  // Fetch appliances from Supabase
  useEffect(() => {
    async function fetchAppliances() {
      setIsLoading(true)
      try {
        // First get deleted ASINs
        const { data: deletedData } = await supabase
          .from('deleted_asins')
          .select('asin')
        const deletedAsins = new Set(deletedData?.map(d => d.asin) || [])
        
        // Then get appliances with minimum price filter
        const { data, error } = await supabase
          .from('appliances')
          .select('*')
          .eq('category', selectedCategory)
          .not('price', 'is', null)
          .gte('price', MINIMUM_PRICE)
          .order('price', { ascending: true })
          .range(0, 4999) // Get up to 5000 products
        
        if (error) throw error
        
        // Filter out deleted ASINs and parts/accessories
        const filtered = (data || []).filter(item => {
          // Skip deleted ASINs
          if (deletedAsins.has(item.asin)) return false
          // Skip parts/accessories based on title
          if (isPartOrAccessory(item.title, filterWords)) return false
          return true
        })
        setAppliances(filtered)
      } catch (error) {
        console.error('Error fetching appliances:', error)
        setAppliances([])
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAppliances()
  }, [selectedCategory, filterWords])

  // Priority brands to show at top (in alphabetical order)
  const PRIORITY_BRANDS = ['GE', 'Kenmore', 'LG', 'Maytag', 'Samsung', 'Whirlpool']

  const brands = useMemo(() => {
    const brandSet = new Set(appliances.map(a => a.brand).filter(Boolean))
    const allBrands = Array.from(brandSet).sort()
    
    // Separate priority brands from others
    const priorityBrands = PRIORITY_BRANDS.filter(b => brandSet.has(b))
    const otherBrands = allBrands.filter(b => !PRIORITY_BRANDS.includes(b))
    
    return [...priorityBrands, ...otherBrands]
  }, [appliances])

  const colors = useMemo(() => {
    const colorSet = new Set(appliances.map(a => a.color).filter(Boolean))
    return Array.from(colorSet).sort()
  }, [appliances])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(item => {
      if (item.type) {
        counts[item.type] = (counts[item.type] || 0) + 1
      }
    })
    return counts
  }, [appliances])

  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(item => {
      if (item.brand) {
        counts[item.brand] = (counts[item.brand] || 0) + 1
      }
    })
    return counts
  }, [appliances])

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(item => {
      if (item.color) {
        counts[item.color] = (counts[item.color] || 0) + 1
      }
    })
    return counts
  }, [appliances])

  const filteredAppliances = useMemo(() => {
    return appliances.filter(item => {
      if (filters.types.length && !filters.types.includes(item.type)) return false
      if (filters.brands.length && !filters.brands.includes(item.brand)) return false
      if (filters.colors.length && !filters.colors.includes(item.color)) return false
      return true
    })
  }, [appliances, filters])

  const toggleFilter = (key: 'types' | 'brands' | 'colors', value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter(v => v !== value)
        : [...prev[key], value]
    }))
  }

  const handleCategoryChange = (cat: string) => {
    setSelectedCategory(cat)
    setFilters({ types: [], brands: [], colors: [] })
    // URL will be updated by the useEffect
  }

  const getDiscount = (item: Appliance) => {
    if (!item.list_price || item.list_price <= item.price) return null
    return Math.round(((item.list_price - item.price) / item.list_price) * 100)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Sticky */}
      <header className="border-b border-slate-700 bg-black sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="text-2xl font-bold">
              <span className="text-blue-400">Appliance</span> Prices
            </span>
            <span className="text-slate-400 text-sm hidden sm:block">Smart Shoppers Start Here</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/deals" className="flex items-center gap-1 text-green-400 hover:text-green-300 text-sm font-medium">
              🔥 Deals
            </Link>
            <Link href="/admin" className="text-slate-400 hover:text-slate-300 text-sm">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Mobile filter button */}
        <div className="md:hidden mb-4">
          <button 
            onClick={() => setSidebarOpen(true)}
            className="flex items-center gap-2 text-slate-300 border border-slate-600 px-4 py-2 rounded-lg"
          >
            <Filter className="w-4 h-4" />
            Filters
          </button>
        </div>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className={`
            fixed md:relative inset-y-0 left-0 z-50 
            w-72 md:w-56 
            bg-black md:bg-transparent
            transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            md:flex-shrink-0
            p-4 md:p-0
          `}>
            {/* Close button for mobile */}
            <div className="md:hidden flex justify-end mb-4">
              <button onClick={() => setSidebarOpen(false)}>
                <X className="w-5 h-5 text-slate-300" />
              </button>
            </div>

            {/* Category dropdown */}
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Category</label>
              <select 
                value={selectedCategory} 
                onChange={(e) => handleCategoryChange(e.target.value)}
                className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
              >
                {allCategories.map(cat => (
                  <option key={cat} value={cat}>
                    {categoryConfig[cat].title}
                  </option>
                ))}
              </select>
            </div>

            {/* Type filter - expanded */}
            {config.types && config.types.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Type</label>
                <div className="space-y-1">
                  {config.types.map(type => (
                    <label key={type} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={() => toggleFilter('types', type)}
                        className="rounded border-slate-500 bg-slate-700"
                      />
                      <span className="text-slate-300">{type} ({typeCounts[type] || 0})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Brand filter - expanded */}
            {brands.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Brand</label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {brands.map(brand => (
                    <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={() => toggleFilter('brands', brand)}
                        className="rounded border-slate-500 bg-slate-700"
                      />
                      <span className="text-slate-300">{brand} ({brandCounts[brand] || 0})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Color filter - expanded */}
            {colors.length > 0 && (
              <div className="mb-5">
                <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Color</label>
                <div className="space-y-1 max-h-64 overflow-y-auto">
                  {colors.map(color => (
                    <label key={color} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={() => toggleFilter('colors', color)}
                        className="rounded border-slate-500 bg-slate-700"
                      />
                      <span className="text-slate-300">{color} ({colorCounts[color] || 0})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Clear filters button */}
            {(filters.types.length > 0 || filters.brands.length > 0 || filters.colors.length > 0) && (
              <button
                onClick={() => setFilters({ types: [], brands: [], colors: [] })}
                className="w-full text-sm text-red-400 hover:text-red-300 py-2 border border-red-400/30 rounded hover:bg-red-400/10 transition"
              >
                Clear All Filters
              </button>
            )}

            {/* Affiliate Disclosure */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-xs text-slate-500 leading-relaxed">
                As an Amazon Associate we earn from qualifying purchases.
              </p>
            </div>
          </div>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main table */}
          <div className="flex-1 overflow-auto max-h-[calc(100vh-200px)]">
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="h-8 bg-slate-800 rounded animate-pulse" />
                ))}
              </div>
            ) : filteredAppliances.length === 0 ? (
              <div className="text-center py-12 text-slate-400">
                <p className="text-lg mb-2">No products found</p>
                <p className="text-sm">Try changing your filters or add products to your database.</p>
              </div>
            ) : (
              <table className="w-full text-sm border-collapse leading-tight min-w-[600px]">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-slate-600 text-left bg-slate-900">
                    {config.tableColumns.map(col => (
                      <th key={col.key} className="font-semibold text-slate-300 text-sm px-2 py-2 bg-slate-900">
                        {(col.label || '').split('\n').map((line, i, arr) => (
                          <span key={i}>{line}{i < arr.length - 1 && <br />}</span>
                        ))}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredAppliances.map((item) => {
                    const discount = getDiscount(item)
                    return (
                      <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-900">
                        {config.tableColumns.map(col => {
                          if (col.key === 'image') {
                            return (
                              <td key={col.key} className="px-2 py-1">
                                <ProductImage 
                                  src={item.image_url} 
                                  alt={item.title || `${item.brand} ${item.model}`}
                                  link={`/product/${item.asin}`}
                                />
                              </td>
                            )
                          }
                          if (col.key === 'price') {
                            return (
                              <td key={col.key} className="text-white px-2 py-1">
                                ${item.price?.toLocaleString()}
                                {discount && (
                                  <span className="ml-1 text-green-500 text-xs">-{discount}%</span>
                                )}
                              </td>
                            )
                          }
                          if (col.key === 'rating') {
                            return (
                              <td key={col.key} className="px-2 py-1">
                                {item.rating ? (
                                  <span className="flex items-center gap-0.5">
                                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                                    {item.rating.toFixed(1)}
                                  </span>
                                ) : '—'}
                              </td>
                            )
                          }
                          if (col.key === 'link') {
                            return (
                              <td key={col.key} className="px-2 py-1">
                                <a
                                  href={getAffiliateUrl(item.asin)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-400 hover:underline line-clamp-1"
                                  title={item.title}
                                >
                                  {item.title || `${item.brand} ${item.model || ''}`}
                                </a>
                              </td>
                            )
                          }
                          if (col.type === 'boolean') {
                            return (
                              <td key={col.key} className="text-slate-300 px-2 py-1 text-center">
                                {item[col.key] ? <span className="text-yellow-400">★</span> : '—'}
                              </td>
                            )
                          }
                          return (
                            <td key={col.key} className="text-slate-300 px-2 py-1">
                              {item[col.key] ?? '—'}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}