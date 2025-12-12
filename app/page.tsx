'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { categoryConfig, allCategories } from '@/lib/categoryConfig'
import { Star, ChevronDown, X } from 'lucide-react'
import Link from 'next/link'

const AFFILIATE_TAG = 'appliances04d-20'

function getAffiliateUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AFFILIATE_TAG}`
}

const PARTS_FILTER_WORDS = [
  'filter', 'light', 'cord', 'capacitor', 'hinge', 'valve', 'thermostat', 
  'spring', 'light bulb', 'hose', 'clamp', 'drain hose', 'heater', 'damper', 
  'cover', 'sensor', 'tube light', 'replacement', 'overload', 'assembly', 
  'switch', 'circuit', 'board', 'gasket', 'motherboard', 'timer', 'seal',
  'compressor', 'fan motor', 'door handle', 'shelf', 'drawer', 'bin',
  'ice tray', 'water line', 'defrost', 'relay', 'start device',
  'kegerator', 'keg cooler', 'beer dispenser', 'beverage cooler'
]

const MINIMUM_PRICE = 50.00

function isPartOrAccessory(title: string): boolean {
  if (!title) return false
  const lowerTitle = title.toLowerCase()
  return PARTS_FILTER_WORDS.some(word => lowerTitle.includes(word.toLowerCase()))
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
            className="w-12 h-12 object-contain bg-white rounded cursor-pointer"
          />
        ) : (
          <div className="w-12 h-12 bg-slate-700 rounded" />
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

// Filter chip component
function FilterChip({ 
  label, 
  count, 
  selected, 
  onClick 
}: { 
  label: string
  count?: number
  selected: boolean
  onClick: () => void 
}) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 rounded-full text-sm transition whitespace-nowrap ${
        selected 
          ? 'bg-blue-600 text-white' 
          : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
      }`}
    >
      {label}{count !== undefined && ` (${count})`}
    </button>
  )
}

// Dropdown filter component
function FilterDropdown({ 
  label, 
  options, 
  selected, 
  onToggle,
  counts
}: { 
  label: string
  options: string[]
  selected: string[]
  onToggle: (value: string) => void
  counts: Record<string, number>
}) {
  const [isOpen, setIsOpen] = useState(false)
  
  if (options.length === 0) return null
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition ${
          selected.length > 0 
            ? 'bg-blue-600 text-white' 
            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
        }`}
      >
        {label}{selected.length > 0 && ` (${selected.length})`}
        <ChevronDown className="w-3 h-3" />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 mt-1 bg-slate-800 border border-slate-600 rounded-lg shadow-xl z-50 min-w-[180px] max-h-64 overflow-y-auto">
            {options.map(option => (
              <label 
                key={option} 
                className="flex items-center gap-2 px-3 py-2 hover:bg-slate-700 cursor-pointer text-sm"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(option)}
                  onChange={() => onToggle(option)}
                  className="rounded border-slate-500"
                />
                <span className="text-slate-300">{option}</span>
                <span className="text-slate-500 ml-auto">{counts[option] || 0}</span>
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

type Appliance = {
  id: string
  [key: string]: any
}

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Refrigerators')
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const config = categoryConfig[selectedCategory]

  const [filters, setFilters] = useState({
    types: [] as string[],
    brands: [] as string[],
    colors: [] as string[],
  })

  // Fetch appliances from Supabase
  useEffect(() => {
    async function fetchAppliances() {
      setIsLoading(true)
      try {
        const { data: deletedData } = await supabase
          .from('deleted_asins')
          .select('asin')
        const deletedAsins = new Set(deletedData?.map(d => d.asin) || [])
        
        const { data, error } = await supabase
          .from('appliances')
          .select('*')
          .eq('category', selectedCategory)
          .not('price', 'is', null)
          .gte('price', MINIMUM_PRICE)
          .order('price', { ascending: true })
          .limit(2000)
        
        if (error) throw error
        
        const filtered = (data || []).filter(item => {
          if (deletedAsins.has(item.asin)) return false
          if (isPartOrAccessory(item.title)) return false
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
  }, [selectedCategory])

  // Get unique values for filters
  const brands = useMemo(() => {
    const brandSet = new Set(appliances.map(a => a.brand).filter(Boolean))
    return Array.from(brandSet).sort()
  }, [appliances])

  const colors = useMemo(() => {
    const colorSet = new Set(appliances.map(a => a.color).filter(Boolean))
    return Array.from(colorSet).sort()
  }, [appliances])

  // Count items per filter value
  const brandCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(a => {
      if (a.brand) counts[a.brand] = (counts[a.brand] || 0) + 1
    })
    return counts
  }, [appliances])

  const colorCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(a => {
      if (a.color) counts[a.color] = (counts[a.color] || 0) + 1
    })
    return counts
  }, [appliances])

  const typeCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    appliances.forEach(a => {
      if (a.type) counts[a.type] = (counts[a.type] || 0) + 1
    })
    return counts
  }, [appliances])

  // Filter appliances
  const filteredAppliances = useMemo(() => {
    return appliances.filter(item => {
      if (filters.types.length > 0 && !filters.types.includes(item.type)) return false
      if (filters.brands.length > 0 && !filters.brands.includes(item.brand)) return false
      if (filters.colors.length > 0 && !filters.colors.includes(item.color)) return false
      return true
    })
  }, [appliances, filters])

  const toggleFilter = (filterType: 'types' | 'brands' | 'colors', value: string) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: prev[filterType].includes(value)
        ? prev[filterType].filter(v => v !== value)
        : [...prev[filterType], value]
    }))
  }

  const clearFilters = () => {
    setFilters({ types: [], brands: [], colors: [] })
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setFilters({ types: [], brands: [], colors: [] })
  }

  const hasActiveFilters = filters.types.length > 0 || filters.brands.length > 0 || filters.colors.length > 0

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black sticky top-0 z-30">
        <div className="px-4 py-3 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-lg font-bold">
              <span className="text-blue-400">Appliance</span> Prices
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/deals" className="text-green-400 hover:text-green-300 text-sm font-medium">
              🔥 Deals
            </Link>
            <Link href="/admin" className="text-slate-400 hover:text-slate-300 text-sm">
              Admin
            </Link>
          </div>
        </div>
      </header>

      <div className="px-4 py-6 max-w-7xl mx-auto">
        {/* Page Title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2">{config.title} Prices - Compare Best Deals</h1>
          <p className="text-slate-400">
            Compare {filteredAppliances.length} {selectedCategory.toLowerCase()} from Amazon. {config.description}
          </p>
        </div>

        {/* Category Tabs */}
        <div className="mb-4 flex flex-wrap gap-2">
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => handleCategoryChange(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Filters Row */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-slate-400 text-sm">Filter:</span>
          
          {/* Type Filter - inline chips for smaller lists */}
          {config.types && config.types.length > 0 && config.types.length <= 6 && (
            config.types.map(type => (
              <FilterChip
                key={type}
                label={type}
                count={typeCounts[type]}
                selected={filters.types.includes(type)}
                onClick={() => toggleFilter('types', type)}
              />
            ))
          )}
          
          {/* Type Filter - dropdown for larger lists */}
          {config.types && config.types.length > 6 && (
            <FilterDropdown
              label="Type"
              options={config.types}
              selected={filters.types}
              onToggle={(v) => toggleFilter('types', v)}
              counts={typeCounts}
            />
          )}
          
          {/* Brand Dropdown */}
          <FilterDropdown
            label="Brand"
            options={brands}
            selected={filters.brands}
            onToggle={(v) => toggleFilter('brands', v)}
            counts={brandCounts}
          />
          
          {/* Color Dropdown */}
          <FilterDropdown
            label="Color"
            options={colors}
            selected={filters.colors}
            onToggle={(v) => toggleFilter('colors', v)}
            counts={colorCounts}
          />
          
          {/* Clear filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 px-3 py-1 text-sm text-red-400 hover:text-red-300"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>

        {/* Products Table */}
        <div className="overflow-auto">
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(10)].map((_, i) => (
                <div key={i} className="h-10 bg-slate-800 rounded animate-pulse" />
              ))}
            </div>
          ) : filteredAppliances.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <p className="text-lg mb-2">No products found</p>
              <p className="text-sm">Try changing your filters.</p>
            </div>
          ) : (
            <table className="w-full text-sm border-collapse min-w-[600px]">
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
                  return (
                    <tr key={item.id} className="border-b border-slate-700 hover:bg-slate-800/50">
                      {config.tableColumns.map(col => {
                        if (col.key === 'image') {
                          return (
                            <td key={col.key} className="px-2 py-1">
                              <ProductImage 
                                src={item.image_url} 
                                alt={item.title || ''} 
                                link={`/product/${item.asin}`}
                              />
                            </td>
                          )
                        }
                        if (col.key === 'price') {
                          return (
                            <td key={col.key} className="px-2 py-1 font-semibold text-white">
                              {item.price ? `$${item.price.toLocaleString()}` : '—'}
                            </td>
                          )
                        }
                        if (col.key === 'rating') {
                          return (
                            <td key={col.key} className="px-2 py-1">
                              {item.rating ? (
                                <span className="flex items-center gap-1 text-slate-300">
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
                            <td key={col.key} className="text-slate-300 px-2 py-1">
                              {item[col.key] ? '✓' : '—'}
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