'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { allCategories } from '@/lib/categoryConfig'
import { Trash2, Plus, Upload, Loader2, CheckCircle, AlertCircle, RefreshCw, Search, Zap, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

// Words that indicate a product is a part/accessory, not a full appliance
const PARTS_FILTER_WORDS = [
  'filter', 'light', 'cord', 'capacitor', 'hinge', 'valve', 'thermostat', 
  'spring', 'light bulb', 'hose', 'clamp', 'drain hose', 'heater', 'damper', 
  'cover', 'sensor', 'tube light', 'replacement', 'overload', 'assembly', 
  'switch', 'circuit', 'board', 'gasket', 'motherboard', 'timer', 'seal',
  'compressor', 'fan motor', 'door handle', 'shelf', 'drawer', 'bin',
  'ice tray', 'water line', 'defrost', 'relay', 'start device'
]

const MINIMUM_PRICE = 50.00

function isPartOrAccessory(title: string): boolean {
  if (!title) return false
  const lowerTitle = title.toLowerCase()
  return PARTS_FILTER_WORDS.some(word => lowerTitle.includes(word.toLowerCase()))
}

// Image component with hover zoom
function ProductImage({ src, alt }: { src: string | null, alt: string }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <div className="relative">
      {src ? (
        <img 
          src={src} 
          alt={alt}
          className="w-16 h-16 object-contain bg-white rounded cursor-pointer"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        />
      ) : (
        <div className="w-16 h-16 bg-slate-700 rounded" />
      )}
      {isHovered && src && (
        <div className="absolute z-50 left-full ml-2 top-0 bg-white p-2 rounded-lg shadow-xl border border-slate-600">
          <img src={src} alt={alt} className="w-48 h-48 object-contain" />
        </div>
      )}
    </div>
  )
}

type Appliance = {
  id: string
  asin?: string
  [key: string]: any
}

const PAGE_SIZE = 50

export default function AdminPage() {
  const [selectedCategory, setSelectedCategory] = useState('Refrigerators')
  const [appliances, setAppliances] = useState<Appliance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [counts, setCounts] = useState<Record<string, number>>({})
  const [importing, setImporting] = useState(false)
  const [importResult, setImportResult] = useState<{success: boolean, added: number, errors: number} | null>(null)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProduct, setNewProduct] = useState({
    category: 'Refrigerators',
    brand: '',
    model: '',
    title: '',
    price: '',
    product_url: '',
    image_url: '',
    type: '',
  })
  const [adding, setAdding] = useState(false)

  // Pagination
  const [currentPage, setCurrentPage] = useState(0)
  const [totalCount, setTotalCount] = useState(0)

  // Selection for bulk delete
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [bulkDeleting, setBulkDeleting] = useState(false)

  // Keepa states
  const [discovering, setDiscovering] = useState(false)
  const [discoverResult, setDiscoverResult] = useState<any>(null)
  const [refreshingPrices, setRefreshingPrices] = useState(false)
  const [refreshResult, setRefreshResult] = useState<any>(null)
  const [fullSyncing, setFullSyncing] = useState(false)
  const [fullSyncResult, setFullSyncResult] = useState<any>(null)
  const [fetchingDetails, setFetchingDetails] = useState(false)
  
  // Cleanup state
  const [cleaning, setCleaning] = useState(false)
  const [cleanupResult, setCleanupResult] = useState<any>(null)

  const fetchCounts = useCallback(async () => {
    const newCounts: Record<string, number> = {}
    for (const cat of allCategories) {
      const { count } = await supabase
        .from('appliances')
        .select('*', { count: 'exact', head: true })
        .eq('category', cat)
      newCounts[cat] = count || 0
    }
    setCounts(newCounts)
  }, [])

  const fetchAppliances = useCallback(async () => {
    setIsLoading(true)
    setSelectedIds(new Set()) // Clear selections when fetching
    
    // Get deleted ASINs first
    const { data: deletedData } = await supabase
      .from('deleted_asins')
      .select('asin')
    const deletedAsins = new Set(deletedData?.map(d => d.asin) || [])
    
    // Get total count for category (excluding deleted)
    const { data: allData } = await supabase
      .from('appliances')
      .select('id, asin')
      .eq('category', selectedCategory)
    
    const filteredIds = (allData || []).filter(item => !deletedAsins.has(item.asin)).map(item => item.id)
    setTotalCount(filteredIds.length)
    
    // Get paginated data
    const from = currentPage * PAGE_SIZE
    const to = from + PAGE_SIZE - 1
    
    const { data, error } = await supabase
      .from('appliances')
      .select('*')
      .eq('category', selectedCategory)
      .order('price', { ascending: true })
      .range(from, Math.min(to, 1000))
    
    if (!error) {
      // Filter out deleted ASINs
      const filtered = (data || []).filter(item => !deletedAsins.has(item.asin))
      // Take only PAGE_SIZE items after filtering
      setAppliances(filtered.slice(0, PAGE_SIZE))
    }
    setIsLoading(false)
  }, [selectedCategory, currentPage])

  useEffect(() => {
    fetchCounts()
  }, [fetchCounts])

  useEffect(() => {
    fetchAppliances()
  }, [fetchAppliances])

  useEffect(() => {
    setCurrentPage(0)
  }, [selectedCategory])

  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  // Toggle single item selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Select all on current page
  const toggleSelectAll = () => {
    if (selectedIds.size === appliances.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(appliances.map(a => a.id)))
    }
  }

  // Bulk delete selected items
  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Delete ${selectedIds.size} selected products and block their ASINs?`)) return
    
    setBulkDeleting(true)
    try {
      // Get ASINs for selected items
      const selectedAppliances = appliances.filter(a => selectedIds.has(a.id))
      const asinsToBlock = selectedAppliances.map(a => a.asin).filter(Boolean)
      
      // Add to deleted_asins
      if (asinsToBlock.length > 0) {
        await supabase.from('deleted_asins').upsert(
          asinsToBlock.map(asin => ({ asin })),
          { onConflict: 'asin' }
        )
      }
      
      // Delete from appliances
      const idsArray = Array.from(selectedIds)
      for (let i = 0; i < idsArray.length; i += 100) {
        const batch = idsArray.slice(i, i + 100)
        await supabase.from('appliances').delete().in('id', batch)
      }
      
      // Refresh
      await fetchAppliances()
      await fetchCounts()
      setSelectedIds(new Set())
    } finally {
      setBulkDeleting(false)
    }
  }

  const handleDeleteAll = async () => {
    if (!confirm(`Delete ALL ${selectedCategory}? This will also block all ASINs.`)) return
    if (!confirm('Are you absolutely sure?')) return
    
    // Get all ASINs first
    const { data: allProducts } = await supabase
      .from('appliances')
      .select('asin')
      .eq('category', selectedCategory)
    
    const asins = allProducts?.map(p => p.asin).filter(Boolean) || []
    
    // Block all ASINs
    if (asins.length > 0) {
      for (let i = 0; i < asins.length; i += 100) {
        const batch = asins.slice(i, i + 100)
        await supabase.from('deleted_asins').upsert(
          batch.map(asin => ({ asin })),
          { onConflict: 'asin' }
        )
      }
    }
    
    // Delete all
    const { error } = await supabase.from('appliances').delete().eq('category', selectedCategory)
    if (!error) {
      setAppliances([])
      setCounts(prev => ({ ...prev, [selectedCategory]: 0 }))
      setTotalCount(0)
    }
  }

  const handleCleanupDatabase = async () => {
    if (!confirm(`This will delete all parts/accessories and items under $${MINIMUM_PRICE} from ${selectedCategory}. Continue?`)) return
    
    setCleaning(true)
    setCleanupResult(null)
    
    try {
      // Get ALL products in category (not just current page)
      let allProducts: Appliance[] = []
      let page = 0
      const batchSize = 1000
      
      while (true) {
        const { data, error } = await supabase
          .from('appliances')
          .select('id, asin, title, price')
          .eq('category', selectedCategory)
          .range(page * batchSize, (page + 1) * batchSize - 1)
        
        if (error) throw error
        if (!data || data.length === 0) break
        
        allProducts = [...allProducts, ...data]
        if (data.length < batchSize) break
        page++
      }
      
      let partsDeleted = 0
      let lowPriceDeleted = 0
      const idsToDelete: string[] = []
      const asinsToBlock: string[] = []
      
      for (const product of allProducts) {
        let shouldDelete = false
        
        if (isPartOrAccessory(product.title)) {
          partsDeleted++
          shouldDelete = true
        } else if (product.price !== null && product.price < MINIMUM_PRICE) {
          lowPriceDeleted++
          shouldDelete = true
        }
        
        if (shouldDelete) {
          idsToDelete.push(product.id)
          if (product.asin) asinsToBlock.push(product.asin)
        }
      }
      
      // Add ASINs to blocked list
      if (asinsToBlock.length > 0) {
        for (let i = 0; i < asinsToBlock.length; i += 100) {
          const batch = asinsToBlock.slice(i, i + 100)
          await supabase.from('deleted_asins').upsert(
            batch.map(asin => ({ asin })),
            { onConflict: 'asin' }
          )
        }
      }
      
      // Delete products in batches
      for (let i = 0; i < idsToDelete.length; i += 100) {
        const batch = idsToDelete.slice(i, i + 100)
        await supabase.from('appliances').delete().in('id', batch)
      }
      
      setCleanupResult({
        success: true,
        partsDeleted,
        lowPriceDeleted,
        total: idsToDelete.length
      })
      
      // Refresh data
      await fetchCounts()
      await fetchAppliances()
      
    } catch (error: any) {
      setCleanupResult({ success: false, error: error.message })
    } finally {
      setCleaning(false)
    }
  }

  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdding(true)
    const { error } = await supabase.from('appliances').insert([{
      ...newProduct,
      price: parseFloat(newProduct.price) || null,
    }])
    if (!error) {
      setShowAddForm(false)
      setNewProduct({ category: 'Refrigerators', brand: '', model: '', title: '', price: '', product_url: '', image_url: '', type: '' })
      await fetchAppliances()
      await fetchCounts()
    }
    setAdding(false)
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setImporting(true)
    setImportResult(null)
    try {
      const text = await file.text()
      const lines = text.split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''))
      let added = 0, errors = 0
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim()
        if (!line) continue
        const values = line.split(',').map(v => v.trim().replace(/"/g, ''))
        const row: Record<string, any> = {}
        headers.forEach((header, index) => { row[header] = values[index] || null })
        if (row.price) row.price = parseFloat(row.price) || null
        if (row.list_price) row.list_price = parseFloat(row.list_price) || null
        if (row.rating) row.rating = parseFloat(row.rating) || null
        if (!row.category) row.category = selectedCategory
        const { error } = await supabase.from('appliances').insert([row])
        if (error) errors++
        else added++
      }
      setImportResult({ success: true, added, errors })
      await fetchAppliances()
      await fetchCounts()
    } catch {
      setImportResult({ success: false, added: 0, errors: 1 })
    }
    setImporting(false)
  }

  const handleDiscover = async () => {
    setDiscovering(true)
    setDiscoverResult(null)
    try {
      const res = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'discover', category: selectedCategory })
      })
      const data = await res.json()
      
      if (data.asins && data.asins.length > 0) {
        setFetchingDetails(true)
        const detailsRes = await fetch('/api/keepa', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'fetch-details', category: selectedCategory, asins: data.asins })
        })
        const detailsData = await detailsRes.json()
        setDiscoverResult({ ...data, details: detailsData })
        await fetchAppliances()
        await fetchCounts()
      } else {
        setDiscoverResult(data)
      }
    } catch (error: any) {
      setDiscoverResult({ success: false, error: error.message })
    }
    setDiscovering(false)
    setFetchingDetails(false)
  }

  const handleRefreshPrices = async () => {
    setRefreshingPrices(true)
    setRefreshResult(null)
    try {
      const res = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'refresh-prices', category: selectedCategory })
      })
      const data = await res.json()
      setRefreshResult(data)
      await fetchAppliances()
    } catch (error: any) {
      setRefreshResult({ success: false, error: error.message })
    }
    setRefreshingPrices(false)
  }

  const handleFullSync = async () => {
    setFullSyncing(true)
    setFullSyncResult(null)
    try {
      const res = await fetch('/api/keepa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'full-sync' })
      })
      const data = await res.json()
      setFullSyncResult(data)
      await fetchCounts()
      await fetchAppliances()
    } catch (error: any) {
      setFullSyncResult({ success: false, error: error.message })
    }
    setFullSyncing(false)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-slate-700 bg-black">
        <div className="px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-800 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold">Admin Dashboard</h1>
              <p className="text-xs text-slate-400">Manage appliance database</p>
            </div>
          </div>
          <Link href="/" className="text-blue-400 hover:text-blue-300 text-sm">← Back to Site</Link>
        </div>
      </header>

      <div className="px-4 py-6">
        {/* Full Sync */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="font-semibold mb-2 text-white">Full Sync (All Categories)</h2>
          <p className="text-sm text-slate-400 mb-4">Discovers new products and refreshes prices for ALL categories.</p>
          <button onClick={handleFullSync} disabled={fullSyncing} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50">
            {fullSyncing ? <><Loader2 className="w-4 h-4 animate-spin" />Running...</> : <><RefreshCw className="w-4 h-4" />Run Full Sync</>}
          </button>
          {fullSyncResult && (
            <div className={`mt-4 p-4 rounded-lg ${fullSyncResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {fullSyncResult.success ? (
                <div>
                  <div className="flex items-center gap-2 text-green-400 mb-2"><CheckCircle className="w-5 h-5" />Full Sync Complete</div>
                  <div className="text-sm space-y-1">
                    {fullSyncResult.results?.map((r: any, i: number) => (
                      <div key={i} className="flex justify-between text-slate-300">
                        <span>{r.category}</span>
                        <span>{r.error ? `Error: ${r.error}` : `+${r.created} new, ${r.updated} updated`}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />{fullSyncResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Category Selection */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="font-semibold mb-4 text-white">Products by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {allCategories.map(cat => (
              <button key={cat} onClick={() => setSelectedCategory(cat)} className={`p-4 rounded-lg text-center transition ${selectedCategory === cat ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'}`}>
                <div className="text-2xl font-bold">{counts[cat] || 0}</div>
                <div className="text-sm">{cat}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Keepa Actions */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="font-semibold mb-4 text-white">Keepa Actions for {selectedCategory}</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={handleDiscover} disabled={discovering || fetchingDetails} className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50">
              {discovering || fetchingDetails ? <><Loader2 className="w-4 h-4 animate-spin" />{fetchingDetails ? 'Fetching...' : 'Discovering...'}</> : <><Search className="w-4 h-4" />Discover New</>}
            </button>
            <button onClick={handleRefreshPrices} disabled={refreshingPrices} className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50">
              {refreshingPrices ? <><Loader2 className="w-4 h-4 animate-spin" />Refreshing...</> : <><RefreshCw className="w-4 h-4" />Refresh Prices</>}
            </button>
          </div>
          
          {discoverResult && (
            <div className={`mt-4 p-4 rounded-lg ${discoverResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {discoverResult.success ? (
                <div>
                  <div className="flex items-center gap-2 text-green-400"><CheckCircle className="w-5 h-5" />
                    Pages {discoverResult.pagesScanned}, found {discoverResult.totalFound}, {discoverResult.newAsins} new
                  </div>
                  {discoverResult.details && <div className="text-sm text-slate-400 mt-1">Added {discoverResult.details.created}, filtered {discoverResult.details.filteredOut || 0}</div>}
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />{discoverResult.error}</div>
              )}
            </div>
          )}
          
          {refreshResult && (
            <div className={`mt-4 p-4 rounded-lg ${refreshResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {refreshResult.success ? (
                <div className="flex items-center gap-2 text-green-400"><CheckCircle className="w-5 h-5" />Updated {refreshResult.updated} prices</div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />{refreshResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Manual Actions */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
          <h2 className="font-semibold mb-4 text-white">Manual Actions for {selectedCategory}</h2>
          <div className="flex flex-wrap gap-4">
            <button onClick={() => setShowAddForm(true)} className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <Plus className="w-4 h-4" />Add Product
            </button>
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer">
              <Upload className="w-4 h-4" />Import CSV
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" disabled={importing} />
            </label>
            <button onClick={handleCleanupDatabase} disabled={cleaning} className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50">
              {cleaning ? <><Loader2 className="w-4 h-4 animate-spin" />Cleaning...</> : <><Sparkles className="w-4 h-4" />Cleanup Parts & Low Price</>}
            </button>
            <button onClick={handleDeleteAll} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
              <Trash2 className="w-4 h-4" />Delete All
            </button>
          </div>
          
          {importing && <div className="mt-4 flex items-center gap-2 text-blue-400"><Loader2 className="w-4 h-4 animate-spin" />Importing...</div>}
          
          {importResult && (
            <div className={`mt-4 p-4 rounded-lg ${importResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {importResult.success ? (
                <div className="flex items-center gap-2 text-green-400"><CheckCircle className="w-5 h-5" />Imported {importResult.added} ({importResult.errors} errors)</div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />Import failed</div>
              )}
            </div>
          )}
          
          {cleanupResult && (
            <div className={`mt-4 p-4 rounded-lg ${cleanupResult.success ? 'bg-green-900/50 border border-green-700' : 'bg-red-900/50 border border-red-700'}`}>
              {cleanupResult.success ? (
                <div className="flex items-center gap-2 text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  Removed {cleanupResult.total} items ({cleanupResult.partsDeleted} parts, {cleanupResult.lowPriceDeleted} under ${MINIMUM_PRICE})
                </div>
              ) : (
                <div className="flex items-center gap-2 text-red-400"><AlertCircle className="w-5 h-5" />{cleanupResult.error}</div>
              )}
            </div>
          )}
        </div>

        {/* Add Product Form */}
        {showAddForm && (
          <div className="bg-slate-900 rounded-lg border border-slate-700 p-6 mb-6">
            <h2 className="font-semibold mb-4 text-white">Add New Product</h2>
            <form onSubmit={handleAddProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Category</label>
                <select value={newProduct.category} onChange={e => setNewProduct({ ...newProduct, category: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white">
                  {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Brand</label>
                <input type="text" value={newProduct.brand} onChange={e => setNewProduct({ ...newProduct, brand: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Model</label>
                <input type="text" value={newProduct.model} onChange={e => setNewProduct({ ...newProduct, model: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Title</label>
                <input type="text" value={newProduct.title} onChange={e => setNewProduct({ ...newProduct, title: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Price</label>
                <input type="number" step="0.01" value={newProduct.price} onChange={e => setNewProduct({ ...newProduct, price: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 text-slate-300">Type</label>
                <input type="text" value={newProduct.type} onChange={e => setNewProduct({ ...newProduct, type: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-300">Product URL</label>
                <input type="url" value={newProduct.product_url} onChange={e => setNewProduct({ ...newProduct, product_url: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium mb-1 text-slate-300">Image URL</label>
                <input type="url" value={newProduct.image_url} onChange={e => setNewProduct({ ...newProduct, image_url: e.target.value })} className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-white" />
              </div>
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" disabled={adding} className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50">{adding ? 'Adding...' : 'Add Product'}</button>
                <button type="button" onClick={() => setShowAddForm(false)} className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600">Cancel</button>
              </div>
            </form>
          </div>
        )}

        {/* Products Table */}
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden">
          <div className="p-4 border-b border-slate-700 flex flex-wrap justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold text-white">{selectedCategory} ({totalCount} total)</h2>
              {selectedIds.size > 0 && (
                <button 
                  onClick={handleBulkDelete} 
                  disabled={bulkDeleting}
                  className="flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                  {bulkDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Delete {selectedIds.size} Selected
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(0, p - 1))} 
                disabled={currentPage === 0}
                className="p-2 rounded hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-slate-300">Page {currentPage + 1} of {totalPages || 1}</span>
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} 
                disabled={currentPage >= totalPages - 1}
                className="p-2 rounded hover:bg-slate-700 disabled:opacity-30"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="p-8 text-center text-slate-400">Loading...</div>
          ) : appliances.length === 0 ? (
            <div className="p-8 text-center text-slate-400">No products. Use Keepa to discover products!</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800">
                  <tr>
                    <th className="text-left px-4 py-3">
                      <input 
                        type="checkbox" 
                        checked={selectedIds.size === appliances.length && appliances.length > 0}
                        onChange={toggleSelectAll}
                        className="rounded"
                      />
                    </th>
                    <th className="text-left px-4 py-3 text-slate-300">Image</th>
                    <th className="text-left px-4 py-3 text-slate-300">Brand</th>
                    <th className="text-left px-4 py-3 text-slate-300">Title</th>
                    <th className="text-left px-4 py-3 text-slate-300">Price</th>
                    <th className="text-left px-4 py-3 text-slate-300">Type</th>
                    <th className="text-left px-4 py-3 text-slate-300">Rating</th>
                  </tr>
                </thead>
                <tbody>
                  {appliances.map(item => (
                    <tr key={item.id} className={`border-t border-slate-700 hover:bg-slate-800 ${selectedIds.has(item.id) ? 'bg-slate-800' : ''}`}>
                      <td className="px-4 py-3">
                        <input 
                          type="checkbox" 
                          checked={selectedIds.has(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="rounded"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <ProductImage src={item.image_url} alt={item.title || ''} />
                      </td>
                      <td className="px-4 py-3 text-slate-300">{item.brand || '—'}</td>
                      <td className="px-4 py-3 text-slate-300 max-w-xs truncate" title={item.title}>{item.title || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{item.price ? `$${item.price}` : '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{item.type || '—'}</td>
                      <td className="px-4 py-3 text-slate-300">{item.rating ? `${item.rating}★` : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Bottom pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-700 flex justify-center items-center gap-2">
              <button onClick={() => setCurrentPage(0)} disabled={currentPage === 0} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300">First</button>
              <button onClick={() => setCurrentPage(p => Math.max(0, p - 1))} disabled={currentPage === 0} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300">Prev</button>
              <span className="text-sm px-4 text-slate-300">Page {currentPage + 1} of {totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(totalPages - 1, p + 1))} disabled={currentPage >= totalPages - 1} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300">Next</button>
              <button onClick={() => setCurrentPage(totalPages - 1)} disabled={currentPage >= totalPages - 1} className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 disabled:opacity-30 text-sm text-slate-300">Last</button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}