'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { categoryConfig, allCategories } from '@/lib/categoryConfig'
import { Star, Filter, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

const AFFILIATE_TAG = 'appliances04d-20'

function getAffiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`
}

const DEFAULT_FILTER_WORDS = [
  'filter', 'light', 'cord', 'capacitor', 'hinge', 'valve', 'thermostat', 
  'spring', 'light bulb', 'hose', 'clamp', 'drain hose', 'heater', 'damper', 
  'cover', 'sensor', 'tube light', 'replacement', 'overload', 'assembly', 
  'switch', 'circuit', 'board', 'gasket', 'motherboard', 'timer', 'seal',
  'compressor', 'fan motor', 'door handle', 'shelf', 'drawer', 'bin',
  'ice tray', 'water line', 'defrost', 'relay', 'start device'
]

const MINIMUM_PRICE = 50.00

function isPartOrAccessory(title: string, filterWords: string[]): boolean {
  if (!title) return false
  const lowerTitle = title.toLowerCase()
  return filterWords.some(word => lowerTitle.includes(word.toLowerCase()))
}

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
          <img src={src} alt={alt} className="w-32 h-32 object-contain" />
        </div>
      )}
    </div>
  )
}

type Appliance = {
  id: string
  [key: string]: any
}

export default function HomeClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-20">
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
  
  const urlCategory = searchParams.get('category')
  const initialCategory = urlCategory && allCategories.includes(urlCategory) ? urlCategory : 'Refrigerators'
  
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [filterWords, setFilterWords] = useState<string[]>(DEFAULT_FILTER_WORDS)
  
  const config = categoryConfig[selectedCategory]

  const PAGE_SIZE = 50
  const [currentPage, setCurrentPage] = useState(0)

  const [filters, setFilters] = useState({
    types: [] as string[],
    brands: [] as string[],
    colors: [] as string[],
    screenSizes: [] as string[],
  })

  const TV_SIZE_RANGES = [
    { label: '32" and under', min: 0, max: 32 },
    { label: '40" - 43"', min: 40, max: 43 },
    { label: '50" - 55"', min: 50, max: 55 },
    { label: '65"', min: 65, max: 65 },
    { label: '75" and up', min: 75, max: 999 },
  ]

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

  useEffect(() => {
    if (urlCategory !== selectedCategory) {
      const newUrl = selectedCategory === 'Refrigerators' 
        ? '/' 
        : `/?category=${encodeURIComponent(selectedCategory)}`
      router.replace(newUrl, { scroll: false })
    }
  }, [selectedCategory, urlCategory, router])

  useEffect(() => {
    if (urlCategory && allCategories.includes(urlCategory) && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory)
    }
  }, [urlCategory])

  useEffect(() => {
    async function fetchAppliances() {
      setIsLoading(true)
      try {
        const { data: deletedData } = await supabase
          .from('deleted_asins')
          .select('asin')
        const deletedAsins = new Set(deletedData?.map(d => d.asin) || [])

        let allData: any[] = []
        let from = 0
        const batchSize = 1000
        let hasMore = true
        
        while (hasMore) {
          const { data: batchData } = await supabase
            .from('appliances')
            .select('*')
            .eq('category', selectedCategory)
            .gte('price', MINIMUM_PRICE)
            .not('price', 'is', null)
            .order('price', { ascending: true })
            .range(from, from + batchSize - 1)
          
          if (batchData && batchData.length > 0) {
            allData = [...allData, ...batchData]
            from += batchSize
            hasMore = batchData.length === batchSize
          } else {
            hasMore = false
          }
        }
        
        const filtered = allData.filter(item => {
          if (deletedAsins.has(item.asin)) return false
          if (isPartOrAccessory(item.title, filterWords)) return false
          return true
        })
        
        setAppliances(filtered)
      } catch (error) {
        console.error('Error fetching appliances:', error)
      }
      setIsLoading(false)
    }
    
    fetchAppliances()
  }, [selectedCategory, filterWords])

  const COLLAPSED_COUNT = 10
  const EXPANDED_COUNT = 20
  const [brandsExpanded, setBrandsExpanded] = useState(false)
  const [colorsExpanded, setColorsExpanded] = useState(false)

  const { brands, brandCounts } = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(item => {
      if (item.brand) {
        counts[item.brand] = (counts[item.brand] || 0) + 1
      }
    })
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
    return { brands: sorted, brandCounts: counts }
  }, [appliances])

  const { colors, colorCounts } = useMemo(() => {
    const counts: Record<string, number> = {}
    const hasDigit = (str: string) => str.split('').some(c => c >= '0' && c <= '9')
    appliances.forEach(item => {
      if (item.color) {
        const color = item.color
        if (hasDigit(color)) return
        if (color.length > 30) return
        counts[color] = (counts[color] || 0) + 1
      }
    })
    const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a])
    return { colors: sorted, colorCounts: counts }
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

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setFilters({ types: [], brands: [], colors: [], screenSizes: [] })
    setCurrentPage(0)
  }

  const toggleFilter = (filterType: 'types' | 'brands' | 'colors' | 'screenSizes', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }))
    setCurrentPage(0)
  }

  const clearFilters = () => {
    setFilters({ types: [], brands: [], colors: [], screenSizes: [] })
    setCurrentPage(0)
  }

  const hasFilters = filters.types.length > 0 || filters.brands.length > 0 || filters.colors.length > 0 || filters.screenSizes.length > 0

  const filteredAppliances = useMemo(() => {
    return appliances.filter(item => {
      if (filters.types.length > 0 && !filters.types.includes(item.type)) return false
      if (filters.brands.length > 0 && !filters.brands.includes(item.brand)) return false
      if (filters.colors.length > 0 && !filters.colors.includes(item.color)) return false
      if (filters.screenSizes.length > 0 && selectedCategory === 'Televisions') {
        const screenSize = parseFloat(item.screen_size) || 0
        const matchesSize = filters.screenSizes.some(sizeLabel => {
          const range = TV_SIZE_RANGES.find(r => r.label === sizeLabel)
          if (!range) return false
          return screenSize >= range.min && screenSize <= range.max
        })
        if (!matchesSize) return false
      }
      return true
    })
  }, [appliances, filters, selectedCategory])

  const paginatedAppliances = useMemo(() => {
    const start = currentPage * PAGE_SIZE
    return filteredAppliances.slice(start, start + PAGE_SIZE)
  }, [filteredAppliances, currentPage])

  const totalPages = Math.ceil(filteredAppliances.length / PAGE_SIZE)

  const screenSizeCounts = useMemo(() => {
    if (selectedCategory !== 'Televisions') return {}
    const counts: Record<string, number> = {}
    TV_SIZE_RANGES.forEach(range => {
      counts[range.label] = appliances.filter(item => {
        const size = parseFloat(item.screen_size) || 0
        return size >= range.min && size <= range.max
      }).length
    })
    return counts
  }, [appliances, selectedCategory])

  const getDiscount = (item: Appliance) => {
    if (!item.list_price || item.list_price <= item.price) return null
    return Math.round(((item.list_price - item.price) / item.list_price) * 100)
  }

  return (
    <div className="px-4 py-6">
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
        <div className={`fixed md:relative inset-y-0 left-0 z-50 md:z-0 w-72 md:w-56 bg-black md:bg-transparent transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex-shrink-0 p-4 md:p-0 md:sticky md:top-20 md:max-h-screen md:overflow-y-auto`}>
          <div className="md:hidden flex justify-end mb-4">
            <button onClick={() => setSidebarOpen(false)}>
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>

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
                      className="w-4 h-4 rounded border-slate-600 bg-black text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-slate-300">{type} ({typeCounts[type] || 0})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Brand</label>
              <div className="space-y-1">
                {(brandsExpanded ? brands.slice(0, EXPANDED_COUNT) : brands.slice(0, COLLAPSED_COUNT)).map(brand => (
                  <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={filters.brands.includes(brand)}
                      onChange={() => toggleFilter('brands', brand)}
                      className="w-4 h-4 rounded border-slate-600 bg-black text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-slate-300">{brand} ({brandCounts[brand] || 0})</span>
                  </label>
                ))}
              </div>
              {brands.length > COLLAPSED_COUNT && (
                <button
                  onClick={() => setBrandsExpanded(!brandsExpanded)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 px-2"
                >
                  {brandsExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {selectedCategory === 'Televisions' && (
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Screen Size</label>
              <div className="space-y-1">
                {TV_SIZE_RANGES.map(range => (
                  <label key={range.label} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={filters.screenSizes.includes(range.label)}
                      onChange={() => toggleFilter('screenSizes', range.label)}
                      className="w-4 h-4 rounded border-slate-600 bg-black text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-slate-300">{range.label} ({screenSizeCounts[range.label] || 0})</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Color</label>
              <div className="space-y-1">
                {(colorsExpanded ? colors.slice(0, EXPANDED_COUNT) : colors.slice(0, COLLAPSED_COUNT)).map(color => (
                  <label key={color} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                    <input
                      type="checkbox"
                      checked={filters.colors.includes(color)}
                      onChange={() => toggleFilter('colors', color)}
                      className="w-4 h-4 rounded border-slate-600 bg-black text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                    />
                    <span className="text-slate-300">{color} ({colorCounts[color] || 0})</span>
                  </label>
                ))}
              </div>
              {colors.length > COLLAPSED_COUNT && (
                <button
                  onClick={() => setColorsExpanded(!colorsExpanded)}
                  className="mt-2 text-xs text-blue-400 hover:text-blue-300 px-2"
                >
                  {colorsExpanded ? 'Show less' : 'Show more'}
                </button>
              )}
            </div>
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="w-full py-2 text-sm text-red-400 hover:text-red-300 border border-red-400/30 rounded"
            >
              Clear All Filters
            </button>
          )}

          <div className="mt-6 pt-4 border-t border-slate-700">
            <p className="text-xs text-slate-500 leading-relaxed">
              As an Amazon Associate we earn from qualifying purchases.
            </p>
          </div>
        </div>

        {sidebarOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <div className="flex-1 overflow-auto">
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
            <>
              <div className="mb-3 flex justify-between items-center text-sm text-slate-400">
                <span>
                  Showing {currentPage * PAGE_SIZE + 1} - {Math.min((currentPage + 1) * PAGE_SIZE, filteredAppliances.length)} of {filteredAppliances.length} products
                </span>
              </div>

              <div>
                {paginatedAppliances.map((item) => {
                  const discount = getDiscount(item)
                  return (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-slate-800 hover:bg-slate-900/50">
                      <ProductImage 
                        src={item.image_url} 
                        alt={item.title || ''} 
                        link={`/product/${item.asin}`}
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={`/product/${item.asin}`} className="hover:text-blue-400">
                          <h3 className="text-sm font-medium truncate">{item.title}</h3>
                        </Link>
                        <div className="text-xs text-slate-400 mt-1">
                          {item.brand && <span>{item.brand}</span>}
                          {item.model && <span> - {item.model}</span>}
                          {item.type && <span> - {item.type}</span>}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-2">
                          {discount && (
                            <span className="text-xs bg-green-600 text-white px-1.5 py-0.5 rounded">
                              -{discount}%
                            </span>
                          )}
                          <span className="text-lg font-bold text-green-400">
                            ${item.price?.toFixed(2)}
                          </span>
                        </div>
                        {item.list_price && item.list_price > item.price && (
                          <div className="text-xs text-slate-500 line-through">
                            ${item.list_price.toFixed(2)}
                          </div>
                        )}
                        {item.rating && (
                          <div className="flex items-center gap-1 text-xs text-slate-400 mt-1 justify-end">
                            <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
                            {item.rating.toFixed(1)}
                            {item.review_count && (
                              <span className="text-slate-500">({item.review_count.toLocaleString()})</span>
                            )}
                          </div>
                        )}
                      </div>
                      <a 
                        href={getAffiliateUrl(item.asin)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black text-sm font-medium rounded"
                      >
                        View
                      </a>
                    </div>
                  )
                })}
              </div>

              {totalPages > 1 && (
                <div className="mt-4 flex items-center justify-center gap-2">
                  <button 
                    onClick={() => setCurrentPage(0)} 
                    disabled={currentPage === 0}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300"
                  >
                    First
                  </button>
                  <button 
                    onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
                    disabled={currentPage === 0}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300"
                  >
                    Prev
                  </button>
                  <div className="flex items-center gap-1 px-2">
                    <span className="text-sm text-slate-400">Page</span>
                    <input
                      type="number"
                      min={1}
                      max={totalPages}
                      value={currentPage + 1}
                      onChange={(e) => {
                        const page = parseInt(e.target.value) - 1
                        if (page >= 0 && page < totalPages) {
                          setCurrentPage(page)
                        }
                      }}
                      className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-center text-slate-300"
                    />
                    <span className="text-sm text-slate-400">of {totalPages}</span>
                  </div>
                  <button 
                    onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300"
                  >
                    Next
                  </button>
                  <button 
                    onClick={() => setCurrentPage(totalPages - 1)} 
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300"
                  >
                    Last
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      </div>
      </div>
  )
}