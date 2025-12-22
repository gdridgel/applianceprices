'use client'

import React, { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { categoryConfig, allCategories } from '@/lib/categoryConfig'
import { Star, Filter, X, Loader2, Check } from 'lucide-react'
import Link from 'next/link'

var AFFILIATE_TAG = 'appliances04d-20'

function getAffiliateUrl(asin: string): string {
  return 'https://www.amazon.com/dp/' + asin + '?tag=' + AFFILIATE_TAG
}

var DEFAULT_FILTER_WORDS = [
  'filter', 'light', 'cord', 'capacitor', 'hinge', 'valve', 'thermostat', 
  'spring', 'light bulb', 'hose', 'clamp', 'drain hose', 'heater', 'damper', 
  'cover', 'sensor', 'tube light', 'replacement', 'overload', 'assembly', 
  'switch', 'circuit', 'board', 'gasket', 'motherboard', 'timer', 'seal',
  'compressor', 'fan motor', 'door handle', 'shelf', 'drawer', 'bin',
  'ice tray', 'water line', 'defrost', 'relay', 'start device'
]

var MINIMUM_PRICE = 50.00

function isPartOrAccessory(title: string, filterWords: string[]): boolean {
  if (!title) return false
  var lowerTitle = title.toLowerCase()
  return filterWords.some(function(word) { 
    return lowerTitle.includes(word.toLowerCase()) 
  })
}

function ProductImage(props: { src: string | null, alt: string, link: string }) {
  var [isHovered, setIsHovered] = useState(false)
  
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
            className="w-12 h-12 object-contain cursor-pointer bg-white rounded"
          />
        ) : (
          <div className="w-12 h-12 bg-slate-700 rounded" />
        )}
      </Link>
      {isHovered && props.src && (
        <div 
          className="fixed z-[9999] bg-white p-2 rounded-lg shadow-2xl border border-slate-600" 
          style={{ top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}
        >
          <img src={props.src} alt={props.alt} className="w-48 h-48 object-contain" />
        </div>
      )}
    </div>
  )
}

function BooleanCell(props: { value: boolean | null | undefined }) {
  if (props.value === true) {
    return <Check className="w-4 h-4 text-green-500" />
  }
  return <span className="text-slate-600">—</span>
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
  width_inches: number
  height_inches: number
  depth_inches: number
  total_capacity_cuft: number
  fridge_capacity_cuft: number
  freezer_capacity_cuft: number
  capacity_cuft: number
  capacity_quarts: number
  btu: number
  cooling_sqft: number
  energy_star: boolean
  ice_maker: boolean
  water_dispenser: boolean
  smart_features: boolean
  [key: string]: any
}

// This is the exported component - it provides the Suspense boundary
export default function HomeClient() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        <span className="ml-2 text-slate-400">Loading products...</span>
      </div>
    }>
      <HomeClientInner />
    </Suspense>
  )
}

// Inner component that uses useSearchParams
function HomeClientInner() {
  var searchParams = useSearchParams()
  var router = useRouter()
  
  var urlCategory = searchParams.get('category')
  var initialCategory = (urlCategory && allCategories.includes(urlCategory)) ? urlCategory : 'Refrigerators'
  
  var [selectedCategory, setSelectedCategory] = useState(initialCategory)
  var [appliances, setAppliances] = useState<Appliance[]>([])
  var [isLoading, setIsLoading] = useState(true)
  var [sidebarOpen, setSidebarOpen] = useState(false)
  var [filterWords, setFilterWords] = useState<string[]>(DEFAULT_FILTER_WORDS)
  
  var config = categoryConfig[selectedCategory]

  var PAGE_SIZE = 50
  var [currentPage, setCurrentPage] = useState(0)

  var [filters, setFilters] = useState({
    types: [] as string[],
    brands: [] as string[],
    colors: [] as string[],
    screenSizes: [] as string[],
  })

  var TV_SIZE_RANGES = [
    { label: '32" and under', min: 0, max: 32 },
    { label: '40" - 43"', min: 40, max: 43 },
    { label: '50" - 55"', min: 50, max: 55 },
    { label: '65"', min: 65, max: 65 },
    { label: '75" and up', min: 75, max: 999 },
  ]

  useEffect(function() {
    async function loadFilterWords() {
      var result = await supabase
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
  var [brandsExpanded, setBrandsExpanded] = useState(false)
  var [colorsExpanded, setColorsExpanded] = useState(false)

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

  function formatDimension(val: number | null | undefined) {
    if (val === null || val === undefined) return '—'
    return val.toFixed(1) + '"'
  }

  function formatCapacity(val: number | null | undefined, unit: string) {
    if (val === null || val === undefined) return '—'
    return val.toFixed(1) + ' ' + unit
  }

  var sidebarClasses = "fixed md:relative inset-y-0 left-0 z-50 md:z-0 w-72 md:w-48 bg-black md:bg-transparent transform transition-transform duration-300 ease-in-out md:flex-shrink-0 p-4 md:p-0 md:sticky md:top-20 md:max-h-screen md:overflow-y-auto"
  if (sidebarOpen) {
    sidebarClasses += " translate-x-0"
  } else {
    sidebarClasses += " -translate-x-full md:translate-x-0"
  }

  function getTableColumns() {
    var cat = selectedCategory
    if (cat === 'Refrigerators') {
      return ['image', 'price', 'brand', 'model', 'type', 'total_capacity', 'fridge_capacity', 'freezer_capacity', 'height', 'depth', 'energy_star', 'ice_maker', 'water_dispenser', 'rating', 'action']
    } else if (cat === 'Washers') {
      return ['image', 'price', 'brand', 'model', 'type', 'capacity', 'height', 'depth', 'energy_star', 'smart', 'rating', 'action']
    } else if (cat === 'Dryers') {
      return ['image', 'price', 'brand', 'model', 'type', 'capacity', 'height', 'depth', 'energy_star', 'smart', 'rating', 'action']
    } else if (cat === 'Air Fryers') {
      return ['image', 'price', 'brand', 'model', 'type', 'capacity_qt', 'wattage', 'rating', 'action']
    } else if (cat === 'Ice Makers') {
      return ['image', 'price', 'brand', 'model', 'type', 'daily_production', 'storage', 'rating', 'action']
    } else if (cat === 'Air Conditioners') {
      return ['image', 'price', 'brand', 'model', 'type', 'btu', 'cooling_sqft', 'energy_star', 'rating', 'action']
    } else if (cat === 'Televisions') {
      return ['image', 'price', 'brand', 'model', 'screen_size', 'type', 'smart', 'rating', 'action']
    } else if (cat === 'Dishwashers') {
      return ['image', 'price', 'brand', 'model', 'type', 'width', 'height', 'depth', 'energy_star', 'rating', 'action']
    } else if (cat === 'Freezers') {
      return ['image', 'price', 'brand', 'model', 'type', 'capacity', 'height', 'depth', 'energy_star', 'rating', 'action']
    } else if (cat === 'Ranges') {
      return ['image', 'price', 'brand', 'model', 'type', 'width', 'rating', 'action']
    } else if (cat === 'Cell Phones') {
      return ['image', 'price', 'brand', 'model', 'storage', 'screen_size', 'rating', 'action']
    }
    return ['image', 'price', 'brand', 'model', 'type', 'rating', 'action']
  }

  function getColumnHeader(col: string) {
    var headers: Record<string, string> = {
      'image': '',
      'price': 'Price',
      'brand': 'Brand',
      'model': 'Model',
      'type': 'Type',
      'total_capacity': 'Total',
      'fridge_capacity': 'Fridge',
      'freezer_capacity': 'Freezer',
      'capacity': 'Capacity',
      'capacity_qt': 'Capacity',
      'height': 'H',
      'width': 'W',
      'depth': 'D',
      'energy_star': 'E★',
      'ice_maker': 'Ice',
      'water_dispenser': 'Water',
      'smart': 'Smart',
      'rating': '★',
      'action': '',
      'btu': 'BTU',
      'cooling_sqft': 'Sq.Ft',
      'wattage': 'Watts',
      'daily_production': 'lbs/day',
      'storage': 'Storage',
      'screen_size': 'Screen',
    }
    return headers[col] || col
  }

  function renderCell(item: Appliance, col: string) {
    var productLink = '/product/' + item.asin
    
    if (col === 'image') {
      return <ProductImage src={item.image_url} alt={item.title || ''} link={productLink} />
    }
    if (col === 'price') {
      var discount = getDiscount(item)
      return (
        <div className="text-right">
          <div className="font-bold text-green-400">${item.price ? item.price.toFixed(0) : '—'}</div>
          {discount && <div className="text-xs text-green-500">-{discount}%</div>}
        </div>
      )
    }
    if (col === 'brand') return <span className="text-xs">{item.brand || '—'}</span>
    if (col === 'model') {
      return (
        <Link href={productLink} className="text-xs text-blue-400 hover:underline truncate block max-w-[120px]">
          {item.model || item.title?.substring(0, 30) || '—'}
        </Link>
      )
    }
    if (col === 'type') return <span className="text-xs">{item.type || '—'}</span>
    if (col === 'total_capacity') return <span className="text-xs">{formatCapacity(item.total_capacity_cuft, 'cu.ft.')}</span>
    if (col === 'fridge_capacity') return <span className="text-xs">{formatCapacity(item.fridge_capacity_cuft, '')}</span>
    if (col === 'freezer_capacity') return <span className="text-xs">{formatCapacity(item.freezer_capacity_cuft, '')}</span>
    if (col === 'capacity') return <span className="text-xs">{formatCapacity(item.capacity_cuft, 'cu.ft.')}</span>
    if (col === 'capacity_qt') return <span className="text-xs">{formatCapacity(item.capacity_quarts, 'qt')}</span>
    if (col === 'height') return <span className="text-xs">{formatDimension(item.height_inches)}</span>
    if (col === 'width') return <span className="text-xs">{formatDimension(item.width_inches)}</span>
    if (col === 'depth') return <span className="text-xs">{formatDimension(item.depth_inches)}</span>
    if (col === 'energy_star') return <BooleanCell value={item.energy_star} />
    if (col === 'ice_maker') return <BooleanCell value={item.ice_maker} />
    if (col === 'water_dispenser') return <BooleanCell value={item.water_dispenser} />
    if (col === 'smart') return <BooleanCell value={item.smart_features} />
    if (col === 'btu') return <span className="text-xs">{item.btu ? item.btu.toLocaleString() : '—'}</span>
    if (col === 'cooling_sqft') return <span className="text-xs">{item.cooling_sqft || '—'}</span>
    if (col === 'wattage') return <span className="text-xs">{item.wattage || '—'}</span>
    if (col === 'daily_production') return <span className="text-xs">{item.daily_production_lbs || '—'}</span>
    if (col === 'storage') return <span className="text-xs">{item.storage_capacity_lbs ? item.storage_capacity_lbs + ' lbs' : '—'}</span>
    if (col === 'screen_size') return <span className="text-xs">{item.screen_size ? item.screen_size + '"' : '—'}</span>
    if (col === 'rating') {
      if (!item.rating) return <span className="text-slate-600">—</span>
      return (
        <div className="flex items-center gap-0.5 text-xs">
          <Star className="w-3 h-3 fill-yellow-500 text-yellow-500" />
          <span>{item.rating.toFixed(1)}</span>
        </div>
      )
    }
    if (col === 'action') {
      return (
        <a 
          href={getAffiliateUrl(item.asin)}
          target="_blank"
          rel="noopener noreferrer"
          className="px-2 py-1 bg-yellow-500 hover:bg-yellow-400 text-black text-xs font-medium rounded"
        >
          View
        </a>
      )
    }
    return <span className="text-xs">—</span>
  }

  var tableColumns = getTableColumns()

  return (
    <div className="px-4 py-4">
      <div className="md:hidden mb-4">
        <button 
          onClick={function() { setSidebarOpen(true) }}
          className="flex items-center gap-2 text-slate-300 border border-slate-600 px-4 py-2 rounded-lg"
        >
          <Filter className="w-4 h-4" />
          Filters
        </button>
      </div>

      <div className="flex gap-4">
        <div className={sidebarClasses}>
          <div className="md:hidden flex justify-end mb-4">
            <button onClick={function() { setSidebarOpen(false) }}>
              <X className="w-5 h-5 text-slate-300" />
            </button>
          </div>

          <div className="mb-4">
            <label className="text-xs font-semibold text-slate-400 mb-1 block uppercase tracking-wide">Category</label>
            <select 
              value={selectedCategory} 
              onChange={function(e) { handleCategoryChange(e.target.value) }}
              className="w-full bg-slate-800 border border-slate-600 rounded px-2 py-1.5 text-sm text-white"
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
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 mb-1 block uppercase tracking-wide">Type</label>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                {config.types.map(function(type) {
                  return (
                    <label key={type} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-800 px-1 py-0.5 rounded">
                      <input
                        type="checkbox"
                        checked={filters.types.includes(type)}
                        onChange={function() { toggleFilter('types', type) }}
                        className="w-3 h-3 rounded border-slate-600 bg-black text-green-500"
                      />
                      <span className="text-slate-300 truncate">{type} ({typeCounts[type] || 0})</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {brands.length > 0 && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 mb-1 block uppercase tracking-wide">Brand</label>
              <div className="space-y-0.5 max-h-40 overflow-y-auto">
                {(brandsExpanded ? brands.slice(0, EXPANDED_COUNT) : brands.slice(0, COLLAPSED_COUNT)).map(function(brand) {
                  return (
                    <label key={brand} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-800 px-1 py-0.5 rounded">
                      <input
                        type="checkbox"
                        checked={filters.brands.includes(brand)}
                        onChange={function() { toggleFilter('brands', brand) }}
                        className="w-3 h-3 rounded border-slate-600 bg-black text-green-500"
                      />
                      <span className="text-slate-300 truncate">{brand} ({brandCounts[brand] || 0})</span>
                    </label>
                  )
                })}
              </div>
              {brands.length > COLLAPSED_COUNT && (
                <button
                  onClick={function() { setBrandsExpanded(!brandsExpanded) }}
                  className="mt-1 text-xs text-blue-400 hover:text-blue-300"
                >
                  {brandsExpanded ? 'Less' : 'More'}
                </button>
              )}
            </div>
          )}

          {selectedCategory === 'Televisions' && (
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 mb-1 block uppercase tracking-wide">Screen Size</label>
              <div className="space-y-0.5">
                {TV_SIZE_RANGES.map(function(range) {
                  return (
                    <label key={range.label} className="flex items-center gap-2 text-xs cursor-pointer hover:bg-slate-800 px-1 py-0.5 rounded">
                      <input
                        type="checkbox"
                        checked={filters.screenSizes.includes(range.label)}
                        onChange={function() { toggleFilter('screenSizes', range.label) }}
                        className="w-3 h-3 rounded border-slate-600 bg-black text-green-500"
                      />
                      <span className="text-slate-300">{range.label} ({screenSizeCounts[range.label] || 0})</span>
                    </label>
                  )
                })}
              </div>
            </div>
          )}

          {hasFilters && (
            <button
              onClick={clearFilters}
              className="w-full py-1.5 text-xs text-red-400 hover:text-red-300 border border-red-400/30 rounded"
            >
              Clear Filters
            </button>
          )}

          <div className="mt-4 pt-3 border-t border-slate-700">
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
              <p className="text-sm">Try changing your filters.</p>
            </div>
          ) : (
            <React.Fragment>
              <div className="mb-2 text-xs text-slate-400">
                Showing {currentPage * PAGE_SIZE + 1}-{Math.min((currentPage + 1) * PAGE_SIZE, filteredAppliances.length)} of {filteredAppliances.length}
              </div>

              <div className="border border-slate-700 rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-slate-800 sticky top-0">
                      <tr>
                        {tableColumns.map(function(col) {
                          return (
                            <th key={col} className="px-2 py-2 text-left text-xs font-semibold text-slate-400 whitespace-nowrap">
                              {getColumnHeader(col)}
                            </th>
                          )
                        })}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {paginatedAppliances.map(function(item, idx) {
                        return (
                          <tr key={item.id} className={idx % 2 === 0 ? 'bg-slate-900/50' : 'bg-slate-900/30'}>
                            {tableColumns.map(function(col) {
                              return (
                                <td key={col} className="px-2 py-2 whitespace-nowrap">
                                  {renderCell(item, col)}
                                </td>
                              )
                            })}
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {totalPages > 1 && (
                <div className="mt-3 flex items-center justify-center gap-2">
                  <button 
                    onClick={function() { setCurrentPage(0) }} 
                    disabled={currentPage === 0}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-300"
                  >
                    First
                  </button>
                  <button 
                    onClick={function() { setCurrentPage(Math.max(0, currentPage - 1)) }} 
                    disabled={currentPage === 0}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-300"
                  >
                    Prev
                  </button>
                  <span className="text-xs text-slate-400">
                    Page {currentPage + 1} of {totalPages}
                  </span>
                  <button 
                    onClick={function() { setCurrentPage(Math.min(totalPages - 1, currentPage + 1)) }} 
                    disabled={currentPage >= totalPages - 1}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-300"
                  >
                    Next
                  </button>
                  <button 
                    onClick={function() { setCurrentPage(totalPages - 1) }} 
                    disabled={currentPage >= totalPages - 1}
                    className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-xs text-slate-300"
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