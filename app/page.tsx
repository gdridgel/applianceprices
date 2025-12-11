'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { categoryConfig, allCategories } from '@/lib/categoryConfig'
import { Star, Zap, Filter, X } from 'lucide-react'

type Appliance = { id: string, [key: string]: any }

export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState('Refrigerators')
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const config = categoryConfig[selectedCategory]
  const [filters, setFilters] = useState({ types: [] as string[], brands: [] as string[], colors: [] as string[] })

  useEffect(() => {
    async function fetchAppliances() {
      setIsLoading(true)
      const { data, error } = await supabase.from('appliances').select('*').eq('category', selectedCategory).not('price', 'is', null).order('price', { ascending: true }).limit(1000)
      if (!error) setAppliances(data || [])
      setIsLoading(false)
    }
    fetchAppliances()
  }, [selectedCategory])

  const brands = useMemo(() => Array.from(new Set(appliances.map(a => a.brand).filter(Boolean))).sort(), [appliances])
  const colors = useMemo(() => Array.from(new Set(appliances.map(a => a.color).filter(Boolean))).sort(), [appliances])
  const typeCounts = useMemo(() => { const c: Record<string,number> = {}; appliances.forEach(i => { if(i.type) c[i.type] = (c[i.type]||0)+1 }); return c }, [appliances])
  const brandCounts = useMemo(() => { const c: Record<string,number> = {}; appliances.forEach(i => { if(i.brand) c[i.brand] = (c[i.brand]||0)+1 }); return c }, [appliances])
  const colorCounts = useMemo(() => { const c: Record<string,number> = {}; appliances.forEach(i => { if(i.color) c[i.color] = (c[i.color]||0)+1 }); return c }, [appliances])

  const filteredAppliances = useMemo(() => appliances.filter(item => {
    if (filters.types.length && !filters.types.includes(item.type)) return false
    if (filters.brands.length && !filters.brands.includes(item.brand)) return false
    if (filters.colors.length && !filters.colors.includes(item.color)) return false
    return true
  }), [appliances, filters])

  const toggleFilter = (key: 'types'|'brands'|'colors', value: string) => {
    setFilters(prev => ({ ...prev, [key]: prev[key].includes(value) ? prev[key].filter(v => v !== value) : [...prev[key], value] }))
  }

  const handleCategoryChange = (cat: string) => { setSelectedCategory(cat); setFilters({ types: [], brands: [], colors: [] }) }
  const getDiscount = (item: Appliance) => { if (!item.list_price || item.list_price <= item.price) return null; return Math.round(((item.list_price - item.price) / item.list_price) * 100) }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-slate-700 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 rounded-lg"><Zap className="w-5 h-5 text-white" /></div>
            <div><h1 className="text-xl font-bold text-white">appliance-prices.com</h1><p className="text-xs text-slate-400">Compare prices across all major appliances</p></div>
          </div>
        </div>
      </header>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2">{config.title} Prices - Compare Best Deals</h2>
          <p className="text-slate-400">Compare {filteredAppliances.length} {selectedCategory.toLowerCase()} from Amazon. {config.description}</p>
        </div>
        <div className="md:hidden mb-4"><button onClick={() => setSidebarOpen(true)} className="flex items-center gap-2 text-slate-300 border border-slate-600 px-4 py-2 rounded-lg"><Filter className="w-4 h-4" />Filters</button></div>
        <div className="flex gap-6">
          <div className={`fixed md:relative inset-y-0 left-0 z-50 w-64 md:w-48 bg-black md:bg-transparent transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'} md:flex-shrink-0 overflow-y-auto p-4 md:p-0`}>
            <div className="md:hidden flex justify-end mb-4"><button onClick={() => setSidebarOpen(false)}><X className="w-5 h-5 text-slate-300" /></button></div>
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-400 mb-1 block">Category</label>
              <select value={selectedCategory} onChange={(e) => handleCategoryChange(e.target.value)} className="w-full bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm text-white">
                {allCategories.map(cat => <option key={cat} value={cat}>{categoryConfig[cat].title}</option>)}
              </select>
            </div>
            {config.types && config.types.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-400 mb-2 block">Type</label>
                <div className="space-y-1">{config.types.map(type => <label key={type} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-1 py-0.5 rounded"><input type="checkbox" checked={filters.types.includes(type)} onChange={() => toggleFilter('types', type)} className="rounded border-slate-500" /><span className="text-slate-300">{type} ({typeCounts[type] || 0})</span></label>)}</div>
              </div>
            )}
            {brands.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-400 mb-2 block">Brand</label>
                <div className="space-y-1 max-h-48 overflow-y-auto">{brands.map(brand => <label key={brand} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-1 py-0.5 rounded"><input type="checkbox" checked={filters.brands.includes(brand)} onChange={() => toggleFilter('brands', brand)} className="rounded border-slate-500" /><span className="text-slate-300">{brand} ({brandCounts[brand] || 0})</span></label>)}</div>
              </div>
            )}
            {colors.length > 0 && (
              <div className="mb-4">
                <label className="text-xs font-semibold text-slate-400 mb-2 block">Color</label>
                <div className="space-y-1 max-h-48 overflow-y-auto">{colors.map(color => <label key={color} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-slate-800 px-1 py-0.5 rounded"><input type="checkbox" checked={filters.colors.includes(color)} onChange={() => toggleFilter('colors', color)} className="rounded border-slate-500" /><span className="text-slate-300">{color} ({colorCounts[color] || 0})</span></label>)}</div>
              </div>
            )}
            <div className="mt-6 pt-4 border-t border-slate-700"><p className="text-xs text-slate-400 leading-relaxed">As an Amazon Associate we earn from qualifying purchases.</p></div>
          </div>
          {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-40 md:hidden" onClick={() => setSidebarOpen(false)} />}
          <div className="flex-1 overflow-x-auto">
            {isLoading ? (
              <div className="space-y-2">{[...Array(10)].map((_, i) => <div key={i} className="h-8 bg-slate-800 rounded animate-pulse" />)}</div>
            ) : filteredAppliances.length === 0 ? (
              <div className="text-center py-12 text-slate-400"><p className="text-lg mb-2">No products found</p><p className="text-sm">Try changing your filters or add products via the admin page.</p></div>
            ) : (
              <table className="w-full text-sm border-collapse leading-tight min-w-[600px]">
                <thead><tr className="border-b border-slate-600 text-left bg-slate-900">{config.tableColumns.map(col => <th key={col.key} className="font-semibold text-slate-300 text-sm px-2 py-2">{col.label}</th>)}</tr></thead>
                <tbody>
                  {filteredAppliances.map((item) => {
                    const discount = getDiscount(item)
                    return (
                      <tr key={item.id} className="border-b border-slate-800 hover:bg-slate-900">
                        {config.tableColumns.map(col => {
                          if (col.key === 'image') return <td key={col.key} className="px-2 py-1">{item.image_url ? <img src={item.image_url} alt={item.title || ''} className="w-8 h-8 object-contain" /> : <div className="w-8 h-8 bg-slate-700 rounded" />}</td>
                          if (col.key === 'price') return <td key={col.key} className="text-white px-2 py-1">${item.price?.toLocaleString()}{discount && <span className="ml-1 text-green-500 text-xs">-{discount}%</span>}</td>
                          if (col.key === 'rating') return <td key={col.key} className="px-2 py-1">{item.rating ? <span className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" />{item.rating.toFixed(1)}</span> : '—'}</td>
                          if (col.key === 'link') return <td key={col.key} className="px-2 py-1"><a href={item.product_url} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline line-clamp-1" title={item.title}>{item.title || `${item.brand} ${item.model || ''}`}</a></td>
                          if (col.type === 'boolean') return <td key={col.key} className="text-slate-300 px-2 py-1">{item[col.key] ? '✓' : '—'}</td>
                          return <td key={col.key} className="text-slate-300 px-2 py-1">{item[col.key] ?? '—'}</td>
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