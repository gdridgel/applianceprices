'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { categoryConfig, allCategories } from '@/lib/categoryConfig'
import { Star, Filter, X, Loader2 } from 'lucide-react'
import Link from 'next/link'

const AFFILIATE_TAG = 'appliances04d-20'

function getAffiliateUrl(asin: string): string {
  return 'https://www.amazon.com/dp/' + asin + '?tag=' + AFFILIATE_TAG
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
  return filterWords.some(function(word) { 
    return lowerTitle.includes(word.toLowerCase()) 
  })
}

function ProductImage(props: { src: string | null, alt: string, link: string }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div 
      className="relative"
      onMouseEnter={function() { setIsHovered(true) }}
      onMouseLeave={function() { setIsHovered(false) }}
    >
      <Link href={props.link}>
        {props.src ? (
          <img 
            src={props.src} 
            alt={props.alt}
            className="w-16 h-16 object-contain cursor-pointer bg-white rounded"
          />
        ) : (
          <div className="w-16 h-16 bg-slate-700 rounded" />
        )}
      </Link>
      {isHovered && props.src && (
        <div 
          className="fixed z-[9999] bg-white p-2 rounded-lg shadow-2xl border border-slate-600" 
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <img src={props.src} alt={props.alt} className="w-32 h-32 object-contain" />
        </div>
      )}
    </div>
  )
}

type Appliance = {
  id: string
  asin: string
  title: string
  brand: string
  model: string
  type: string
  color: string
  price: number
  list_price: number
  rating: number
  review_count: number
  image_url: string
  screen_size: string
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
  const initialCategory = (urlCategory && allCategories.includes(urlCategory)) ? urlCategory : 'Refrigerators'
  
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

  useEffect(function() {
    async function loadFilterWords() {
      const result = await supabase
        .from('filter_words')
        .select('word')
        .order('word')
      if (result.data && result.data.length > 0) {
        setFilterWords(result.data.map(function(d) { return d.word }))
      }
    }
    loadFilterWords()
  }, [])

  useEffect(function() {
    if (urlCategory !== selectedCategory) {
      var newUrl = selectedCategory === 'Refrigerators' 
        ? '/' 
        : '/?category=' + encodeURIComponent(selectedCategory)
      router.replace(newUrl, { scroll: false })
    }
  }, [selectedCategory, urlCategory, router])

  useEffect(function() {
    if (urlCategory && allCategories.includes(urlCategory) && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory)
    }
  }, [urlCategory])

  useEffect(function() {
    async function fetchAppliances() {
      setIsLoading(true)
      try {
        var deletedResponse = await supabase
          .from('deleted_asins')
          .select('asin')
        var deletedAsins = new Set((deletedResponse.data || []).map(function(d) { return d.asin }))

        var allData: any[] = []
        var from = 0
        var batchSize = 1000
        var hasMore = true
        
        while (hasMore) {
          var batchResponse = await supabase
            .from('appliances')
            .select('*')
            .eq('category', selectedCategory)
            .gte('price', MINIMUM_PRICE)
            .not('price', 'is', null)
            .order('price', { ascending: true })
            .range(from, from + batchSize - 1)
          
          if (batchResponse.data && batchResponse.data.length > 0) {
            allData = allData.concat(batchResponse.data)
            from += batchSize
            hasMore = batchResponse.data.length === batchSize
          } else {
            hasMore = false
          }
        }
        
        var filtered = allData.filter(function(item) {
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

  var COLLAPSED_COUNT = 10
  var EXPANDED_COUNT = 20
  const [brandsExpanded, setBrandsExpanded] = useState(false)
  const [colorsExpanded, setColorsExpanded] = useState(false)

  var brandsData = useMemo(function() {
    var counts: Record<string, number> = {}
    appliances.forEach(function(item) {
      if (item.brand) {
        counts[item.brand] = (counts[item.brand] || 0) + 1
      }
    })
    var sorted = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a] })
    return { brands: sorted, brandCounts: counts }
  }, [appliances])

  var brands = brandsData.brands
  var brandCounts = brandsData.brandCounts

  var colorsData = useMemo(function() {
    var counts: Record<string, number> = {}
    appliances.forEach(function(item) {
      if (item.color) {
        var color = item.color
        var hasDigit = false
        for (var i = 0; i < color.length; i++) {
          if (color[i] >= '0' && color[i] <= '9') {
            hasDigit = true
            break
          }
        }
        if (hasDigit) return
        if (color.length > 30) return
        counts[color] = (counts[color] || 0) + 1
      }
    })
    var sorted = Object.keys(counts).sort(function(a, b) { return counts[b] - counts[a] })
    return { colors: sorted, colorCounts: counts }
  }, [appliances])

  var colors = colorsData.colors
  var colorCounts = colorsData.colorCounts

  var typeCounts = useMemo(function() {
    var counts: Record<string, number> = {}
    appliances.forEach(function(item) {
      if (item.type) {
        counts[item.type] = (counts[item.type] || 0) + 1
      }
    })
    return counts
  }, [appliances])

  function handleCategoryChange(category: string) {
    setSelectedCategory(category)
    setFilters({ types: [], brands: [], colors: [], screenSizes: [] })
    setCurrentPage(0)
  }

  function toggleFilter(filterType: 'types' | 'brands' | 'colors' | 'screenSizes', value: string) {
    setFilters(function(prev) {
      var newArr = prev[filterType].includes(value)
        ? prev[filterType].filter(function(v) { return v !== value })
        : prev[filterType].concat([value])
      return { ...prev, [filterType]: newArr }
    })
    setCurrentPage(0)
  }

  function clearFilters() {
    setFilters({ types: [], brands: [], colors: [], screenSizes: [] })
    setCurrentPage(0)
  }

  var hasFilters = filters.types.length > 0 || filters.brands.length > 0 || filters.colors.length > 0 || filters.screenSizes.length > 0

  var filteredAppliances = useMemo(function() {
    return appliances.filter(function(item) {
      if (filters.types.length > 0 && !filters.types.includes(item.type)) return false
      if (filters.brands.length > 0 && !filters.brands.includes(item.brand)) return false
      if (filters.colors.length > 0 && !filters.colors.includes(item.color)) return false
      if (filters.screenSizes.length > 0 && selectedCategory === 'Televisions') {
        var screenSize = parseFloat(item.screen_size) || 0
        var matchesSize = filters.screenSizes.some(function(sizeLabel) {
          var range = TV_SIZE_RANGES.find(function(r) { return r.label === sizeLabel })
          if (!range) return false
          return screenSize >= range.min && screenSize <= range.max
        })
        if (!matchesSize) return false
      }
      return true
    })
  }, [appliances, filters, selectedCategory])

  var paginatedAppliances = useMemo(function() {
    var start = currentPage * PAGE_SIZE
    return filteredAppliances.slice(start, start + PAGE_SIZE)
  }, [filteredAppliances, currentPage])

  var totalPages = Math.ceil(filteredAppliances.length / PAGE_SIZE)

  var screenSizeCounts = useMemo(function() {
    if (selectedCategory !== 'Televisions') return {}
    var counts: Record<string, number> = {}
    TV_SIZE_RANGES.forEach(function(range) {
      counts[range.label] = appliances.filter(function(item) {
        var size = parseFloat(item.screen_size) || 0
        return size >= range.min && size <= range.max
      }).length
    })
    return counts
  }, [appliances, selectedCategory])

  function getDiscount(item: Appliance) {
    if (!item.list_price || item.list_price <= item.price) return null
    return Math.round(((item.list_price - item.price) / item.list_price) * 100)
  }

  var sidebarClasses = "fixed md:relative inset-y-0 left-0 z-50 md:z-0 w-72 md:w-56 bg-black md:bg-transparent transform transition-transform duration-300 ease-in-out md:flex-shrink-0 p-4 md:p-0 md:sticky md:top-20 md:max-h-screen md:overflow-y-auto"
  if (sidebarOpen) {
    sidebarClasses += " translate-x-0"
  } else {
    sidebarClasses += " -translate-x-full md:translate-x-0"
  }

  return (
    <div className="px-4 py-6">
      <div className="md:hidden mb-4">
        <button 
          onClick={function() { setSidebarOpen(true) }}
          className="flex items-center gap-2 text-slate-300 border border-slate-600 px-4 py-2 rounded-lg"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-6">
        <div className={sidebarClasses}>
          <div className="md:hidden flex justify-end mb-4">
            <button onClick={function() { setSidebarOpen(false) }}>
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          <div className="mb-5">
            <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Category</label>
            <select 
              value={selectedCategory} 
              onChange={function(e) { handleCategoryChange(e.target.value) }}
              className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white"
            >
              {allCategories.map(function(cat) {
                return (
                  <option key={cat} value={cat}>
                    {categoryConfig[cat].title}
                  </option>
                )
              })}
            </select>
          </div>

          {config.types && config.types.length > 0 && (
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Type</label>
              <div className="space-y-1">
                {config.types.map(function(type) {
                  return (
                    <label key={type} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={function() { toggleFilter('types', type) }}
                        className="w-4 h-4 rounded border-slate-600 bg-black text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-slate-300">{type} ({typeCounts[type] || 0})</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Brand</label>
              <div className="space-y-1">
                {(brandsExpanded ? brands.slice(0, EXPANDED_COUNT) : brands.slice(0, COLLAPSED_COUNT)).map(function(brand) {
                  return (
                    <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={function() { toggleFilter('brands', brand) }}
                        className="w-4 h-4 rounded border-slate-600 bg-black text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-slate-300">{brand} ({brandCounts[brand] || 0})</span>
                    </label>
                  )
                })}
              </div>
              {brands.length > COLLAPSED_COUNT && (
                <button
                  onClick={function() { setBrandsExpanded(!brandsExpanded) }}
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
                {TV_SIZE_RANGES.map(function(range) {
                  return (
                    <label key={range.label} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.screenSizes.includes(range.label)}
                        onChange={function() { toggleFilter('screenSizes', range.label) }}
                        className="w-4 h-4 rounded border-slate-600 bg-black text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-slate-300">{range.label} ({screenSizeCounts[range.label] || 0})</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {colors.length > 0 && (
            <div className="mb-5">
              <label className="text-xs font-semibold text-slate-400 mb-2 block uppercase tracking-wide">Color</label>
              <div className="space-y-1">
                {(colorsExpanded ? colors.slice(0, EXPANDED_COUNT) : colors.slice(0, COLLAPSED_COUNT)).map(function(color) {
                  return (
                    <label key={color} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-2 py-1 rounded">
                      <input
                        type="checkbox"
                        checked={filters.colors.includes(color)}
                        onChange={function() { toggleFilter('colors', color) }}
                        className="w-4 h-4 rounded border-slate-600 bg-black text-green-500 focus:ring-green-500 focus:ring-offset-0 cursor-pointer"
                      />
                      <span className="text-slate-300">{color} ({colorCounts[color] || 0})</span>
                    </label>
                  )
                })}
              </div>
              {colors.length > COLLAPSED_COUNT && (
                <button
                  onClick={function() { setColorsExpanded(!colorsExpanded) }}
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
            onClick={function() { setSidebarOpen(false) }}
          />
        )}

        <div className="flex-1 overflow-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[1,2,3,4,5,6,7,8,9,10].map(function(i) {
                return <div key={i} className="h-8 bg-slate-800 rounded animate-pulse" />
              })}
            </div>
          ) : filteredAppliances.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">No products found</p>
              <p className="text-sm">Try changing your filters or add products to your database.</p>
            </div>
          ) : (
            <React.Fragment>
              <div className="mb-3 flex justify-between items-center text-sm text-slate-400">
                <span>
                  Showing {currentPage * PAGE_SIZE + 1} - {Math.min((currentPage + 1) * PAGE_SIZE, filteredAppliances.length)} of {filteredAppliances.length} products
                </span>
              </div>

              {/* Column Headers */}
              <div className="hidden md:flex items-center gap-4 py-2 border-b border-slate-700 text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <div className="w-16">Image</div>
                <div className="flex-1">Product</div>
                <div className="w-32 text-right">Price</div>
                <div className="w-20">Action</div>
              </div>

              <div>
                {paginatedAppliances.map(function(item) {
                  var discount = getDiscount(item)
                  var productLink = '/product/' + item.asin
                  return (
                    <div key={item.id} className="flex items-center gap-4 py-3 border-b border-slate-800 hover:bg-slate-900/50">
                      <ProductImage 
                        src={item.image_url} 
                        alt={item.title || ''} 
                        link={productLink}
                      />
                      <div className="flex-1 min-w-0">
                        <Link href={productLink} className="hover:text-blue-400">
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
                            ${item.price ? item.price.toFixed(2) : '0.00'}
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
                    onClick={function() { setCurrentPage(0) }} 
                    disabled={currentPage === 0}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300"
                  >
                    First
                  </button>
                  <button 
                    onClick={function() { setCurrentPage(Math.max(0, currentPage - 1)) }} 
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
                      onChange={function(e) {
                        var page = parseInt(e.target.value) - 1
                        if (page >= 0 && page < totalPages) {
                          setCurrentPage(page)
                        }
                      }}
                      className="w-16 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-sm text-center text-slate-300"
                    />
                    <span className="text-sm text-slate-400">of {totalPages}</span>
                  </div>
                  <button 
                    onClick={function() { setCurrentPage(Math.min(totalPages - 1, currentPage + 1)) }} 
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300"
                  >
                    Next
                  </button>
                  <button 
                    onClick={function() { setCurrentPage(totalPages - 1) }} 
                    disabled={currentPage >= totalPages - 1}
                    className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300"
                  >
                    Last
                  </button>
                </div>
              )}
            </React.Fragment>
          )}
        </div>
      </div>
    </div>
  )
}